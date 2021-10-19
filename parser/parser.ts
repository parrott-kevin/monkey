import { Lexer } from '../lexer/lexer.ts';
import { Token, Tokens, TokenType } from '../token/token.ts';
import { Identifier, LetStatement, Program, Statement } from '../ast/ast.ts';

export class Parser {
  l: Lexer;
  curToken: Token;
  peekToken: Token;
  errors: string[] = [];

  constructor(l: Lexer) {
    this.l = l;
    this.curToken = this.l.nextToken();
    this.peekToken = this.l.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  curTokenIs(t: TokenType): boolean {
    return this.curToken.Type === t;
  }

  peekTokenIs(t: TokenType): boolean {
    return this.peekToken.Type === t;
  }

  expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  peekError(t: TokenType) {
    const message =
      `expected next token to be ${t}, got ${this.peekToken.Type} instead`;
    this.errors.push(message);
  }

  parseLetStatement(): Statement | null {
    const stmt = new LetStatement({ token: this.curToken });
    if (!this.expectPeek(Tokens.IDENT)) {
      return null;
    }

    stmt.name = new Identifier({
      token: this.curToken,
      value: this.curToken.Literal,
    });

    if (!this.expectPeek(Tokens.ASSIGN)) {
      return null;
    }

    while (!this.curTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.Type) {
      case Tokens.LET:
        return this.parseLetStatement();
      default:
        return null;
    }
  }

  parseProgram(): Program {
    const program = new Program();
    while (!this.curTokenIs(Tokens.EOF)) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }
}
