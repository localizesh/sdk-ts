import { Root, Node, Text, Element } from "hast";
import type { Tag as SchemaTag, Segment as SchemaSegment } from "./schema.js";

// HAST-specific extensions
export interface LayoutRoot extends Root {}

export interface LayoutNode extends Node {}

export interface LayoutElement extends Element {}

export interface LayoutSegment extends Node {
  type: "segment";
  id: string;
}

export interface LayoutText extends Text {}

export type Tag = SchemaTag;
export type Segment = SchemaSegment;

// Extended Document type with typed layout
export interface Document {
  segments: Segment[];
  layout: LayoutRoot;
  metadata?: { [key: string]: unknown };
}

declare module "hast" {
  interface RootContentMap {
    segment: LayoutSegment;
  }
  interface ElementContentMap {
    segment: LayoutSegment;
  }
}
