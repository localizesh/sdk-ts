export interface Segment {
  id: string;
  text: string;
  tags?: Tags;
}

export type TagAttributes = {
  [key: string]: string;
}

export type Tags = {
  [key: string]: TagAttributes;
}

export interface Layout {
  type: "root";
  children: LayoutNode[];
}

export interface LayoutSegment {
  type: "segment";
  id: string;
}

export interface LayoutElement {
  value?: string;
  type: string;
  tagName: string;
  children: LayoutNode[];
  properties?: any
}

export type LayoutNode = LayoutElement | LayoutSegment;

export type Context = any;

export interface Document {
  segments: Segment[];
  layout: Layout;
  metadata?: { [key: string]: any }
}

export interface Processor {
  parse(res: string, ctx?: Context): Document;
  stringify(doc: Document, ctx?: Context): string;
}
