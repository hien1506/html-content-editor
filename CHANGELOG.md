# Changelog

## 2026-03-18

### Image and link attribute editing

- Images always show editable **alt text** and **title** fields, even when the attributes are absent in the source HTML.
- Alt text and title inputs render inline beneath the image preview as a cohesive card with focus indicators (left accent bar, label contrast change).
- Links with a `title` attribute show the title field attached directly below the URL input.

### Text-leaf DIV support

- `<div>` elements containing only text or inline formatting (no block children) are now editable, fixing cases like `<div class="h3">heading text</div>` being skipped.
