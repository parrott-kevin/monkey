const PROMPT = '>>';

import Lexer from '../lexer/lexer.ts';
import { Tokens } from '../token/token.ts';

export const start = async (
  stdin = Deno.stdin,
  stdout = Deno.stdout,
): Promise<void> => {
  const buf = new Uint8Array(1024);
  while (true) {
    await stdout.write(new TextEncoder().encode(PROMPT));
    const n = await stdin.read(buf) as number;
    const line = new TextDecoder().decode(buf.subarray(0, n));
    const l = new Lexer(line);
    let tok = l.nextToken();
    while (tok.Type !== Tokens.EOF) {
      console.log(tok);
      tok = l.nextToken();
    }
  }
};
