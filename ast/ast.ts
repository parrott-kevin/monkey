import { Token } from '../token/token.ts';

export interface Node {
  tokenLiteral: () => string;
}

export interface Statement extends Node {
  statementNode: () => void;
}

export interface Expression extends Node {
  expressionNode: () => void;
}

export class Program {
  statements: Statement[] = [];

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
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
  tokenLiteral(): string {
    return this.token.Literal;
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
  tokenLiteral(): string {
    return this.token.Literal;
  }
}

export class ReturnStatement implements Statement {
  token: Token;
  returnValue?: Expression;

  constructor(i: { token: Token; returnValue?: Expression }) {
    this.token = i.token;
  }

  statementNode() {}
  tokenLiteral(): string {
    return this.token.Literal;
  }
}
