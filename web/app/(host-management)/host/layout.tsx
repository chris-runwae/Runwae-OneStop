import Sidebar from "./_sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="shrink-0 border-b border-border bg-surface px-6 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7">
          <h1 className="font-display text-xl font-bold text-black">
            Welcome Admin 👋
          </h1>
        </header>

        <main className="flex-1 overflow-auto bg-page">{children}</main>
      </div>
    </div>
  );
}
