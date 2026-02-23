import type { ContentField, FieldGroup, ParseResult } from "./types";

const SKIP_TAGS = new Set([
  "STYLE",
  "SCRIPT",
  "NOSCRIPT",
  "SVG",
  "HEAD",
  "META",
  "LINK",
  "TITLE",
  "BASE",
  "TEMPLATE",
]);

const TEXT_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "LI",
  "TD",
  "TH",
  "DT",
  "DD",
  "BLOCKQUOTE",
  "FIGCAPTION",
  "LABEL",
  "CAPTION",
]);

const BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "SECTION",
  "ARTICLE",
  "ASIDE",
  "MAIN",
  "NAV",
  "HEADER",
  "FOOTER",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "FORM",
  "FIELDSET",
  "DETAILS",
  "FIGURE",
  "BLOCKQUOTE",
  "PRE",
  "DL",
  "ADDRESS",
]);

function getFieldLabel(tag: string, property: string): string {
  if (property === "href") return "Link URL";
  if (property === "src") return "Image URL";
  if (property === "srcset")
    return tag.toLowerCase() === "source" ? "Source URL" : "Image URL";
  if (property === "alt") return "Image Alt Text";

  switch (tag.toLowerCase()) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return `Heading (${tag.toLowerCase()})`;
    case "p":
      return "Paragraph";
    case "a":
      return "Link Text";
    case "button":
      return "Button Text";
    case "span":
      return "Text";
    case "li":
      return "List Item";
    case "td":
    case "th":
      return "Table Cell";
    case "label":
      return "Label";
    case "figcaption":
      return "Caption";
    default:
      return "Text";
  }
}

function deriveGroupLabel(root: Element, index: number): string {
  const heading = root.querySelector("h1, h2, h3, h4, h5, h6");
  if (heading?.textContent?.trim()) {
    const text = heading.textContent.trim();
    return text.length > 60 ? text.substring(0, 60) + "\u2026" : text;
  }

  const img = root.querySelector("img[alt]");
  if (img) {
    const alt = img.getAttribute("alt")?.trim();
    if (alt) return alt.length > 60 ? alt.substring(0, 60) + "\u2026" : alt;
  }

  const link = root.querySelector("a");
  if (link?.textContent?.trim()) {
    const text = link.textContent.trim();
    return text.length > 60 ? text.substring(0, 60) + "\u2026" : text;
  }

  return `Section ${index + 1}`;
}

export function parseHtml(html: string): ParseResult {
  const isFullDocument = /<html[\s>]/i.test(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let eidCounter = 0;
  const fields: ContentField[] = [];

  function assignEid(element: Element): number {
    const existing = element.getAttribute("data-eid");
    if (existing !== null) return parseInt(existing, 10);
    const eid = eidCounter++;
    element.setAttribute("data-eid", String(eid));
    return eid;
  }

  function addField(element: Element, property: string, value: string) {
    const eid = assignEid(element);
    fields.push({
      id: `${eid}-${property}`,
      elementId: eid,
      tag: element.tagName.toLowerCase(),
      property: property as ContentField["property"],
      label: getFieldLabel(element.tagName, property),
      originalValue: value,
      value,
      groupId: "",
    });
  }

  function walk(element: Element) {
    if (SKIP_TAGS.has(element.tagName)) return;

    const tag = element.tagName;

    if (tag === "PICTURE") {
      for (const child of Array.from(element.children)) {
        if (child.tagName === "SOURCE") {
          const srcset = child.getAttribute("srcset");
          if (srcset) {
            const eid = assignEid(child);
            const media = child.getAttribute("media");
            fields.push({
              id: `${eid}-srcset`,
              elementId: eid,
              tag: "source",
              property: "srcset",
              label: media ? `Image Source \u2014 ${media}` : "Image Source",
              originalValue: srcset,
              value: srcset,
              groupId: "",
            });
          }
        } else if (child.tagName === "IMG") {
          const src = child.getAttribute("src");
          if (src) {
            addField(child, "src", src);
          } else {
            const srcset = child.getAttribute("srcset");
            if (srcset) addField(child, "srcset", srcset);
          }
          const alt = child.getAttribute("alt");
          if (alt !== null) addField(child, "alt", alt);
        }
      }
      return;
    }

    if (tag === "IMG") {
      const src = element.getAttribute("src");
      if (src) {
        addField(element, "src", src);
      } else {
        const srcset = element.getAttribute("srcset");
        if (srcset) addField(element, "srcset", srcset);
      }
      const alt = element.getAttribute("alt");
      if (alt !== null) addField(element, "alt", alt);
      return;
    }

    if (tag === "SOURCE") {
      const srcset = element.getAttribute("srcset");
      if (srcset) addField(element, "srcset", srcset);
      return;
    }

    if (tag === "A") {
      const href = element.getAttribute("href");
      if (href) addField(element, "href", href);

      const hasBlockChild = Array.from(element.children).some((c) =>
        BLOCK_TAGS.has(c.tagName),
      );

      if (!hasBlockChild) {
        const text = element.textContent?.trim();
        if (text) {
          addField(element, "textContent", text);
          return;
        }
      }

      for (const child of Array.from(element.children)) {
        walk(child);
      }
      return;
    }

    if (TEXT_TAGS.has(tag)) {
      const text = element.textContent?.trim();
      if (text) addField(element, "textContent", text);
      return;
    }

    if (tag === "SPAN" || tag === "BUTTON") {
      const hasBlockChild = Array.from(element.children).some((c) =>
        BLOCK_TAGS.has(c.tagName),
      );
      const text = element.textContent?.trim();
      if (!hasBlockChild && text) {
        addField(element, "textContent", text);
        return;
      }
    }

    for (const child of Array.from(element.children)) {
      walk(child);
    }
  }

  walk(doc.body);

  const groups = groupFields(doc, fields);

  return { doc, groups, isFullDocument };
}

function groupFields(doc: Document, fields: ContentField[]): FieldGroup[] {
  if (fields.length === 0) return [];

  const elementFieldCounts = new Map<Element, number>();

  for (const field of fields) {
    const el = doc.querySelector(`[data-eid="${field.elementId}"]`);
    if (!el) continue;
    let current: Element | null = el;
    while (current && current !== doc.documentElement) {
      elementFieldCounts.set(
        current,
        (elementFieldCounts.get(current) || 0) + 1,
      );
      current = current.parentElement;
    }
  }

  const cardElements = new Set<Element>();

  for (const [element] of elementFieldCounts) {
    const parent = element.parentElement;
    if (!parent || parent === doc.documentElement || parent === doc.body)
      continue;

    const siblingsWithMultipleFields = Array.from(parent.children).filter(
      (child) => (elementFieldCounts.get(child) || 0) >= 2,
    );

    if (siblingsWithMultipleFields.length >= 2) {
      for (const sib of siblingsWithMultipleFields) {
        cardElements.add(sib);
      }
    }
  }

  const cardGroups = new Map<Element, ContentField[]>();
  const ungrouped: ContentField[] = [];

  for (const field of fields) {
    const el = doc.querySelector(`[data-eid="${field.elementId}"]`);
    if (!el) {
      ungrouped.push(field);
      continue;
    }

    let card: Element | null = null;
    let current: Element | null = el;
    while (current && current !== doc.body) {
      if (cardElements.has(current)) {
        card = current;
        break;
      }
      current = current.parentElement;
    }

    if (card) {
      if (!cardGroups.has(card)) cardGroups.set(card, []);
      cardGroups.get(card)!.push(field);
    } else {
      ungrouped.push(field);
    }
  }

  const groups: FieldGroup[] = [];
  let idx = 0;

  if (ungrouped.length > 0) {
    const groupId = "general";
    for (const f of ungrouped) f.groupId = groupId;
    groups.push({ id: groupId, label: "General", fields: ungrouped });
    idx++;
  }

  for (const [card, cardFields] of cardGroups) {
    const groupId = `card-${idx}`;
    for (const f of cardFields) f.groupId = groupId;
    groups.push({
      id: groupId,
      label: deriveGroupLabel(card, idx),
      fields: cardFields,
    });
    idx++;
  }

  return groups;
}
