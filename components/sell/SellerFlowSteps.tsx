import Link from "next/link";


type FlowStep =
  1 | 2 | 3;


export default function SellerFlowSteps({
  current,
  propertyId,
}: {
  current: FlowStep;
  propertyId?: string;
}) {
  const steps = [
    {
      number: 1 as const,
      label:
        "Details",
      description:
        "Property information",
    },
    {
      number: 2 as const,
      label:
        "Photos",
      description:
        "Listing gallery",
    },
    {
      number: 3 as const,
      label:
        "Review",
      description:
        "Final check",
    },
  ];


  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

      <div className="grid gap-2 sm:grid-cols-3">

        {steps.map(
          (
            step
          ) => {
            const completed =
              step.number <
              current;

            const active =
              step.number ===
              current;

            const href =
              step.number === 1
                ? propertyId
                  ? `/sell/edit/${encodeURIComponent(
                      propertyId
                    )}`
                  : "/sell"
                : step.number === 2 &&
                    propertyId
                  ? `/sell/photos?property=${encodeURIComponent(
                      propertyId
                    )}`
                  : step.number === 3 &&
                      propertyId
                    ? `/sell/review?property=${encodeURIComponent(
                        propertyId
                      )}`
                    : null;


            const content = (
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : completed
                      ? "bg-emerald-50 text-emerald-900"
                      : "bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? "bg-white text-slate-950"
                      : completed
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500"
                  }`}
                >
                  {completed
                    ? "✓"
                    : step.number}
                </div>


                <div className="min-w-0">

                  <p className="text-sm font-bold">
                    {
                      step.label
                    }
                  </p>


                  <p
                    className={`mt-0.5 truncate text-[10px] ${
                      active
                        ? "text-slate-300"
                        : completed
                          ? "text-emerald-700"
                          : "text-slate-400"
                    }`}
                  >
                    {
                      step.description
                    }
                  </p>
                </div>
              </div>
            );


            if (
              href &&
              (completed ||
                active)
            ) {
              return (
                <Link
                  key={
                    step.number
                  }
                  href={
                    href
                  }
                  className="rounded-2xl focus-visible:outline-none"
                >
                  {
                    content
                  }
                </Link>
              );
            }


            return (
              <div
                key={
                  step.number
                }
              >
                {
                  content
                }
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
