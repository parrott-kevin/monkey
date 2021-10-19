import { lookupIdent, Token, Tokens, TokenType } from '../token/token.ts';
export class Lexer {
  input: string;
  position = 0;
  readPosition = 0;
  ch = 0;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = 0;
    } else {
      this.ch = this.input.charCodeAt(this.readPosition);
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  peekChar(): number {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input.charCodeAt(this.readPosition);
    }
  }

  newToken(tokenType: TokenType, ch: number): Token {
    return {
      Type: tokenType,
      Literal: String.fromCharCode(ch),
    };
  }

  isLetter(ch: number): boolean {
    return 'a'.charCodeAt(0) <= ch && ch <= 'z'.charCodeAt(0) ||
      'A'.charCodeAt(0) <= ch && ch <= 'Z'.charCodeAt(0) ||
      ch === '_'.charCodeAt(0);
  }

  readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  skipWhitespace() {
    while (
      this.ch == ' '.charCodeAt(0) || this.ch == '\t'.charCodeAt(0) ||
      this.ch == '\n'.charCodeAt(0) || this.ch == '\r'.charCodeAt(0)
    ) {
      this.readChar();
    }
  }

  isDigit(ch: number): boolean {
    return '0'.charCodeAt(0) <= ch && ch <= '9'.charCodeAt(0);
  }

  readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  nextToken(): Token {
    let tok: Token;

    this.skipWhitespace();

    switch (this.ch) {
      case '='.charCodeAt(0):
        if (this.peekChar() == '='.charCodeAt(0)) {
          const ch = this.ch;
          this.readChar();
          const literal = String.fromCharCode(this.ch) +
            String.fromCharCode(this.ch);
          tok = {
            Type: Tokens.EQ,
            Literal: literal,
          };
        } else {
          tok = this.newToken(Tokens.ASSIGN, this.ch);
        }
        break;
      case '+'.charCodeAt(0):
        tok = this.newToken(Tokens.PLUS, this.ch);
        break;
      case '-'.charCodeAt(0):
        tok = this.newToken(Tokens.MINUS, this.ch);
        break;
      case '!'.charCodeAt(0):
        if (this.peekChar() == '='.charCodeAt(0)) {
          const ch = this.ch;
          this.readChar();
          const literal = String.fromCharCode(ch) +
            String.fromCharCode(this.ch);
          tok = {
            Type: Tokens.NOT_EQ,
            Literal: literal,
          };
        } else {
          tok = this.newToken(Tokens.BANG, this.ch);
        }
        break;
      case '/'.charCodeAt(0):
        tok = this.newToken(Tokens.SLASH, this.ch);
        break;
      case '*'.charCodeAt(0):
        tok = this.newToken(Tokens.ASTERISK, this.ch);
        break;
      case '<'.charCodeAt(0):
        tok = this.newToken(Tokens.LT, this.ch);
        break;
      case '>'.charCodeAt(0):
        tok = this.newToken(Tokens.GT, this.ch);
        break;
      case ','.charCodeAt(0):
        tok = this.newToken(Tokens.COMMA, this.ch);
        break;
      case ';'.charCodeAt(0):
        tok = this.newToken(Tokens.SEMICOLON, this.ch);
        break;
      case '('.charCodeAt(0):
        tok = this.newToken(Tokens.LPAREN, this.ch);
        break;
      case ')'.charCodeAt(0):
        tok = this.newToken(Tokens.RPAREN, this.ch);
        break;
      case '+'.charCodeAt(0):
        tok = this.newToken(Tokens.PLUS, this.ch);
        break;
      case '{'.charCodeAt(0):
        tok = this.newToken(Tokens.LBRACE, this.ch);
        break;
      case '}'.charCodeAt(0):
        tok = this.newToken(Tokens.RBRACE, this.ch);
        break;
      case 0:
        tok = {
          Literal: '',
          Type: Tokens.EOF,
        };
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = {
            Literal: literal,
            Type: lookupIdent(literal),
          };
          return tok;
        } else if (this.isDigit(this.ch)) {
          return {
            Type: Tokens.INT,
            Literal: this.readNumber(),
          };
        } else {
          tok = this.newToken(Tokens.ILLEGAL, this.ch);
        }
    }
    this.readChar();
    return tok;
  }
}
