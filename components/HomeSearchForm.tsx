"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export default function HomeSearchForm() {
  const router =
    useRouter();

  const [
    query,
    setQuery,
  ] = useState("");

  function submitSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      router.push(
        "/properties"
      );

      return;
    }

    router.push(
      `/properties?q=${encodeURIComponent(
        cleanQuery
      )}`
    );
  }


  return (
    <form
      onSubmit={submitSearch}
      className="w-full"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Describe the property you're looking for..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-slate-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Search properties
        </button>
      </div>
    </form>
  );
}