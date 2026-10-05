"use client";

import Link from "next/link";

import {
  ChangeEvent,
  DragEvent,
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


type UploadProgress = {
  total: number;
  completed: number;
  currentFile: string;
};


const MAX_FILES = 5;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;


const allowedTypes =
  new Set([
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
      () =>
        createClient(),
      []
    );


  const [
    images,
    setImages,
  ] =
    useState<
      DisplayImage[]
    >([]);


  const [
    uploading,
    setUploading,
  ] =
    useState(
      false
    );


  const [
    uploadProgress,
    setUploadProgress,
  ] =
    useState<
      UploadProgress | null
    >(
      null
    );


  const [
    removingImageId,
    setRemovingImageId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    updatingPrimaryImageId,
    setUpdatingPrimaryImageId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    notice,
    setNotice,
  ] =
    useState(
      ""
    );


  const folder =
    `${userId}/${propertyId}`;


  const interactionLocked =
    loading ||
    uploading ||
    removingImageId !==
      null ||
    updatingPrimaryImageId !==
      null;


  const remainingSlots =
    Math.max(
      0,
      MAX_FILES -
        images.length
    );


  const batchPercent =
    uploadProgress
      ? Math.round(
          (
            uploadProgress.completed /
            uploadProgress.total
          ) *
            100
        )
      : 0;


  /* ========================================================
     LOAD DATABASE IMAGE RECORDS
  ======================================================== */

  useEffect(
    () => {
      let active =
        true;


      async function loadImages() {
        const {
          data,
          error:
            imageError,
        } =
          await supabase
            .from(
              "property_images"
            )
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
                ascending:
                  true,
              }
            );


        if (!active) {
          return;
        }


        if (
          imageError
        ) {
          console.error(
            "PROPERTY IMAGE LOAD ERROR:",
            imageError
          );


          setError(
            "Could not load property photos."
          );


          setLoading(
            false
          );


          return;
        }


        const loadedImages =
          (
            data ??
            []
          ).map(
            (
              image
            ) => {
              const {
                data:
                  publicData,
              } =
                supabase.storage
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


        setLoading(
          false
        );
      }


      loadImages();


      return () => {
        active =
          false;
      };
    },
    [
      propertyId,
      supabase,
    ]
  );


  /* ========================================================
     FILE INPUT / DROP
  ======================================================== */

  async function handleFiles(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ??
          []
      );


    event.target.value =
      "";


    await uploadFiles(
      selectedFiles
    );
  }


  async function handleDrop(
    event:
      DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();


    if (
      interactionLocked
    ) {
      return;
    }


    const droppedFiles =
      Array.from(
        event.dataTransfer
          .files ??
          []
      );


    await uploadFiles(
      droppedFiles
    );
  }


  /* ========================================================
     UPLOAD
  ======================================================== */

  async function uploadFiles(
    selectedFiles:
      File[]
  ) {
    setError(
      ""
    );

    setNotice(
      ""
    );


    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }


    if (
      selectedFiles.length >
      remainingSlots
    ) {
      setError(
        `You can add ${remainingSlots} more ${
          remainingSlots ===
          1
            ? "photo"
            : "photos"
        }. The listing allows a maximum of ${MAX_FILES}.`
      );


      return;
    }


    for (
      const file of
      selectedFiles
    ) {
      if (
        !allowedTypes.has(
          file.type
        )
      ) {
        setError(
          `"${file.name}" is not supported. Use JPG, PNG or WebP.`
        );


        return;
      }


      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          `"${file.name}" is larger than 5 MB.`
        );


        return;
      }
    }


    setUploading(
      true
    );


    let completedCount =
      0;


    setUploadProgress({
      total:
        selectedFiles.length,

      completed:
        0,

      currentFile:
        selectedFiles[0]
          .name,
    });


    try {
      for (
        let index = 0;
        index <
        selectedFiles.length;
        index++
      ) {
        const file =
          selectedFiles[
            index
          ];


        setUploadProgress({
          total:
            selectedFiles.length,

          completed:
            completedCount,

          currentFile:
            file.name,
        });


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
          error:
            uploadError,
        } =
          await supabase.storage
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


        if (
          uploadError
        ) {
          console.error(
            "PHOTO UPLOAD ERROR:",
            uploadError
          );


          throw new Error(
            uploadError.message
          );
        }


        /* -----------------------------
           Create DB record
        ----------------------------- */

        const displayOrder =
          images.length +
          completedCount;


        const shouldBePrimary =
          images.length ===
            0 &&
          completedCount ===
            0;


        const {
          data:
            imageRecord,

          error:
            databaseError,
        } =
          await supabase
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
                databaseError
                  ?.code,

              message:
                databaseError
                  ?.message,

              details:
                databaseError
                  ?.details,

              hint:
                databaseError
                  ?.hint,
            }
          );


          /*
            Storage succeeded but the database row failed.
            Remove the orphan file before reporting the error.
          */

          await supabase.storage
            .from(
              "property-images"
            )
            .remove([
              storagePath,
            ]);


          throw new Error(
            databaseError
              ?.message ??
              "Could not save image information."
          );
        }


        const {
          data:
            publicData,
        } =
          supabase.storage
            .from(
              "property-images"
            )
            .getPublicUrl(
              storagePath
            );


        const displayImage:
          DisplayImage = {
          ...imageRecord,

          url:
            publicData.publicUrl,
        };


        /*
          Add each successful photo immediately. This keeps the UI
          truthful even if a later file in the same batch fails.
        */

        setImages(
          (
            current
          ) => [
            ...current,
            displayImage,
          ]
        );


        completedCount +=
          1;


        setUploadProgress({
          total:
            selectedFiles.length,

          completed:
            completedCount,

          currentFile:
            index +
              1 <
            selectedFiles.length
              ? selectedFiles[
                  index +
                    1
                ].name
              : file.name,
        });
      }


      setNotice(
        `${completedCount} ${
          completedCount ===
          1
            ? "photo"
            : "photos"
        } uploaded successfully.`
      );
    } catch (
      uploadFailure
    ) {
      const message =
        uploadFailure instanceof
        Error
          ? uploadFailure.message
          : "The upload could not be completed.";


      setError(
        completedCount >
          0
          ? `${completedCount} of ${selectedFiles.length} photos uploaded before the error: ${message}`
          : message
      );
    } finally {
      setUploading(
        false
      );


      setUploadProgress(
        null
      );
    }
  }


  /* ========================================================
     REMOVE IMAGE
  ======================================================== */

  async function removeImage(
    image:
      DisplayImage
  ) {
    if (
      interactionLocked
    ) {
      return;
    }


    setError(
      ""
    );

    setNotice(
      ""
    );

    setRemovingImageId(
      image.id
    );


    try {
      /* -----------------------------
         Remove DB row first
      ----------------------------- */

      const {
        error:
          databaseError,
      } =
        await supabase
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


      if (
        databaseError
      ) {
        console.error(
          "IMAGE DB DELETE ERROR:",
          databaseError
        );


        throw new Error(
          databaseError.message
        );
      }


      /* -----------------------------
         Remove Storage file
      ----------------------------- */

      const {
        error:
          storageError,
      } =
        await supabase.storage
          .from(
            "property-images"
          )
          .remove([
            image.storage_path,
          ]);


      if (
        storageError
      ) {
        console.error(
          "IMAGE STORAGE DELETE ERROR:",
          storageError
        );
      }


      const remainingImages =
        images.filter(
          (
            item
          ) =>
            item.id !==
            image.id
        );


      let finalImages =
        remainingImages;


      /*
        If the cover image was removed, make the next image
        the new cover image.
      */

      if (
        image.is_primary &&
        remainingImages.length >
          0
      ) {
        const nextPrimary =
          remainingImages[0];


        const {
          error:
            primaryError,
        } =
          await supabase
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
            )
            .eq(
              "property_id",
              propertyId
            );


        if (
          primaryError
        ) {
          console.error(
            "PRIMARY IMAGE UPDATE ERROR:",
            primaryError
          );


          setError(
            "The photo was removed, but the next cover photo could not be assigned. Refresh the page before continuing."
          );
        } else {
          finalImages =
            remainingImages.map(
              (
                item
              ) =>
                item.id ===
                nextPrimary.id
                  ? {
                      ...item,

                      is_primary:
                        true,
                    }
                  : item
            );
        }
      }


      setImages(
        finalImages
      );


      if (
        storageError
      ) {
        setError(
          "The photo was removed from the listing, but its stored file could not be deleted."
        );
      } else {
        setNotice(
          "Photo removed."
        );
      }
    } catch (
      removalFailure
    ) {
      setError(
        removalFailure instanceof
        Error
          ? removalFailure.message
          : "Could not remove the photo."
      );
    } finally {
      setRemovingImageId(
        null
      );
    }
  }


  async function setPrimaryImage(
    image:
      DisplayImage
  ) {
    if (
      interactionLocked ||
      image.is_primary
    ) {
      return;
    }


    setError(
      ""
    );

    setNotice(
      ""
    );

    setUpdatingPrimaryImageId(
      image.id
    );


    try {
      const {
        data,
        error:
          primaryError,
      } =
        await supabase.rpc(
          "seller_set_primary_property_image",
          {
            p_property_id:
              propertyId,

            p_image_id:
              image.id,
          }
        );


      if (
        primaryError ||
        data !==
          true
      ) {
        console.error(
          "SET PRIMARY IMAGE ERROR:",
          primaryError
        );


        throw new Error(
          primaryError
            ?.message ??
            "The cover photo could not be updated."
        );
      }


      setImages(
        (
          current
        ) =>
          current.map(
            (
              item
            ) => ({
              ...item,

              is_primary:
                item.id ===
                image.id,
            })
          )
      );


      setNotice(
        "Cover photo updated."
      );
    } catch (
      primaryFailure
    ) {
      setError(
        primaryFailure instanceof
        Error
          ? primaryFailure.message
          : "The cover photo could not be updated."
      );
    } finally {
      setUpdatingPrimaryImageId(
        null
      );
    }
  }


  /* ========================================================
     UI
  ======================================================== */

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

      <div className="p-6 sm:p-8">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Listing gallery
            </p>


            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
              Property photos
            </h2>


            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Add clear photos of the property, approach road and surroundings.
              The first photo becomes the cover image.
            </p>
          </div>


          <div className="self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
            {loading
              ? "Loading…"
              : `${images.length} / ${MAX_FILES} photos`}
          </div>
        </div>


        <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-400">

          <span className="rounded-full bg-slate-50 px-3 py-1.5">
            JPG, PNG or WebP
          </span>


          <span className="rounded-full bg-slate-50 px-3 py-1.5">
            Maximum 5 MB each
          </span>


          <span className="rounded-full bg-slate-50 px-3 py-1.5">
            Up to 5 photos
          </span>
        </div>


        <div
          aria-live="polite"
          className="contents"
        >
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">

              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </span>


              <span>
                {
                  error
                }
              </span>
            </div>
          )}


          {notice && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">

              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
                ✓
              </span>


              <span>
                {
                  notice
                }
              </span>
            </div>
          )}
        </div>


        {uploading &&
          uploadProgress && (
          <div className="mt-6 rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-r-transparent" />

                  <p className="text-sm font-bold text-sky-950">
                    Uploading photos…
                  </p>
                </div>


                <p className="mt-2 truncate text-xs text-sky-700/80">
                  {
                    uploadProgress.currentFile
                  }
                </p>
              </div>


              <div className="shrink-0 text-right">

                <p className="text-sm font-bold text-sky-950">
                  {uploadProgress.completed} / {uploadProgress.total}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-700/70">
                  complete
                </p>
              </div>
            </div>


            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100">

              <div
                className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
                style={{
                  width:
                    `${batchPercent}%`,
                }}
              />
            </div>


            <p className="mt-2 text-[10px] leading-5 text-sky-700/70">
              Batch progress advances when each photo finishes uploading.
            </p>
          </div>
        )}


        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[0, 1, 2].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"
                >
                  <div className="loading-shimmer aspect-[4/3]" />

                  <div className="p-4">
                    <div className="loading-shimmer h-3 w-24 rounded-full" />
                  </div>
                </div>
              )
            )}
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
                  ) => {
                    const removing =
                      removingImageId ===
                      image.id;

                    const updatingPrimary =
                      updatingPrimaryImageId ===
                      image.id;


                    return (
                      <article
                        key={
                          image.id
                        }
                        className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                      >

                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                          <img
                            src={
                              image.url
                            }
                            alt={
                              image.alt_text ??
                              `Property photo ${index + 1}`
                            }
                            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
                              removing
                                ? "opacity-50"
                                : ""
                            }`}
                          />


                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">

                            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-600 shadow-sm backdrop-blur">
                              Photo {index + 1}
                            </span>


                            {image.is_primary && (
                              <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur">
                                Cover
                              </span>
                            )}
                          </div>


                          {removing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[1px]">

                              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg">

                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-r-transparent" />

                                Removing…
                              </div>
                            </div>
                          )}
                        </div>


                        <div className="flex items-center justify-between gap-3 p-4">

                          <p className="text-xs text-slate-400">
                            {image.is_primary
                              ? "Shown first to buyers"
                              : "Gallery photo"}
                          </p>


                          <div className="flex items-center gap-2">
                            {!image.is_primary && (
                              <button
                                type="button"
                                disabled={
                                  interactionLocked
                                }
                                onClick={() =>
                                  setPrimaryImage(
                                    image
                                  )
                                }
                                className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updatingPrimary
                                  ? "Updating…"
                                  : "Make cover"}
                              </button>
                            )}


                            <button
                              type="button"
                              disabled={
                                interactionLocked
                              }
                              onClick={() =>
                                removeImage(
                                  image
                                )
                              }
                              className="rounded-full border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}


            {images.length ===
              0 &&
              !uploading && (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-slate-400 shadow-sm">
                  +
                </div>


                <p className="mt-4 font-bold">
                  No property photos yet
                </p>


                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Upload at least one image before moving to final review.
                </p>
              </div>
            )}


            {remainingSlots >
              0 && (
              <label
                onDragOver={(
                  event
                ) =>
                  event.preventDefault()
                }
                onDrop={
                  handleDrop
                }
                aria-disabled={
                  interactionLocked
                }
                className={`mt-6 flex min-h-[132px] items-center justify-center rounded-[1.5rem] border border-dashed px-5 py-6 text-center transition ${
                  interactionLocked
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30"
                }`}
              >
                <div>

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    ↑
                  </div>


                  <p className="mt-3 text-sm font-bold">
                    {uploading
                      ? "Upload in progress…"
                      : `Add ${remainingSlots} more ${
                          remainingSlots === 1
                            ? "photo"
                            : "photos"
                        }`}
                  </p>


                  <p className="mt-1 text-xs text-slate-400">
                    Choose files or drag and drop them here
                  </p>
                </div>


                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    interactionLocked
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
      </div>


      <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-semibold text-slate-600">
              {images.length >
              0
                ? `${images.length} ${
                    images.length ===
                    1
                      ? "photo"
                      : "photos"
                  } ready`
                : "At least one photo is required"}
            </p>


            <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-400">
              If the cover photo is removed, the next photo becomes the cover.
            </p>
          </div>


          {images.length >
            0 &&
          !interactionLocked ? (
            <Link
              href={`/sell/review?property=${encodeURIComponent(
                propertyId
              )}`}
              className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Continue to review →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="cursor-not-allowed rounded-full bg-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-400"
            >
              {uploading
                ? "Finish upload first"
                : removingImageId
                  ? "Updating gallery…"
                  : updatingPrimaryImageId
                    ? "Updating cover…"
                  : loading
                    ? "Loading photos…"
                    : "Continue to review"}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}


function getExtension(
  mimeType:
    string
) {
  switch (
    mimeType
  ) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}
