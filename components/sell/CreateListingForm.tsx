"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useActionState,
} from "react";

import {
  createListing,
  type CreateListingState,
} from "@/app/sell/actions";


export default function CreateListingForm({
  children,
  initialError = "",
}: {
  children: ReactNode;
  initialError?: string;
}) {
  const initialState:
    CreateListingState = {
      error:
        initialError ||
        null,
    };


  const [
    state,
    formAction,
  ] =
    useActionState(
      createListing,
      initialState
    );


  const [
    clientError,
    setClientError,
  ] =
    useState(
      ""
    );


  const alertRef =
    useRef<HTMLDivElement>(
      null
    );


  const visibleError =
    clientError ||
    state.error ||
    "";


  useEffect(
    () => {
      if (
        visibleError
      ) {
        alertRef.current
          ?.scrollIntoView({
            block:
              "center",
          });
      }
    },
    [
      visibleError,
    ]
  );


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    setClientError(
      ""
    );


    const form =
      event.currentTarget;


    const formData =
      new FormData(
        form
      );


    const latitude =
      String(
        formData.get(
          "latitude"
        ) ??
          ""
      ).trim();


    const longitude =
      String(
        formData.get(
          "longitude"
        ) ??
          ""
      ).trim();


    if (
      !latitude ||
      !longitude
    ) {
      event.preventDefault();


      setClientError(
        "Please select the approximate property location on the map before continuing."
      );


      document
        .getElementById(
          "property-location-picker"
        )
        ?.scrollIntoView({
          block:
            "center",
        });
    }
  }


  return (
    <>
      {visibleError && (
        <div
          ref={
            alertRef
          }
          role="alert"
          aria-live="polite"
          className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
            !
          </span>


          <span>
            {
              visibleError
            }
          </span>
        </div>
      )}


      <form
        action={
          formAction
        }
        onSubmit={
          handleSubmit
        }
        className="mt-8 space-y-6"
      >
        {
          children
        }
      </form>
    </>
  );
}
