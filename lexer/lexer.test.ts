import { assertEquals } from '../deps.ts';
import { Lexer } from './lexer.ts';
import { Tokens, TokenType } from '../token/token.ts';

Deno.test('nextToken', (): void => {
  const input = `
    let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };

    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
      return true;
    } else {
        return false;
    }

    10 == 10;
    10 != 9;
  `;

  const tests: {
    expectedType: TokenType;
    expectedLiteral: string;
  }[] = [
    [Tokens.LET, 'let'],
    [Tokens.IDENT, 'five'],
    [Tokens.ASSIGN, '='],
    [Tokens.INT, '5'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.LET, 'let'],
    [Tokens.IDENT, 'ten'],
    [Tokens.ASSIGN, '='],
    [Tokens.INT, '10'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.LET, 'let'],
    [Tokens.IDENT, 'add'],
    [Tokens.ASSIGN, '='],
    [Tokens.FUNCTION, 'fn'],
    [Tokens.LPAREN, '('],
    [Tokens.IDENT, 'x'],
    [Tokens.COMMA, ','],
    [Tokens.IDENT, 'y'],
    [Tokens.RPAREN, ')'],
    [Tokens.LBRACE, '{'],
    [Tokens.IDENT, 'x'],
    [Tokens.PLUS, '+'],
    [Tokens.IDENT, 'y'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.RBRACE, '}'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.LET, 'let'],
    [Tokens.IDENT, 'result'],
    [Tokens.ASSIGN, '='],
    [Tokens.IDENT, 'add'],
    [Tokens.LPAREN, '('],
    [Tokens.IDENT, 'five'],
    [Tokens.COMMA, ','],
    [Tokens.IDENT, 'ten'],
    [Tokens.RPAREN, ')'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.BANG, '!'],
    [Tokens.MINUS, '-'],
    [Tokens.SLASH, '/'],
    [Tokens.ASTERISK, '*'],
    [Tokens.INT, '5'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.INT, '5'],
    [Tokens.LT, '<'],
    [Tokens.INT, '10'],
    [Tokens.GT, '>'],
    [Tokens.INT, '5'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.IF, 'if'],
    [Tokens.LPAREN, '('],
    [Tokens.INT, '5'],
    [Tokens.LT, '<'],
    [Tokens.INT, '10'],
    [Tokens.RPAREN, ')'],
    [Tokens.LBRACE, '{'],
    [Tokens.RETURN, 'return'],
    [Tokens.TRUE, 'true'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.RBRACE, '}'],
    [Tokens.ELSE, 'else'],
    [Tokens.LBRACE, '{'],
    [Tokens.RETURN, 'return'],
    [Tokens.FALSE, 'false'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.RBRACE, '}'],
    [Tokens.INT, '10'],
    [Tokens.EQ, '=='],
    [Tokens.INT, '10'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.INT, '10'],
    [Tokens.NOT_EQ, '!='],
    [Tokens.INT, '9'],
    [Tokens.SEMICOLON, ';'],
    [Tokens.EOF, ''],
  ].map(([expectedType, expectedLiteral]) => ({
    expectedType,
    expectedLiteral,
  }));

  const l = new Lexer(input);
  for (const test of tests) {
    const tok = l.nextToken();
    assertEquals(tok.Type, test.expectedType);
    assertEquals(tok.Literal, test.expectedLiteral);
  }
});
