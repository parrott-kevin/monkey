import { assert, assertEquals, assertNotEquals, fail } from '../deps.ts';
import { LetStatement, ReturnStatement, Statement } from '../ast/ast.ts';
import { Lexer } from '../lexer/lexer.ts';
import { Parser } from './parser.ts';

function testLetStatement(s: Statement, expectedIdentifier: string): boolean {
  assertEquals(s.tokenLiteral(), 'let');

  if (!(s instanceof LetStatement)) {
    return false;
  }

  assertEquals(s.name?.value, expectedIdentifier);
  assertEquals(
    s.name?.tokenLiteral(),
    expectedIdentifier,
  );

  return true;
}

function checkParserErrors(p: Parser) {
  const errors = p.errors;
  if (errors.length === 0) {
    return;
  }

  console.error(`parser has ${errors.length} errors`);
  for (const message of errors) {
    console.error(`parser error: ${message}`);
  }
  fail();
}

Deno.test('let statements', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();

  checkParserErrors(p);

  assertNotEquals(program, null);
  assertEquals(program.statements.length, 3);

  const tests: {
    expectedIdentifier: string;
  }[] = [
    'x',
    'y',
    'foobar',
  ].map((expectedIdentifier) => ({ expectedIdentifier }));

  for (let i = 0; i < tests.length; i++) {
    const stmt = program.statements[i];
    if (!testLetStatement(stmt, tests[i].expectedIdentifier)) {
      break;
    }
  }
});

Deno.test('return statements', () => {
  const input = `
    return 5;
    return 10;
    return 993322;
  `;
  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);

  assertEquals(program.statements.length, 3);

  for (const stmt of program.statements) {
    assert(stmt instanceof ReturnStatement);
    assertEquals(stmt.tokenLiteral(), 'return');
  }
});
