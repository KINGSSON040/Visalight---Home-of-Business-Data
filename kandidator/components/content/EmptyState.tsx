export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-3 max-w-2xl">{text}</p>
    </div>
  );
}
