export * from "./types.js";
export * from "./processor.js";
export * from "./utils.js";

// Helpers to create layout nodes
import type {
  LayoutSegment,
  LayoutText,
  LayoutRoot,
  LayoutNode,
  LayoutElement,
} from "./types.js";
import { h } from "hastscript";

export function root(children: LayoutNode[] = []): LayoutRoot {
  return { type: "root", children } as LayoutRoot;
}

export function element(
  tagName: string,
  ...children: (string | LayoutNode | LayoutNode[])[]
): LayoutElement;
export function element(
  tagName: string,
  properties: { [key: string]: any },
  ...children: (string | LayoutNode | LayoutNode[])[]
): LayoutElement;
export function element(
  tagName: string,
  propertiesOrChild?:
    | { [key: string]: any }
    | LayoutNode
    | string
    | LayoutNode[],
  ...children: (string | LayoutNode | LayoutNode[])[]
): LayoutElement {
  // Check if propertiesOrChild is a Node (has 'type') or an Array (list of children)
  if (
    propertiesOrChild &&
    typeof propertiesOrChild === "object" &&
    (!Array.isArray(propertiesOrChild) ? "type" in propertiesOrChild : true)
  ) {
    // It's a child node or array of children -> pass empty properties
    return h(
      tagName,
      {},
      propertiesOrChild as any,
      ...(children as any),
    ) as LayoutElement;
  }

  // Otherwise, treat it as properties
  return h(
    tagName,
    propertiesOrChild as any,
    ...(children as any),
  ) as LayoutElement;
}

export function segment(id: string): LayoutSegment {
  return { type: "segment", id };
}

export function text(value: string = ""): LayoutText {
  return { type: "text", value };
}
