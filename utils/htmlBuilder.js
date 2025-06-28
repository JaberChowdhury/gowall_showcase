/**
 * Recursively builds HTML from a JS object.
 * @param {Object} node - { type, className, style, children, dangerouslySetInnerHTML, ...otherProps }
 * @returns {string} HTML string
 */
function buildHtml(node) {
  if (!node || typeof node !== "object" || !node.type) return "";

  // List of self-closing tags
  const selfClosing = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  // Build attributes
  let attrs = "";
  if (node.className) attrs += ` class="${escapeHtml(node.className)}"`;
  if (node.style && typeof node.style === "object") {
    const styleStr = Object.entries(node.style)
      .map(
        ([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
      )
      .join(";");
    attrs += ` style="${escapeHtml(styleStr)}"`;
  }
  Object.entries(node)
    .filter(
      ([k]) =>
        ![
          "type",
          "className",
          "style",
          "children",
          "dangerouslySetInnerHTML",
        ].includes(k)
    )
    .forEach(([k, v]) => {
      if (typeof v === "boolean") {
        if (v) attrs += ` ${k}`;
      } else if (typeof v === "string" || typeof v === "number") {
        attrs += ` ${k}="${escapeHtml(String(v))}"`;
      }
    });

  // Self-closing tag
  if (selfClosing.has(node.type.toLowerCase())) {
    return `<${node.type}${attrs} />`;
  }

  // Children or dangerouslySetInnerHTML
  let childrenHtml = "";
  if (node.dangerouslySetInnerHTML && node.dangerouslySetInnerHTML.__html) {
    childrenHtml = node.dangerouslySetInnerHTML.__html;
  } else if (Array.isArray(node.children)) {
    childrenHtml = node.children.map(buildHtml).join("");
  } else if (
    typeof node.children === "string" ||
    typeof node.children === "number"
  ) {
    childrenHtml = escapeHtml(node.children);
  }

  return `<${node.type}${attrs}>${childrenHtml}</${node.type}>`;
}

// Simple HTML escape for text/attributes
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { buildHtml };
