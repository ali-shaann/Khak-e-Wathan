import {
  PropertyVerification,
  VerificationStatus,
} from "@/types/property";

export default function VerificationPanel({
  verification,
}: {
  verification: PropertyVerification;
}) {
  const checks = [
    {
      label: "Seller identity",
      status: verification.sellerIdentity,
    },
    {
      label: "Property location",
      status: verification.location,
    },
    {
      label: "Property photos",
      status: verification.photos,
    },
    {
      label: "Ownership evidence submitted",
      status: verification.ownershipEvidence,
    },
    {
      label: "Physical inspection",
      status: verification.physicalInspection,
    },
  ];

  const verifiedCount = checks.filter(
    (check) => check.status === "verified"
  ).length;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Verification
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {verifiedCount}/5 checks completed
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          ✓
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {checks.map((check) => (
          <VerificationRow
            key={check.label}
            label={check.label}
            status={check.status}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs leading-5 text-slate-500">
          Verification indicates which checks have been
          completed. It does not represent a legal title
          guarantee or formal government verification.
        </p>
      </div>
    </section>
  );
}

function VerificationRow({
  label,
  status,
}: {
  label: string;
  status: VerificationStatus;
}) {
  const display = getStatusDisplay(status);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${display.className}`}
      >
        {display.text}
      </span>
    </div>
  );
}

function getStatusDisplay(
  status: VerificationStatus
) {
  if (status === "verified") {
    return {
      text: "Verified",
      className:
        "bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "pending") {
    return {
      text: "Pending",
      className:
        "bg-amber-50 text-amber-700",
    };
  }

  return {
    text: "Not checked",
    className:
      "bg-slate-100 text-slate-500",
  };
}