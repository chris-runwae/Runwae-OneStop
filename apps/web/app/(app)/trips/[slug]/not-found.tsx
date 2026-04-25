import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-bold">Trip not found</h1>
      <p className="mt-2 text-sm text-foreground/60">
        That trip doesn&apos;t exist, was deleted, or you don&apos;t have access.
      </p>
      <Link
        href="/home"
        className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
      >
        Back to home
      </Link>
    </main>
  );
}
