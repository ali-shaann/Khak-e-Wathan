import Navbar from "@/components/Navbar";


export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">

      <Navbar />


      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="loading-shimmer h-3 w-32 rounded-full" />

        <div className="mt-4 loading-shimmer h-12 max-w-xl rounded-2xl" />

        <div className="mt-4 loading-shimmer h-5 max-w-2xl rounded-full" />


        <div className="mt-10 grid gap-5 lg:grid-cols-2">

          {[0, 1, 2, 3].map(
            (
              item
            ) => (
              <div
                key={
                  item
                }
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white"
              >
                <div className="loading-shimmer aspect-[16/8]" />

                <div className="space-y-3 p-6">
                  <div className="loading-shimmer h-4 w-28 rounded-full" />
                  <div className="loading-shimmer h-7 w-4/5 rounded-xl" />
                  <div className="loading-shimmer h-4 w-2/3 rounded-full" />
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
