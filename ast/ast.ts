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
  constructor(
    public token: Token,
    public value: string,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.value;
  }
}

export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name?: Identifier,
    public value?: Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return `${this.tokenLiteral()} ${this.name?.string() ?? ''} = ${
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
    public expression: Expression | null,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.expression?.string() ?? '';
  }
}

export class IntegerLiteral implements Expression {
  constructor(
    public token: Token,
    public value: number,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.token.Literal;
  }
}

export class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right?: Expression | null,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return `(${this.operator}${this.right?.string() ?? ''})`;
  }
}

export class InfixExpression implements Expression {
  constructor(
    public token: Token,
    public left: Expression,
    public operator: string,
    public right?: Expression | null,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return `(${this.left.string()} ${this.operator} ${
      this.right?.string() ?? ''
    })`;
  }
}

export class Boolean implements Expression {
  constructor(
    public token: Token,
    public value: boolean,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.Literal;
  }

  string() {
    return this.token.Literal;
  }
}
