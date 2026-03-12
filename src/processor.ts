import Ajv from "ajv";
import { md5 } from "js-md5";
import { Document, Tag } from "./types.js";
import type {
  ParseRequest,
  ParseResponse,
  StringifyRequest,
  StringifyResponse
} from "./schema.js";
import schema from "./schema.json" with { type: "json" };

type Options = Record<string, unknown>;

export abstract class Processor<
  ParseOptions extends Options = Options,
  StringifyOptions extends Options = Options,
> {
  private static ajv = new Ajv();
  private static validateParseRequest = Processor.ajv.compile({
    ...schema.definitions.ParseRequest,
    definitions: schema.definitions,
  });
  private static validateStringifyRequest = Processor.ajv.compile({
    ...schema.definitions.StringifyRequest,
    definitions: schema.definitions,
  });

  abstract parse(res: string, options?: ParseOptions): Document;
  abstract stringify(doc: Document, options?: StringifyOptions): string;

  protected id(
    text: string,
    tags?: { [key: string]: Tag },
    metadata?: { [key: string]: unknown },
  ): string {
    return md5(JSON.stringify({ text, tags, metadata }));
  }

  /**
   * Processes a JSON string input (ParseRequest or StringifyRequest)
   * and returns a JSON string output (ParseResponse or StringifyResponse).
   * Safe to use in browser environments.
   */
  public process(input: string): string {
    const request = JSON.parse(input);

    // Validate and handle ParseRequest
    if (Processor.validateParseRequest(request)) {
      return this.handleParse(request as unknown as ParseRequest);
    }

    // Validate and handle StringifyRequest
    if (Processor.validateStringifyRequest(request)) {
      return this.handleStringify(request as unknown as StringifyRequest);
    }

    // Collect all validation errors
    const errors = [
      ...(Processor.validateParseRequest.errors || []),
      ...(Processor.validateStringifyRequest.errors || []),
    ];
    throw new Error(`Invalid request: ${JSON.stringify(errors)}`);
  }

  /**
   * Reads from stdin and writes to stdout.
   * Node.js environment only.
   */
  async run() {
    if (typeof process === "undefined" || !process.stdin || !process.stdout) {
      throw new Error(
        "Processor.run() is only available in Node.js environment",
      );
    }

    try {
      const input = await this.readStdin();
      if (!input.trim()) return;

      const output = this.process(input);
      process.stdout.write(output);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  private handleParse(request: ParseRequest): string {
    const document = this.parse(request.resource, request.options as ParseOptions);
    const response: ParseResponse = {
      document,
    };
    return JSON.stringify(response);
  }

  private handleStringify(request: StringifyRequest): string {
    const resource = this.stringify(request.document as any, request.options as StringifyOptions);
    const response: StringifyResponse = {
      resource,
    };
    return JSON.stringify(response);
  }

  private readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }
}
