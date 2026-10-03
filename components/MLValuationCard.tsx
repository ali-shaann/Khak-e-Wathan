import {
  getMlValuation,
  hasCompleteMlFeatures,
} from "@/lib/ml";

import type {
  Property,
} from "@/types/property";


export default async function MLValuationCard({
  property,
}: {
  property: Property;
}) {
  if (
    !hasCompleteMlFeatures(
      property
    )
  ) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Machine learning
            </p>

            <p className="mt-1.5 text-sm font-semibold text-slate-300">
              More property details needed
            </p>
          </div>


          <span className="rounded-full border border-slate-500/10 bg-slate-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Not available
          </span>
        </div>


        <p className="mt-3 text-xs leading-5 text-slate-500">
          The ML estimate is shown only when the listing has all model inputs.
          The explainable estimate remains available.
        </p>
      </div>
    );
  }


  const result =
    await getMlValuation(
      property
    );


  if (!result) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Machine learning
            </p>

            <p className="mt-1.5 text-sm font-semibold text-slate-300">
              Prediction service unavailable
            </p>
          </div>


          <span className="rounded-full border border-slate-500/10 bg-slate-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Offline
          </span>
        </div>


        <p className="mt-3 text-xs leading-5 text-slate-500">
          The explainable rule-based valuation remains available.
        </p>
      </div>
    );
  }


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


  const absoluteDifference =
    Math.abs(
      differencePercent
    );


  const comparisonLabel =
    absoluteDifference < 1
      ? "Very close to rule-based estimate"
      : differencePercent > 0
        ? `${absoluteDifference.toFixed(1)}% above rule-based estimate`
        : `${absoluteDifference.toFixed(1)}% below rule-based estimate`;


  return (
    <div className="mt-5 rounded-[1.5rem] border border-sky-400/10 bg-gradient-to-br from-sky-400/[0.08] to-white/[0.03] p-5">

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300">
              Machine learning
            </p>

            <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {result.modelType}
            </span>
          </div>


          <h3 className="mt-2 text-lg font-bold text-white">
            Random Forest prediction
          </h3>


          <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
            A second estimate generated from the trained synthetic-demo ML model.
          </p>
        </div>


        <div className="rounded-2xl bg-black/10 px-4 py-3 sm:min-w-[190px] sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            ML estimate
          </p>

          <p className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-sky-200">
            {formatPkr(
              result.predictedPricePkr
            )}
          </p>
        </div>
      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Rule-based midpoint
          </p>

          <p className="mt-1.5 text-sm font-semibold text-slate-200">
            {formatPkr(
              ruleBasedValue
            )}
          </p>
        </div>


        <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Model comparison
          </p>

          <p className="mt-1.5 text-sm font-semibold text-slate-200">
            {comparisonLabel}
          </p>
        </div>
      </div>


      <div className="mt-4 flex flex-wrap items-center gap-2">

        <span className="rounded-full border border-amber-300/10 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-200">
          Synthetic demo data
        </span>


        <span className="text-[11px] leading-5 text-slate-500">
          Not a professional appraisal or evidence of historical Chitral market prices.
        </span>
      </div>
    </div>
  );
}


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
