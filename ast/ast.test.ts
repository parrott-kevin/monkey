import { assertEquals } from '../deps.ts';
import { Tokens } from '../token/token.ts';
import { Identifier, LetStatement, Program, Statement } from './ast.ts';

Deno.test('string', () => {
  const program = new Program();

  const token = { Type: Tokens.LET, Literal: 'let' };

  const name = new Identifier(
    { Type: Tokens.IDENT, Literal: 'myVar' },
    'myVar',
  );

  const value = new Identifier(
    { Type: Tokens.IDENT, Literal: 'anotherVar' },
    'anotherVar',
  );

  program.statements.push(new LetStatement(token, name, value));

  assertEquals(program.string(), 'let myVar = anotherVar;');
});
