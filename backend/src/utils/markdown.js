const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

marked.setOptions({
  mangle: false,
  headerIds: false
});

function renderMarkdown(markdown) {
  const raw = marked.parse(markdown || '');
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'pre',
      'code',
      'blockquote'
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
      code: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank'
      })
    }
  });
}

module.exports = { renderMarkdown };
