import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Processor, root, segment, text } from "../src/index.js";
import { Document } from "../src/types.js";
import type { ParseRequest, StringifyRequest } from "../src/schema.js";

class TestProcessor extends Processor {
  parse(res: string): Document {
    return {
      segments: [{ id: "1", text: res }],
      layout: root(),
    };
  }
  stringify(doc: Document): string {
    return doc.segments[0].text;
  }
  public testId(...args: Parameters<TestProcessor["id"]>) {
    return this.id(...args);
  }
}

describe("Processor", () => {
  let processor: TestProcessor;
  let stdinMock: any;
  let stdoutMock: any;
  let exitMock: any;

  beforeEach(() => {
    processor = new TestProcessor();

    // Mock stdin
    stdinMock = {
      setEncoding: vi.fn(),
      on: vi.fn(),
    };
    Object.defineProperty(process, "stdin", { value: stdinMock });

    // Mock stdout
    stdoutMock = {
      write: vi.fn(),
    };
    Object.defineProperty(process, "stdout", { value: stdoutMock });

    // Mock exit
    exitMock = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("process()", () => {
    it("should handle ParseRequest", () => {
      const request: ParseRequest = {
        resource: "Hello World",
        options: { foo: "bar" },
      };
      const inputJson = JSON.stringify(request);

      const output = processor.process(inputJson);
      const response = JSON.parse(output);

      expect(response.document).toBeDefined();
      expect(response.document.segments[0].text).toBe("Hello World");
    });

    it("should handle StringifyRequest", () => {
      const request: StringifyRequest = {
        document: {
          segments: [{ id: "1", text: "Hello World" }],
          layout: root(),
        },
      };
      const inputJson = JSON.stringify(request);

      const output = processor.process(inputJson);
      const response = JSON.parse(output);

      expect(response.resource).toBe("Hello World");
    });
  });

  describe("id()", () => {
    it("should generate deterministic IDs for same input", () => {
      const id1 = processor.testId("Hello");
      const id2 = processor.testId("Hello");
      expect(id1).toBe(id2);
    });

    it("should generate different IDs for different tags", () => {
      const id1 = processor.testId("Hello", { b1: { class: "bold" } });
      const id2 = processor.testId("Hello", { i1: { class: "italic" } });
      expect(id1).not.toBe(id2);
    });

    it("should generate different IDs for different metadata", () => {
      const id1 = processor.testId("Hello", undefined, { section: "header" });
      const id2 = processor.testId("Hello", undefined, { section: "footer" });
      expect(id1).not.toBe(id2);
    });
  });

  describe("run()", () => {
    it("should handle ParseRequest from stdin", async () => {
      const request: ParseRequest = {
        resource: "Hello World",
      };
      const inputJson = JSON.stringify(request);

      const runPromise = processor.run();

      const dataCallback = stdinMock.on.mock.calls.find(
        (call: any[]) => call[0] === "data",
      )[1];
      dataCallback(inputJson);

      const endCallback = stdinMock.on.mock.calls.find(
        (call: any[]) => call[0] === "end",
      )[1];
      endCallback();

      await runPromise;

      expect(stdoutMock.write).toHaveBeenCalled();
      const output = stdoutMock.write.mock.calls[0][0];
      const response = JSON.parse(output);

      expect(response.document.segments[0].text).toBe("Hello World");
    });
  });
});
