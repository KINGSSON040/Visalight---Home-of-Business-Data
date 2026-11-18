export function Quote({ text, name, role }: { text?: string; name?: string; role?: string }) {
  if (!text?.trim() || !name?.trim() || !role?.trim()) return null;
  return (
    <figure className="mt-8 border-l-4 border-accent pl-4">
      <blockquote>{text}</blockquote>
      <figcaption className="mt-2">
        {name}, {role}
      </figcaption>
    </figure>
  );
}
