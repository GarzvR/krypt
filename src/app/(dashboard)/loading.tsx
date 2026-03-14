export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {[1, 2, 3].map((item, index, list) => (
          <article
            key={item}
            className={`bg-white/[0.03] px-5 py-5 ${
              index < list.length - 1 ? "border-b border-app md:border-b-0 md:border-r" : ""
            }`}
          >
            <div className="h-4 w-24 bg-white/10" />
            <div className="mt-4 h-12 w-16 bg-white/20" />
          </article>
        ))}
      </div>

      <section className="border border-app bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-app px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-6 w-32 bg-white/10" />
          <div className="h-11 w-36 bg-white/5 border border-app" />
        </div>
        <div className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="h-12 bg-white/5 border border-app" />
          <div className="h-12 w-36 bg-app-primary/50" />
        </div>
      </section>

      <div className="space-y-6">
        {[1, 2].map((project) => (
          <div key={project} className="border border-app bg-white/[0.03]">
            <div className="border-b border-app px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="h-8 w-48 bg-white/20" />
                  <div className="mt-2 h-4 w-64 bg-white/5" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="border border-app px-4 py-4">
                    <div className="h-4 w-24 bg-white/10" />
                    <div className="mt-3 h-8 w-12 bg-white/20" />
                  </div>
                  <div className="border border-app px-4 py-4">
                    <div className="h-4 w-20 bg-white/10" />
                    <div className="mt-3 h-8 w-12 bg-white/20" />
                  </div>
                  <div className="flex items-center justify-center border border-app px-5 py-4">
                    <div className="h-6 w-6 bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5">
              <div className="h-32 bg-white/5 border border-app" />
              <div className="h-48 bg-white/5 border border-app" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
