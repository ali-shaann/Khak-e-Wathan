import Navbar from "@/components/Navbar";


export default function PropertiesLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="loading-shimmer h-3 w-32 rounded-full" />

          <div className="mt-4 loading-shimmer h-12 max-w-xl rounded-2xl" />

          <div className="mt-4 loading-shimmer h-5 max-w-2xl rounded-full" />
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">

          <div className="loading-shimmer h-14 rounded-2xl" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="loading-shimmer h-12 rounded-2xl"
                />
              )
            )}
          </div>
        </div>


        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {[0, 1, 2, 3, 4, 5].map(
            (
              item
            ) => (
              <div
                key={
                  item
                }
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
              >

                <div className="loading-shimmer aspect-[16/10]" />

                <div className="space-y-3 p-5">

                  <div className="loading-shimmer h-6 w-2/5 rounded-full" />

                  <div className="loading-shimmer h-5 w-4/5 rounded-full" />

                  <div className="loading-shimmer h-4 w-1/2 rounded-full" />
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
