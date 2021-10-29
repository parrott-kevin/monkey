import { Lexer } from '../lexer/lexer.ts';
import { Token, Tokens, TokenType } from '../token/token.ts';
import {
  Expression,
  ExpressionStatement,
  Identifier,
  LetStatement,
  Program,
  ReturnStatement,
  Statement,
} from '../ast/ast.ts';

type prefixParseFn = () => Expression;
type infixParseFn = (exp: Expression) => Expression;

enum Precedences {
  _,
  LOWEST,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
}

export class Parser {
  l: Lexer;
  errors: string[] = [];

  curToken: Token;
  peekToken: Token;

  prefixParseFns: { [key: TokenType]: prefixParseFn } = {};
  infixParseFns: { [key: TokenType]: infixParseFn } = {};

  constructor(l: Lexer) {
    this.l = l;
    this.curToken = this.l.nextToken();
    this.peekToken = this.l.nextToken();
    this.registerPrefix(Tokens.IDENT, this.parseIdentifier);
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

  parseIdentifier(): Expression {
    const ident = new Identifier(
      this.curToken,
      this.curToken.Literal,
    );
    return ident;
  }

  parseLetStatement(): Statement | null {
    const stmt = new LetStatement(this.curToken);
    if (!this.expectPeek(Tokens.IDENT)) {
      return null;
    }

    stmt.name = new Identifier(
      this.curToken,
      this.curToken.Literal,
    );

    if (!this.expectPeek(Tokens.ASSIGN)) {
      return null;
    }

    while (!this.curTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseReturnStatement(): Statement {
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();
    while (!this.curTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseExpression(precedence: Precedences): Expression {
    const prefix = this.prefixParseFns[this.curToken.Type];
    const leftExp = prefix();
    return leftExp;
  }

  parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement(
      this.curToken,
      this.parseExpression(Precedences.LOWEST),
    );
    if (this.peekTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.Type) {
      case Tokens.LET:
        return this.parseLetStatement();
      case Tokens.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
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

  registerPrefix(tokenType: TokenType, fn: prefixParseFn) {
    this.prefixParseFns[tokenType] = fn.bind(this);
  }

  registerInfix(tokenType: TokenType, fn: infixParseFn) {
    this.infixParseFns[tokenType] = fn.bind(this);
  }
}
