"use client";

export default function UserLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-col bg-transparent relative z-10 pt-28">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
