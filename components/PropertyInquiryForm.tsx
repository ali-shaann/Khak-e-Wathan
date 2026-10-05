"use client";

import Link from "next/link";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  createPropertyInquiry,
  type PropertyInquiryState,
} from "@/app/properties/actions";

import PendingSubmitButton from "@/components/sell/PendingSubmitButton";


const initialState:
  PropertyInquiryState = {
  status:
    "idle",

  message:
    "",
};


export default function PropertyInquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const formRef =
    useRef<HTMLFormElement>(
      null
    );

  const [
    state,
    formAction,
  ] =
    useActionState(
      createPropertyInquiry,
      initialState
    );


  useEffect(
    () => {
      if (
        state.status ===
        "success"
      ) {
        formRef.current
          ?.reset();
      }
    },
    [
      state.status,
    ]
  );


  return (
    <section
      id="request-viewing"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]"
    >

      <div className="p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-950/20">
            ↗
          </div>


          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              Private buyer request
            </p>


            <h2 className="mt-1.5 text-2xl font-bold">
              Request a viewing
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-400">
              Send a private request without exposing seller contact details on
              the public listing.
            </p>
          </div>
        </div>


        {state.status ===
        "success" ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5"
          >
            <div className="flex items-start gap-3">

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-300 font-bold text-slate-950">
                ✓
              </span>


              <div>
                <p className="font-bold text-emerald-100">
                  Request sent
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                  {
                    state.message
                  }
                </p>
              </div>
            </div>


            <Link
              href="/properties"
              className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Continue exploring properties
            </Link>
          </div>
        ) : (
          <>
            {state.message && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
              >
                {
                  state.message
                }
              </div>
            )}


            <form
              ref={
                formRef
              }
              action={
                formAction
              }
              className="mt-6 space-y-4"
            >

              <input
                type="hidden"
                name="propertyId"
                value={
                  propertyId
                }
              />


              <div
                aria-hidden="true"
                className="absolute -left-[10000px] h-px w-px overflow-hidden"
              >
                <label>
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>


              <InquiryField
                label="Your name"
                name="buyerName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
              />


              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <InquiryField
                  label="Phone"
                  hint="One contact method required"
                  name="buyerPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+92..."
                />

                <InquiryField
                  label="Email"
                  name="buyerEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>


              <label className="block">

                <span className="mb-2 block text-xs font-semibold text-slate-300">
                  Message
                </span>


                <textarea
                  required
                  minLength={5}
                  maxLength={1000}
                  name="message"
                  rows={4}
                  defaultValue={`I would like to arrange a viewing for ${propertyTitle}.`}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                />
              </label>


              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] leading-5 text-slate-400">
                  Your details are shared only with the property seller and
                  platform administrators.
                </p>
              </div>


              <PendingSubmitButton
                idleLabel="Send viewing request"
                pendingLabel="Sending request…"
                className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
              />
            </form>
          </>
        )}
      </div>
    </section>
  );
}


function InquiryField({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  hint,
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-semibold text-slate-300">
        {
          label
        }

        {hint && (
          <span className="ml-2 font-normal text-slate-500">
            {
              hint
            }
          </span>
        )}
      </span>


      <input
        required={
          required
        }
        name={
          name
        }
        type={
          type
        }
        autoComplete={
          autoComplete
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
      />
    </label>
  );
}
