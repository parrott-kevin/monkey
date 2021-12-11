import { assert, assertEquals, assertNotEquals, fail } from '../deps.ts';
import {
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
} from '../ast/ast.ts';
import { Lexer } from '../lexer/lexer.ts';
import { Parser } from './parser.ts';

function checkParserErrors(p: Parser): void {
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

function testIntegerLiteral(
  il: Expression | null | undefined,
  value: number,
): boolean {
  assert(il instanceof IntegerLiteral);
  assertEquals(il.value, value);
  assertEquals(il.tokenLiteral(), `${value}`);

  return true;
}

function testIdentifier(exp: Expression, value: string): boolean {
  assert(exp instanceof Identifier);
  const ident = exp;
  assertEquals(ident.value, value);
  assertEquals(ident.tokenLiteral(), value);
  return true;
}

function testLiteralExpression(
  exp: Expression,
  value: number | string,
): boolean {
  switch (typeof value) {
    case 'number':
      return testIntegerLiteral(exp, value);
    case 'string':
      return testIdentifier(exp, value);
    default:
      console.log(`typeof exp not handled. got=${exp}`);
      return false;
  }
}

function testInfixExpression(
  exp: Expression,
  left: any,
  operator: string,
  right: any,
): boolean {
  assert(exp instanceof InfixExpression);

  if (!testLiteralExpression(exp.left, left)) {
    return false;
  }

  if (exp.operator !== operator) {
    console.log(`exp.operator is not ${operator}. got=${exp.operator}`);
    return false;
  }

  if (exp.right && !testLiteralExpression(exp.right, right)) {
    return false;
  }

  return true;
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

Deno.test('identifier expression', () => {
  const input = 'foobar;';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  assertEquals(program.statements.length, 1);

  const stmt = program.statements[0];
  assert(stmt instanceof ExpressionStatement);

  const ident = stmt.expression;
  assert(ident instanceof Identifier);
  assertEquals(ident.value, 'foobar');
  assertEquals(ident.tokenLiteral(), 'foobar');
});

Deno.test('integer literal expression', () => {
  const input = '5;';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  assertEquals(program.statements.length, 1);
  const stmt = program.statements[0];
  assert(stmt instanceof ExpressionStatement);
  const literal = stmt.expression;
  assert(literal instanceof IntegerLiteral);
  assertEquals(literal.value, 5);
  assertEquals(literal.tokenLiteral(), '5');
});

Deno.test('parsing prefix expressions', () => {
  const prefixTests: {
    input: string;
    operator: string;
    integerValue: number;
  }[] = [{
    input: '!5',
    operator: '!',
    integerValue: 5,
  }, {
    input: '-15',
    operator: '-',
    integerValue: 15,
  }];
  for (const tt of prefixTests) {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    assertEquals(program.statements.length, 1);
    const stmt = program.statements[0];
    assert(stmt instanceof ExpressionStatement);
    const exp = stmt.expression;
    assert(exp instanceof PrefixExpression);
    assertEquals(exp.operator, tt.operator);
    assert(testIntegerLiteral(exp.right, tt.integerValue));
  }
});

Deno.test('parsing infix expression', () => {
  const infixTests: {
    input: string;
    leftValue: number;
    operator: string;
    rightValue: number;
  }[] = ([
    ['5 + 5;', 5, '+', 5],
    ['5 - 5;', 5, '-', 5],
    ['5 * 5;', 5, '*', 5],
    ['5 / 5;', 5, '/', 5],
    ['5 > 5;', 5, '>', 5],
    ['5 < 5;', 5, '<', 5],
    ['5 == 5;', 5, '==', 5],
    ['5 != 5;', 5, '!=', 5],
  ] as [string, number, string, number][]).map((i) => ({
    input: i[0],
    leftValue: i[1],
    operator: i[2],
    rightValue: i[3],
  }));

  for (const tt of infixTests) {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    assertEquals(program.statements.length, 1);
    const stmt = program.statements[0];
    assert(stmt instanceof ExpressionStatement);
    const exp = stmt.expression;
    assert(exp instanceof InfixExpression);
    testInfixExpression(exp, tt.leftValue, tt.operator, tt.rightValue);
  }
});

Deno.test('operator precedence parsing', () => {
  const tests: { input: string; expected: string }[] = ([
    [
      '-a * b',
      '((-a) * b)',
    ],
    [
      '!-a',
      '(!(-a))',
    ],
    [
      'a + b + c',
      '((a + b) + c)',
    ],
    [
      'a + b - c',
      '((a + b) - c)',
    ],
    [
      'a * b * c',
      '((a * b) * c)',
    ],
    [
      'a * b / c',
      '((a * b) / c)',
    ],
    [
      'a + b / c',
      '(a + (b / c))',
    ],
    [
      'a + b * c + d / e - f',
      '(((a + (b * c)) + (d / e)) - f)',
    ],
    [
      '3 + 4; -5 * 5',
      '(3 + 4)((-5) * 5)',
    ],
    [
      '5 > 4 == 3 < 4',
      '((5 > 4) == (3 < 4))',
    ],
    [
      '5 < 4 != 3 > 4',
      '((5 < 4) != (3 > 4))',
    ],
    [
      '3 + 4 * 5 == 3 * 1 + 4 * 5',
      '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
    ],
  ] as [string, string][]).map((i) => ({
    input: i[0],
    expected: i[1],
  }));

  for (const tt of tests) {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    const actual = program.string();
    assertEquals(actual, tt.expected);
  }
});
