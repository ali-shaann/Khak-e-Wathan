import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createClient,
} from "@supabase/supabase-js";


const scriptDir =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );

const projectRoot =
  path.resolve(
    scriptDir,
    ".."
  );


await loadEnvFile(
  path.join(
    projectRoot,
    ".env.local"
  )
);


const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;


if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
}


const accounts = [
  {
    role:
      "seller",

    email:
      requireValue(
        "DEMO_SELLER_EMAIL"
      ),

    password:
      requirePassword(
        "DEMO_SELLER_PASSWORD"
      ),

    fullName:
      process.env
        .DEMO_SELLER_NAME
        ?.trim() ||
      "Demo Seller",
  },
  {
    role:
      "admin",

    email:
      requireValue(
        "DEMO_ADMIN_EMAIL"
      ),

    password:
      requirePassword(
        "DEMO_ADMIN_PASSWORD"
      ),

    fullName:
      process.env
        .DEMO_ADMIN_NAME
        ?.trim() ||
      "Demo Administrator",
  },
];


const supabase =
  createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,
      },
    }
  );


for (
  const account of
  accounts
) {
  const existing =
    await findUserByEmail(
      account.email
    );

  let userId;


  if (existing) {
    const {
      data,
      error,
    } =
      await supabase.auth
        .admin
        .updateUserById(
          existing.id,
          {
            password:
              account.password,

            email_confirm:
              true,

            user_metadata: {
              full_name:
                account.fullName,
            },
          }
        );


    if (
      error ||
      !data.user
    ) {
      throw new Error(
        `Could not update ${account.role} demo user: ${error?.message ?? "unknown error"}`
      );
    }


    userId =
      data.user.id;
  } else {
    const {
      data,
      error,
    } =
      await supabase.auth
        .admin
        .createUser({
          email:
            account.email,

          password:
            account.password,

          email_confirm:
            true,

          user_metadata: {
            full_name:
              account.fullName,
          },
        });


    if (
      error ||
      !data.user
    ) {
      throw new Error(
        `Could not create ${account.role} demo user: ${error?.message ?? "unknown error"}`
      );
    }


    userId =
      data.user.id;
  }


  const {
    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles"
      )
      .upsert({
        id:
          userId,

        full_name:
          account.fullName,

        role:
          account.role,
      });


  if (
    profileError
  ) {
    throw new Error(
      `Could not update ${account.role} profile: ${profileError.message}`
    );
  }


  console.log(
    `Prepared ${account.role} account: ${account.email}`
  );
}


console.log("");
console.log(
  "Demo users are ready. Remove SUPABASE_SERVICE_ROLE_KEY from .env.local now."
);


async function findUserByEmail(
  email
) {
  let page =
    1;


  while (true) {
    const {
      data,
      error,
    } =
      await supabase.auth
        .admin
        .listUsers({
          page,
          perPage:
            1000,
        });


    if (error) {
      throw error;
    }


    const user =
      data.users.find(
        (
          candidate
        ) =>
          candidate.email
            ?.toLowerCase() ===
          email.toLowerCase()
      );


    if (user) {
      return user;
    }


    if (
      data.users.length <
      1000
    ) {
      return null;
    }


    page++;
  }
}


function requireValue(
  key
) {
  const value =
    process.env[key]
      ?.trim();


  if (!value) {
    throw new Error(
      `Missing ${key} in .env.local.`
    );
  }


  return value;
}


function requirePassword(
  key
) {
  const password =
    requireValue(
      key
    );


  if (
    password.length <
    8
  ) {
    throw new Error(
      `${key} must contain at least 8 characters.`
    );
  }


  return password;
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
      raw.split(
        /\r?\n/
      )
    ) {
      const line =
        rawLine.trim();


      if (
        !line ||
        line.startsWith(
          "#"
        )
      ) {
        continue;
      }


      const separator =
        line.indexOf(
          "="
        );


      if (
        separator <=
        0
      ) {
        continue;
      }


      const key =
        line.slice(
          0,
          separator
        ).trim();

      let value =
        line.slice(
          separator +
            1
        ).trim();


      if (
        (
          value.startsWith(
            "\""
          ) &&
          value.endsWith(
            "\""
          )
        ) ||
        (
          value.startsWith(
            "'"
          ) &&
          value.endsWith(
            "'"
          )
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
      error &&
      typeof error ===
        "object" &&
      "code" in error &&
      error.code ===
        "ENOENT"
    ) {
      return;
    }


    throw error;
  }
}
