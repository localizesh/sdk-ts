import { sha256 } from "js-sha256";

import {Context, Tags} from "./types.js";

type Payload = {
  index: number
  text: string
  tags?: Tags
  context?: Context
}

class IdGenerator {

  private indexMap: Record<string, number> = {};

  public generateId(text: string, tags?: Tags, context?: Context): string {
    if (this.indexMap[text]) {
      this.indexMap[text] += 1;
    } else {
      this.indexMap[text] = 1;
    }

    const payload: Payload = {
      index: this.indexMap[text],
      text,
      tags,
      context
    };

    return sha256(JSON.stringify(payload));
  }
}

export { IdGenerator };
