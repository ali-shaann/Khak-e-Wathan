import {
  getMlValuation,
} from "@/lib/ml";

import type {
  Property,
} from "@/types/property";


export default async function MLValuationCard({
  property,
}: {
  property: Property;
}) {
  const result =
    await getMlValuation(
      property
    );


  /* ========================================================
     ML SERVICE OFFLINE
  ======================================================== */

  if (!result) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              ML model
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-300">
              Prediction service unavailable
            </p>
          </div>

          <span className="rounded-full bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-400">
            Offline
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          The explainable rule-based valuation above
          remains available.
        </p>
      </div>
    );
  }


  /* ========================================================
     COMPARISON
  ======================================================== */

  const ruleBasedValue =
    property.valuation
      .estimatedValuePkr;

  const difference =
    result.predictedPricePkr -
    ruleBasedValue;

  const differencePercent =
    ruleBasedValue > 0
      ? (
          difference /
          ruleBasedValue
        ) * 100
      : 0;


  return (
    <div className="mt-6 rounded-[1.5rem] border border-sky-400/10 bg-sky-400/[0.06] p-5 sm:p-6">

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Machine learning
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            Model prediction
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Independent prediction from the trained
            Random Forest demonstration model.
          </p>
        </div>


        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            ML estimate
          </p>

          <p className="mt-2 text-2xl font-bold text-sky-200">
            {formatPkr(
              result.predictedPricePkr
            )}
          </p>
        </div>
      </div>


      {/* COMPARISON */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        <div className="rounded-2xl bg-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Rule-based midpoint
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-200">
            {formatPkr(
              ruleBasedValue
            )}
          </p>
        </div>


        <div className="rounded-2xl bg-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Difference
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-200">
            {differencePercent >
            0
              ? "+"
              : ""}
            {differencePercent.toFixed(
              1
            )}
            %
          </p>
        </div>
      </div>


      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs text-slate-400">
          {
            result.modelType
          }
        </span>

        <span className="rounded-full bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
          Synthetic demo data
        </span>
      </div>


      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        This ML prediction was trained using synthetic
        demonstration data. It is not evidence of actual
        historical Chitral property prices and should not
        be treated as a professional appraisal.
      </p>
    </div>
  );
}


/* ============================================================
   FORMAT PKR
============================================================ */

function formatPkr(
  value: number
): string {
  if (
    value >=
    10_000_000
  ) {
    return `PKR ${(
      value /
      10_000_000
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    )} Crore`;
  }


  if (
    value >=
    100_000
  ) {
    return `PKR ${(
      value /
      100_000
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits:
          2,
      }
    )} Lakh`;
  }


  return `PKR ${value.toLocaleString()}`;
}