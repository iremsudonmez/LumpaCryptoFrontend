// small spinning circle -> used inside buttons and loading states
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent ${className}`}
      aria-label="Loading"
    />
  );
}