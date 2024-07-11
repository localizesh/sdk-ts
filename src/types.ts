import {Root as HastRoot, Node as HastNode, Element as HastElement } from "hast";

export interface Segment {
  id: string
  text: string
  tags?: Tags
}

export type TagAttributes = {
  [key: string]: string
}

export type Tags = {
  [key: string]: TagAttributes
}

export interface LayoutRoot extends HastRoot {}

export interface LayoutSegment extends HastNode {
  type: "segment"
  id: string
}

export interface LayoutElement extends HastElement {}

export type Context = any;

export interface Document {
  segments: Segment[]
  layout: LayoutRoot
  metadata?: { [key: string]: any }
}

export interface Processor {
  parse(res: string, ctx?: Context): Document
  stringify(doc: Document, ctx?: Context): string
}
