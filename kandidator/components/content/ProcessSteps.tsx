import type { ProcessStep } from "@/lib/content/types";

export function ProcessSteps({ title, steps }: { title: string; steps: ProcessStep[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="py-10">
      <h2 className="text-3xl">{title}</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-lg bg-secondary p-4">
            <p className="font-semibold text-accent">{index + 1}</p>
            <h3 className="mt-2 text-xl">{step.title}</h3>
            <p className="mt-2">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
