// Minimal HTML entity escaping for values interpolated into email/HTML
// templates built via string concatenation (no JSX/React escaping applies
// there). Covers the five characters that matter for breaking out of text
// content or a double-quoted attribute.
export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
