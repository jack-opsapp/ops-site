'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-caption text-ops-text-secondary uppercase tracking-[0.2em] text-[11px] mb-4">
        [error]
      </p>
      <h1 className="font-heading font-bold text-4xl md:text-5xl text-ops-text-primary leading-tight mb-4">
        SOMETHING WENT WRONG
      </h1>
      <p className="font-body text-ops-text-secondary text-sm max-w-md mb-8">
        An unexpected error occurred. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-6 py-3 bg-ops-accent text-white font-heading font-semibold text-sm uppercase tracking-wide rounded transition-colors hover:bg-ops-accent/90"
      >
        Try Again
      </button>
    </div>
  );
}
