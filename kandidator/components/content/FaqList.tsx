import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RichText } from "@/components/content/RichText";
import type { FaqItem } from "@/lib/content/types";

export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <Accordion type="single" collapsible>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-b border-border">
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <RichText text={item.answer} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
