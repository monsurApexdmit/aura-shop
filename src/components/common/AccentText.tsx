import { Fragment } from "react";
import { cn } from "@/lib/utils";

// Admin-written headlines mark accent words with *asterisks*; line breaks are kept.
export function AccentText({ text, accentClassName }: { text: string; accentClassName?: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
            /^\*[^*]+\*$/.test(part)
              ? <em key={pi} className={cn("font-bold", accentClassName)}>{part.slice(1, -1)}</em>
              : <Fragment key={pi}>{part}</Fragment>
          )}
        </Fragment>
      ))}
    </>
  );
}
