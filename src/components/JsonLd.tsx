/**
 * Renders one or more schema.org objects as a JSON-LD <script>. Server-safe.
 * Pass a single object or an array; arrays are emitted as a @graph.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const json = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
