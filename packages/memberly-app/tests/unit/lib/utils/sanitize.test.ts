import { sanitizeHtml } from '@/lib/utils/sanitize';

describe('sanitizeHtml', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('allows safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('</p>');
  });

  it('allows headings, lists, and blockquotes', () => {
    const input = '<h1>Title</h1><ul><li>Item</li></ul><blockquote>Quote</blockquote>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<h1>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('<blockquote>');
  });

  it('strips script tags', () => {
    const input = '<p>Safe</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Safe</p>');
  });

  it('strips event handlers', () => {
    const input = '<img onerror="alert(1)" src="x" />';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('strips onclick handlers', () => {
    const input = '<div onclick="steal()">Click me</div>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('steal');
  });

  it('strips iframe tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('evil.com');
  });

  it('strips style tags', () => {
    const input = '<style>body{display:none}</style><p>Content</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<style>');
    expect(result).toContain('<p>Content</p>');
  });

  it('forces links to have target="_blank" and rel="noopener noreferrer"', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('strips javascript: URLs from links', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('strips data: URLs from links', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('data:');
  });

  it('preserves class attributes on spans', () => {
    const input = '<span class="bg-blue-50 text-blue-700">Name</span>';
    const result = sanitizeHtml(input);
    expect(result).toContain('class="bg-blue-50 text-blue-700"');
  });

  it('strips dangerous attributes like src on non-allowed tags', () => {
    const input = '<img src="https://tracker.com/pixel.gif" />';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<img');
  });

  it('handles br tags', () => {
    const input = 'Line 1<br/>Line 2<br>Line 3';
    const result = sanitizeHtml(input);
    expect(result).toContain('<br');
  });

  it('handles code and pre tags', () => {
    const input = '<pre><code>const x = 1;</code></pre>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<pre>');
    expect(result).toContain('<code>');
  });
});
