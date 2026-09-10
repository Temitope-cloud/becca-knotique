import { PROSE_CLASS } from "@/lib/prose";

/**
 * Renders an admin-authored policy page (HTML from Settings). Used by the legal
 * pages when the owner has entered custom content; otherwise the built-in page
 * content is shown.
 */
export default function PolicyOverride({
  title,
  html,
}: {
  title: string;
  html: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
      <h1 className="font-apparel text-4xl tracking-tight text-stone-900 sm:text-5xl">
        {title}
      </h1>
      <div
        className={`mt-8 ${PROSE_CLASS}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
