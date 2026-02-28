export interface ContentField {
  id: string;
  elementId: number;
  tag: string;
  property: 'textContent' | 'href' | 'src' | 'srcset' | 'alt';
  label: string;
  originalValue: string;
  value: string;
  groupId: string;
}

export interface FieldGroup {
  id: string;
  label: string;
  fields: ContentField[];
}

export interface ParseResult {
  doc: Document;
  groups: FieldGroup[];
  isFullDocument: boolean;
}

export interface SavedSession {
  originalHtml: string;
  fieldValues: Record<string, string>;
  timestamp: number;
}
