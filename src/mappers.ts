import {create} from "@bufbuild/protobuf";
import {Document as ProtoDocument, DocumentSchema as ProtoDocumentSchema} from "./protos/localize/document_pb.js";
import {Attributes, Segment as ProtoSegment, SegmentSchema} from "./protos/localize/segment_pb.js";

import {Document, Segment, Tags} from "./types.js";

export function fromProtoDocument(protoDocument: ProtoDocument): Document {
  return {
    layout: JSON.parse(protoDocument.layout),
    metadata: protoDocument.metadata ?? undefined,
    segments: fromProtoSegments(protoDocument.segments)
  }
}

export function toProtoDocument(document: Document): ProtoDocument {
  return create(ProtoDocumentSchema, {
    layout: JSON.stringify(document.layout),
    metadata: document.metadata ?? undefined,
    segments: toProtoSegments(document.segments)
  });
}

export function fromProtoSegment(protoSegment: ProtoSegment): Segment {
  const segment: Segment = {id: protoSegment.id, text: protoSegment.text};

  if (protoSegment.tags) {
    const tags: Tags = {};
    for (const tagKey of Object.keys(protoSegment.tags)) {
      const attrs: Attributes = protoSegment.tags[tagKey];
      tags[tagKey] = attrs.values;
    }

    if (Object.keys(tags).length) {
      segment.tags = tags;
    }
  }

  return segment;
}

export function fromProtoSegments(protoSegments: ProtoSegment[]): Segment[] {
  return protoSegments.map(fromProtoSegment);
}

export function toProtoSegment(segment: Segment): ProtoSegment {
  const protoSegment: any = {id: segment.id, text: segment.text};
  const protoTags: any = {};

  if (segment.tags) {
    for (const tagKey of Object.keys(segment.tags)) {
      const attrs = segment.tags[tagKey];
      protoTags[tagKey] = {values: attrs};
    }

    if (Object.keys(protoTags).length) {
      protoSegment.tags = protoTags;
    }
  }

  return create(SegmentSchema, protoSegment);
}

export function toProtoSegments(segments: Segment[]): ProtoSegment[] {
  return segments.map(toProtoSegment);
}
