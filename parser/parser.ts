import { Lexer } from '../lexer/lexer.ts';
import { Token, Tokens, TokenType } from '../token/token.ts';
import {
  Boolean,
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
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

const PrecedencesHash: { [key: TokenType]: Precedences } = {
  [Tokens.EQ]: Precedences.EQUALS,
  [Tokens.NOT_EQ]: Precedences.EQUALS,
  [Tokens.LT]: Precedences.LESSGREATER,
  [Tokens.GT]: Precedences.LESSGREATER,
  [Tokens.PLUS]: Precedences.SUM,
  [Tokens.MINUS]: Precedences.SUM,
  [Tokens.SLASH]: Precedences.PRODUCT,
  [Tokens.ASTERISK]: Precedences.PRODUCT,
};

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
    this.registerPrefix(Tokens.INT, this.parseIntegerLiteral);

    this.registerPrefix(Tokens.BANG, this.parsePrefixExpression);
    this.registerPrefix(Tokens.MINUS, this.parsePrefixExpression);
    this.registerPrefix(Tokens.TRUE, this.parseBoolean);
    this.registerPrefix(Tokens.FALSE, this.parseBoolean);

    this.registerInfix(Tokens.PLUS, this.parseInfixExpression);
    this.registerInfix(Tokens.MINUS, this.parseInfixExpression);
    this.registerInfix(Tokens.SLASH, this.parseInfixExpression);
    this.registerInfix(Tokens.ASTERISK, this.parseInfixExpression);
    this.registerInfix(Tokens.EQ, this.parseInfixExpression);
    this.registerInfix(Tokens.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(Tokens.LT, this.parseInfixExpression);
    this.registerInfix(Tokens.GT, this.parseInfixExpression);
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

  peekPrecendence() {
    const p = PrecedencesHash[this.peekToken.Type];
    return p ? p : Precedences.LOWEST;
  }

  curPrecendence() {
    const p = PrecedencesHash[this.curToken.Type];
    return p ? p : Precedences.LOWEST;
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

  parseIntegerLiteral(): Expression {
    const value = parseInt(this.curToken.Literal, 10);
    return new IntegerLiteral(this.curToken, value);
  }

  parseBoolean(): Expression {
    return new Boolean(this.curToken, this.curTokenIs(Tokens.TRUE));
  }

  parseExpression(precedence: Precedences): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.Type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.Type);
      return null;
    }
    let leftExp = prefix();
    while (
      !this.peekTokenIs(Tokens.SEMICOLON) && precedence < this.peekPrecendence()
    ) {
      const infix = this.infixParseFns[this.peekToken.Type];
      if (infix === null) {
        return leftExp;
      }
      this.nextToken();
      leftExp = infix(leftExp);
    }
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

  parsePrefixExpression(): Expression {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.Literal,
    );

    this.nextToken();

    expression.right = this.parseExpression(Precedences.PREFIX);

    return expression;
  }

  parseInfixExpression(left: Expression) {
    const expression = new InfixExpression(
      this.curToken,
      left,
      this.curToken.Literal,
    );

    const precedence = this.curPrecendence();

    this.nextToken();

    expression.right = this.parseExpression(precedence);

    return expression;
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

  noPrefixParseFnError(t: TokenType) {
    this.errors.push(`no prefix parse function for ${t} found`);
  }
}
