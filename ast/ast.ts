import { Token } from '../token/token.ts';

export interface Node {
  tokenLiteral: () => string;
  string: () => string;
}

export interface Statement extends Node {
  statementNode: () => void;
}

export interface Expression extends Node {
  expressionNode: () => void;
}

export class Program implements Node {
  statements: Statement[] = [];

  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
  }

  string() {
    let result = '';
    for (const i of this.statements) {
      result += i.string();
    }
    return result;
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;

  constructor(i: { token: Token; value: string }) {
    this.token = i.token;
    this.value = i.value;
  }

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.value;
  }
}

export class LetStatement implements Statement {
  token: Token;
  name?: Identifier;
  value?: Expression;

  constructor(i: { token: Token; name?: Identifier; value?: Expression }) {
    this.token = i.token;
    this.name = i.name;
    this.value = i.value;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return `${this.tokenLiteral()} ${this.name?.string()} = ${
      this.value?.string() ?? ''
    };`;
  }
}

export class ReturnStatement implements Statement {
  constructor(
    public token: Token,
    public returnValue?: Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return `${this.tokenLiteral()} ${this.returnValue?.string ?? ''};`;
  }
}

export class ExpressionStatement implements Statement {
  constructor(
    public token: Token,
    public expression: Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.expression.string();
  }
}
