"use client";

import Link from "next/link";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
};

type DisplayImage =
  PropertyImage & {
    url: string;
  };

const MAX_FILES = 5;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function PhotoUploader({
  userId,
  propertyId,
}: {
  userId: string;
  propertyId: string;
}) {
  const supabase =
    useMemo(
      () => createClient(),
      []
    );

  const [images, setImages] =
    useState<DisplayImage[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const folder =
    `${userId}/${propertyId}`;

  /* ========================================================
     LOAD DATABASE IMAGE RECORDS
  ======================================================== */

  useEffect(() => {
    async function loadImages() {
      const {
        data,
        error: imageError,
      } = await supabase
        .from("property_images")
        .select(
          `
            id,
            property_id,
            storage_path,
            alt_text,
            display_order,
            is_primary,
            created_at
          `
        )
        .eq(
          "property_id",
          propertyId
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (imageError) {
        console.error(
          "PROPERTY IMAGE LOAD ERROR:",
          imageError
        );

        setError(
          "Could not load property photos."
        );

        setLoading(false);

        return;
      }

      const loadedImages =
        (data ?? []).map(
          (image) => {
            const {
              data: publicData,
            } = supabase.storage
              .from(
                "property-images"
              )
              .getPublicUrl(
                image.storage_path
              );

            return {
              ...image,
              url:
                publicData.publicUrl,
            };
          }
        );

      setImages(
        loadedImages
      );

      setLoading(false);
    }

    loadImages();
  }, [
    propertyId,
    supabase,
  ]);

  /* ========================================================
     UPLOAD
  ======================================================== */

  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? []
      );

    event.target.value = "";

    setError("");

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    if (
      images.length +
        selectedFiles.length >
      MAX_FILES
    ) {
      setError(
        `You can upload a maximum of ${MAX_FILES} photos.`
      );

      return;
    }

    for (
      const file of selectedFiles
    ) {
      if (
        !allowedTypes.has(
          file.type
        )
      ) {
        setError(
          "Only JPG, PNG and WebP images are allowed."
        );

        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          "Each photo must be 5 MB or smaller."
        );

        return;
      }
    }

    setUploading(true);

    const newlyUploaded:
      DisplayImage[] = [];

    for (
      let index = 0;
      index <
      selectedFiles.length;
      index++
    ) {
      const file =
        selectedFiles[index];

      const extension =
        getExtension(
          file.type
        );

      const filename =
        `${crypto.randomUUID()}.${extension}`;

      const storagePath =
        `${folder}/${filename}`;

      /* -----------------------------
         Upload actual file
      ----------------------------- */

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          "property-images"
        )
        .upload(
          storagePath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              file.type,
          }
        );

      if (uploadError) {
        console.error(
          "PHOTO UPLOAD ERROR:",
          uploadError
        );

        setError(
          uploadError.message
        );

        setUploading(false);

        return;
      }

      /* -----------------------------
         Create DB record
      ----------------------------- */

      const displayOrder =
        images.length +
        newlyUploaded.length;

      const shouldBePrimary =
        images.length === 0 &&
        newlyUploaded.length === 0;

      const {
        data: imageRecord,
        error: databaseError,
      } = await supabase
        .from(
          "property_images"
        )
        .insert({
          property_id:
            propertyId,

          storage_path:
            storagePath,

          alt_text:
            null,

          display_order:
            displayOrder,

          is_primary:
            shouldBePrimary,
        })
        .select(
          `
            id,
            property_id,
            storage_path,
            alt_text,
            display_order,
            is_primary,
            created_at
          `
        )
        .single();

      if (
        databaseError ||
        !imageRecord
      ) {
        console.error(
  "PROPERTY IMAGE DB ERROR:",
  {
    code:
      databaseError?.code,

    message:
      databaseError?.message,

    details:
      databaseError?.details,

    hint:
      databaseError?.hint,
  }
);


        // Storage succeeded but DB failed.
        // Remove the orphan file.
        await supabase.storage
          .from(
            "property-images"
          )
          .remove([
            storagePath,
          ]);

        setError(
          databaseError?.message ??
            "Could not save image information."
        );

        setUploading(false);

        return;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from(
          "property-images"
        )
        .getPublicUrl(
          storagePath
        );

      newlyUploaded.push({
        ...imageRecord,

        url:
          publicData.publicUrl,
      });
    }

    setImages(
      (current) => [
        ...current,
        ...newlyUploaded,
      ]
    );

    setUploading(false);
  }

  /* ========================================================
     REMOVE IMAGE
  ======================================================== */

  async function removeImage(
    image: DisplayImage
  ) {
    setError("");

    /* -----------------------------
       Remove DB row
    ----------------------------- */

    const {
      error: databaseError,
    } = await supabase
      .from(
        "property_images"
      )
      .delete()
      .eq(
        "id",
        image.id
      )
      .eq(
        "property_id",
        propertyId
      );

    if (databaseError) {
      console.error(
        "IMAGE DB DELETE ERROR:",
        databaseError
      );

      setError(
        databaseError.message
      );

      return;
    }

    /* -----------------------------
       Remove actual Storage file
    ----------------------------- */

    const {
      error: storageError,
    } = await supabase.storage
      .from(
        "property-images"
      )
      .remove([
        image.storage_path,
      ]);

    if (storageError) {
      console.error(
        "IMAGE STORAGE DELETE ERROR:",
        storageError
      );

      setError(
        "The image record was removed, but the stored file could not be deleted."
      );
    }

    const remainingImages =
      images.filter(
        (item) =>
          item.id !==
          image.id
      );

    setImages(
      remainingImages
    );

    /*
      If the primary image was removed,
      make the next photo primary.
    */
    if (
      image.is_primary &&
      remainingImages.length > 0
    ) {
      const nextPrimary =
        remainingImages[0];

      const {
        error: primaryError,
      } = await supabase
        .from(
          "property_images"
        )
        .update({
          is_primary:
            true,
        })
        .eq(
          "id",
          nextPrimary.id
        );

      if (!primaryError) {
        setImages(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                nextPrimary.id
                  ? {
                      ...item,
                      is_primary:
                        true,
                    }
                  : item
            )
        );
      }
    }
  }

  /* ========================================================
     UI
  ======================================================== */

  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold">
            Property gallery
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add up to five clear
            property photos.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
          {images.length} /{" "}
          {MAX_FILES}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-400">
          Loading photos...
        </div>
      ) : (
        <>
          {images.length >
            0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={
                      image.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={
                          image.url
                        }
                        alt={
                          image.alt_text ??
                          `Property photo ${
                            index +
                            1
                          }`
                        }
                        className="h-full w-full object-cover"
                      />

                      {image.is_primary && (
                        <span className="absolute left-3 top-3 rounded-full bg-slate-950/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Cover photo
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            image
                          )
                        }
                        className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {images.length ===
            0 && (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="font-semibold">
                No property photos yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add at least one
                image before continuing.
              </p>
            </div>
          )}

          {images.length <
            MAX_FILES && (
            <label
              className={`mt-6 flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold transition ${
                uploading
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {uploading
                ? "Uploading..."
                : "+ Add photos"}

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  uploading
                }
                onChange={
                  handleFiles
                }
                className="hidden"
              />
            </label>
          )}
        </>
      )}

      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-lg text-xs leading-5 text-slate-400">
            The primary image will
            become the property's
            cover photo.
          </p>

          <Link
            href={`/sell/review?property=${encodeURIComponent(
              propertyId
            )}`}
            className={`rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
              images.length >
              0
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "pointer-events-none bg-slate-200 text-slate-400"
            }`}
          >
            Continue to review
          </Link>
        </div>
      </div>
    </section>
  );
}


function getExtension(
  mimeType: string
) {
  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}