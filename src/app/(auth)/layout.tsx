export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app px-6 py-10 text-app-foreground sm:px-8 lg:px-10">
      <div className="overlay-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="glass-panel-strong w-full px-6 py-7 sm:px-8 sm:py-8">
          <div className="border-b border-app pb-5">
            <p className="text-base font-semibold text-app-foreground">Krypt</p>

          </div>
          <div className="pt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
