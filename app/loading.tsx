export default function Loading() {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-emerald-100/80">
        <span className="page-loading-bar" />
      </div>

      <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="loading-shimmer h-4 w-28 rounded-full" />

          <div className="loading-shimmer mt-5 h-12 w-full max-w-xl rounded-2xl" />

          <div className="loading-shimmer mt-4 h-5 w-full max-w-2xl rounded-full" />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3"
                >
                  <div className="loading-shimmer aspect-[16/10] rounded-[1.25rem]" />

                  <div className="p-3">

                    <div className="loading-shimmer h-5 w-28 rounded-full" />

                    <div className="loading-shimmer mt-3 h-5 w-3/4 rounded-full" />

                    <div className="loading-shimmer mt-5 h-12 w-full rounded-2xl" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
