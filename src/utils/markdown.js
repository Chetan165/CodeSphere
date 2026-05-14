// Minimal markdown to HTML converter for admin preview and solve page
export function markdownToHtml(md = "") {
  if (!md) return "";
  let s = String(md || "");
  s = s.replace(/\r\n/g, "\n");

  // Code fences
  s = s.replace(/```([\s\S]*?)```/g, (m, code) => {
    return "<pre><code>" + escapeHtml(code) + "</code></pre>";
  });

  // Inline code
  s = s.replace(/`([^`]+)`/g, (m, c) => `<code>${escapeHtml(c)}</code>`);

  // Headings
  s = s.replace(/^######\s*(.*)$/gm, "<h6>$1</h6>");
  s = s.replace(/^#####\s*(.*)$/gm, "<h5>$1</h5>");
  s = s.replace(/^####\s*(.*)$/gm, "<h4>$1</h4>");
  s = s.replace(/^###\s*(.*)$/gm, "<h3>$1</h3>");
  s = s.replace(/^##\s*(.*)$/gm, "<h2>$1</h2>");
  s = s.replace(/^#\s*(.*)$/gm, "<h1>$1</h1>");

  // Bold / italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Lists (simple)
  s = s.replace(/(^|\n)([ \t]*[-+*] )(.+)(?=\n|$)/g, (m, pre, bullet, rest) => {
    return (
      "\n<ul>\n<li>" +
      rest.replace(/\n[ \t]*[-+*] /g, "</li>\n<li>") +
      "</li>\n</ul>\n"
    );
  });

  // Paragraphs
  const blocks = s.split(/\n\s*\n/);
  s = blocks
    .map((blk) => {
      const trimmed = blk.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|pre|blockquote|table|div|p)/i.test(trimmed))
        return trimmed;
      return "<p>" + trimmed.replace(/\n/g, "<br/>") + "</p>";
    })
    .join("\n");

  return s;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
