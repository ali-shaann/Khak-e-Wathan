import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

await loadEnvFile(path.join(projectRoot, ".env.local"));

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Add it only to your local .env.local, never commit or share it."
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const bucket = "property-images";

const manifest = JSON.parse(
  await fs.readFile(
    path.join(projectRoot, "demo-seed-manifest.json"),
    "utf8"
  )
);

const expectedIds =
  manifest.map((item) => item.id);

/* ------------------------------------------------------------
   SAFETY CHECK
   SQL must be run first. Do not clear storage if the seed rows
   do not exist yet.
------------------------------------------------------------ */

const {
  data: seededRows,
  error: seededRowsError,
} = await supabase
  .from("properties")
  .select("id")
  .in("id", expectedIds);

if (seededRowsError) {
  throw seededRowsError;
}

const foundIds =
  new Set((seededRows ?? []).map((row) => row.id));

const missingIds =
  expectedIds.filter((id) => !foundIds.has(id));

if (missingIds.length > 0) {
  throw new Error(
    `Seed SQL has not been applied yet. Missing property rows: ${missingIds.join(", ")}`
  );
}

console.log(
  `Found all ${expectedIds.length} seeded properties.`
);

/* ------------------------------------------------------------
   CLEAR EXISTING PROPERTY IMAGE STORAGE
------------------------------------------------------------ */

const existingFiles =
  await collectAllFiles("");

if (existingFiles.length > 0) {
  console.log(
    `Removing ${existingFiles.length} existing file(s) from ${bucket}...`
  );

  for (
    let index = 0;
    index < existingFiles.length;
    index += 100
  ) {
    const chunk =
      existingFiles.slice(
        index,
        index + 100
      );

    const {
      error: removeError,
    } = await supabase.storage
      .from(bucket)
      .remove(chunk);

    if (removeError) {
      throw removeError;
    }
  }
}

/* ------------------------------------------------------------
   CLEAR IMAGE METADATA
   (SQL already does this, but repeating it makes the uploader
   safe to rerun after a partial image upload.)
------------------------------------------------------------ */

const {
  error: deleteMetadataError,
} = await supabase
  .from("property_images")
  .delete()
  .not("id", "is", null);

if (deleteMetadataError) {
  throw deleteMetadataError;
}

/* ------------------------------------------------------------
   UPLOAD 2 REPRESENTATIVE DEMO IMAGES PER PROPERTY
------------------------------------------------------------ */

const imageRows = [];

for (const item of manifest) {
  for (
    let index = 0;
    index < item.images.length;
    index++
  ) {
    const filename =
      item.images[index];

    const localPath =
      path.join(
        projectRoot,
        "demo-seed-images",
        item.id,
        filename
      );

    const bytes =
      await fs.readFile(localPath);

    const storagePath =
      `demo-seed/${item.id}/${filename}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(bucket)
      .upload(
        storagePath,
        bytes,
        {
          contentType:
            "image/jpeg",

          cacheControl:
            "3600",

          upsert:
            true,
        }
      );

    if (uploadError) {
      throw new Error(
        `Upload failed for ${storagePath}: ${uploadError.message}`
      );
    }

    imageRows.push({
      property_id:
        item.id,

      storage_path:
        storagePath,

      alt_text:
        `Representative demo visual for ${item.title}. Synthetic illustration; not an actual parcel photograph.`,

      display_order:
        index,

      is_primary:
        index === 0,
    });

    console.log(
      `Uploaded ${storagePath}`
    );
  }
}

const {
  error: insertError,
} = await supabase
  .from("property_images")
  .insert(imageRows);

if (insertError) {
  throw insertError;
}

/* ------------------------------------------------------------
   VERIFY
------------------------------------------------------------ */

const {
  count: propertyCount,
  error: propertyCountError,
} = await supabase
  .from("properties")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("listing_status", "active");

if (propertyCountError) {
  throw propertyCountError;
}

const {
  count: imageCount,
  error: imageCountError,
} = await supabase
  .from("property_images")
  .select("*", {
    count: "exact",
    head: true,
  });

if (imageCountError) {
  throw imageCountError;
}

console.log("");
console.log("Demo seed upload complete.");
console.log(`Active properties: ${propertyCount}`);
console.log(`Image rows: ${imageCount}`);
console.log("Expected: 15 active properties and 30 image rows.");
console.log("");
console.log(
  "SECURITY: remove SUPABASE_SERVICE_ROLE_KEY from .env.local after this one-time seed."
);


/* ============================================================
   HELPERS
============================================================ */

async function collectAllFiles(
  prefix
) {
  const files = [];
  let offset = 0;

  while (true) {
    const {
      data,
      error,
    } = await supabase.storage
      .from(bucket)
      .list(
        prefix,
        {
          limit: 100,
          offset,
          sortBy: {
            column:
              "name",

            order:
              "asc",
          },
        }
      );

    if (error) {
      throw error;
    }

    const items =
      data ?? [];

    for (const item of items) {
      const itemPath =
        prefix
          ? `${prefix}/${item.name}`
          : item.name;

      /*
        Supabase Storage folders are virtual. Folder entries
        normally have no id / metadata, while real objects do.
      */
      if (
        item.id ||
        item.metadata
      ) {
        files.push(
          itemPath
        );
      } else {
        files.push(
          ...(
            await collectAllFiles(
              itemPath
            )
          )
        );
      }
    }

    if (
      items.length <
      100
    ) {
      break;
    }

    offset +=
      items.length;
  }

  return files;
}


async function loadEnvFile(
  filePath
) {
  try {
    const raw =
      await fs.readFile(
        filePath,
        "utf8"
      );

    for (
      const rawLine of
      raw.split(/\r?\n/)
    ) {
      const line =
        rawLine.trim();

      if (
        !line ||
        line.startsWith("#")
      ) {
        continue;
      }

      const separator =
        line.indexOf("=");

      if (
        separator <= 0
      ) {
        continue;
      }

      const key =
        line
          .slice(
            0,
            separator
          )
          .trim();

      let value =
        line
          .slice(
            separator + 1
          )
          .trim();

      if (
        (
          value.startsWith('"') &&
          value.endsWith('"')
        ) ||
        (
          value.startsWith("'") &&
          value.endsWith("'")
        )
      ) {
        value =
          value.slice(
            1,
            -1
          );
      }

      if (
        process.env[key] ===
        undefined
      ) {
        process.env[key] =
          value;
      }
    }
  } catch (
    error
  ) {
    if (
      error?.code !==
      "ENOENT"
    ) {
      throw error;
    }
  }
}
