import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li',
  'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre',
  'span', 'div',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows only safe tags and attributes.
 * Forces links to open in new tab with noopener noreferrer.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
  });

  // Force all links to have safe attributes
  return clean.replace(
    /<a\s/g,
    '<a target="_blank" rel="noopener noreferrer" '
  );
}
