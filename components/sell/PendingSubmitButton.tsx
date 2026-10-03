"use client";

import {
  useFormStatus,
} from "react-dom";


export default function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  className = "",
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const {
    pending,
  } =
    useFormStatus();


  return (
    <button
      type="submit"
      disabled={
        pending
      }
      aria-disabled={
        pending
      }
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-65`}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}

      <span>
        {pending
          ? pendingLabel
          : idleLabel}
      </span>
    </button>
  );
}
