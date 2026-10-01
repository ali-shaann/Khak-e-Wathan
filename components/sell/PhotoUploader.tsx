"use client";

import Link from "next/link";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type UploadedImage = {
  name: string;
  path: string;
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
    createClient();

  const [images, setImages] =
    useState<UploadedImage[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const folder =
    `${userId}/${propertyId}`;

  /* -------------------------------------------------------
     Load photos already uploaded for this listing
  ------------------------------------------------------- */

  useEffect(() => {
    async function loadImages() {
      const {
        data,
        error,
      } = await supabase.storage
        .from("property-images")
        .list(folder, {
          limit: MAX_FILES,
          sortBy: {
            column: "created_at",
            order: "asc",
          },
        });

      if (error) {
        console.error(
          "PHOTO LIST ERROR:",
          error
        );

        setError(
          "Could not load existing property photos."
        );

        setLoading(false);
        return;
      }

      const loadedImages =
        (data ?? [])
          .filter(
            (file) =>
              file.name !== ".emptyFolderPlaceholder"
          )
          .map((file) => {
            const path =
              `${folder}/${file.name}`;

            const {
              data: publicData,
            } = supabase.storage
              .from("property-images")
              .getPublicUrl(path);

            return {
              name: file.name,
              path,
              url: publicData.publicUrl,
            };
          });

      setImages(
        loadedImages
      );

      setLoading(false);
    }

    loadImages();
  }, [
    folder,
    supabase,
  ]);

  /* -------------------------------------------------------
     Upload
  ------------------------------------------------------- */

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
      UploadedImage[] = [];

    for (
      const file of selectedFiles
    ) {
      const extension =
        getExtension(
          file.type
        );

      const filename =
        `${crypto.randomUUID()}.${extension}`;

      const path =
        `${folder}/${filename}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("property-images")
        .upload(
          path,
          file,
          {
            cacheControl:
              "3600",

            upsert: false,

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

      const {
        data: publicData,
      } = supabase.storage
        .from("property-images")
        .getPublicUrl(path);

      newlyUploaded.push({
        name: filename,
        path,
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

  /* -------------------------------------------------------
     Delete
  ------------------------------------------------------- */

  async function removeImage(
    image: UploadedImage
  ) {
    setError("");

    const {
      error: removeError,
    } = await supabase.storage
      .from("property-images")
      .remove([
        image.path,
      ]);

    if (removeError) {
      console.error(
        "PHOTO DELETE ERROR:",
        removeError
      );

      setError(
        removeError.message
      );

      return;
    }

    setImages(
      (current) =>
        current.filter(
          (item) =>
            item.path !==
            image.path
        )
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold">
            Property gallery
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add up to five JPG, PNG
            or WebP photos. Maximum
            size is 5 MB per image.
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
          {images.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map(
                (image, index) => (
                  <div
                    key={
                      image.path
                    }
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {/* Using normal img avoids needing
                          remote-image configuration during
                          this storage checkpoint. */}
                      <img
                        src={
                          image.url
                        }
                        alt={`Property photo ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                      {index === 0 && (
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

          {images.length === 0 && (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="font-semibold">
                No property photos yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add your first image
                below.
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
            The first photo currently
            acts as the cover photo.
            We'll add reordering during
            the final seller-workflow
            polish.
          </p>

          <Link
            href="/dashboard?message=Property submitted for review."
            className={`rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
              images.length > 0
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "pointer-events-none bg-slate-200 text-slate-400"
            }`}
          >
            Continue
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