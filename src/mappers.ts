import { Document as ProtoDocument } from "./protos/localize/document_pb.js";
import { Segment as ProtoSegment, Attributes as ProtoAttributes } from "./protos/localize/segment_pb.js";

import { Document, Segment, Tags } from "./types.js";

export function fromProtoDocument(protoDocument: ProtoDocument): Document {
  return {
    layout: JSON.parse(protoDocument.layout),
    segments: fromProtoSegments(protoDocument.segments)
  }
}

export function toProtoDocument(document: Document): ProtoDocument {
  return new ProtoDocument({
    layout: JSON.stringify(document.layout),
    segments: toProtoSegments(document.segments)
  });
}

export function fromProtoSegment(protoSegment: ProtoSegment): Segment {
  const segment: Segment = { id: protoSegment.id, text: protoSegment.text };

  if (protoSegment.tags) {
    const tags: Tags = {};
    for (const tagKey of Object.keys(protoSegment.tags)) {
      const attrs: ProtoAttributes = protoSegment.tags[tagKey];
      tags[tagKey] = attrs.values;
    }

    if(Object.keys(tags).length) {
      segment.tags = tags;
    }
  }

  return segment;
}

export function fromProtoSegments(protoSegments: ProtoSegment[]): Segment[] {
  return protoSegments.map(fromProtoSegment);
}

export function toProtoSegment(segment: Segment): ProtoSegment {
  const protoSegment: any = { id: segment.id, text: segment.text };
  const protoTags: any = {};

  if (segment.tags) {
    for (const tagKey of Object.keys(segment.tags)) {
      const attrs = segment.tags[tagKey];
      protoTags[tagKey] = { values: attrs };
    }

    if (Object.keys(protoTags).length) {
      protoSegment.tags = protoTags;
    }
  }

  return new ProtoSegment(protoSegment);
}

export function toProtoSegments(segments: Segment[]): ProtoSegment[] {
  return segments.map(toProtoSegment);
}
