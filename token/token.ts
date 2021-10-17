export type TokenType = string;

export interface Token {
  Type: TokenType;
  Literal: string;
}

export enum Tokens {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  // identifiers + literals
  IDENT = 'IDENT',
  INT = 'INT',

  // operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  BANG = '!',
  ASTERISK = '*',
  SLASH = '/',

  LT = '<',
  GT = '>',

  EQ = '==',
  NOT_EQ = '!=',

  // delimiters
  COMMA = ',',
  SEMICOLON = ';',

  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',

  // keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

export const keywords: { [index: string]: Tokens } = {
  'fn': Tokens.FUNCTION,
  'let': Tokens.LET,
  'true': Tokens.TRUE,
  'false': Tokens.FALSE,
  'if': Tokens.IF,
  'else': Tokens.ELSE,
  'return': Tokens.RETURN,
};

export const lookupIdent = (ident: string): TokenType => {
  if (keywords[ident]) {
    return keywords[ident];
  }
  return Tokens.IDENT;
};
