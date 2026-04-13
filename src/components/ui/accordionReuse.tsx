import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MinusIcon, PlusIcon } from "lucide-react";

const items = [
  {
    value: "duration",
    trigger: "How long does it take to make an order?",
    content:
      "Each piece is handmade, so production typically takes 3–7 days depending on the design and complexity. We’ll always keep you updated on your order.",
  },
  {
    value: "customdesign",
    trigger: "Do you offer custom designs?",
    content:
      "Yes, we do! You can request custom pieces based on your preferred style, color, or inspiration. Simply reach out and we’ll bring your idea to life.",
  },
  {
    value: "refund",
    trigger: "Do you accept returns or refunds?",
    content:
      "Due to the handmade nature of our products, we do not accept returns on custom orders. However, if there’s an issue with your order, please contact us and we’ll make it right.",
  },
];

export function AccordionReuse() {
  return (
    <div className="mb-auto w-full max-w-lg">
      <Accordion type="single" defaultValue="account">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger className="hover:no-underline *:data-[slot=accordion-trigger-icon]:hidden">
              <span>{item.trigger}</span>
              <PlusIcon className="text-muted-foreground ml-auto size-3.5 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:hidden" />
              <MinusIcon className="text-muted-foreground ml-auto hidden size-3.5 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:inline" />
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
