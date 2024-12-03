export enum TokenType {
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  List = 'LIST',
  Table = 'TABLE',
  HorizontalRule = 'HORIZONTAL_RULE',
  Footnote = 'FOOTNOTE',

  LineBreak = 'LINE_BREAK',
  EndOfFile = 'END_OF_FILE',
}

export type Token = TokenWithValue | TokenWithoutValue
export type TokenWithValue = ParagraphToken | HeadingToken | CodeBlockToken | BlockQuoteToken | ListToken | TableToken | HorizontalRuleToken | FootnoteToken
export type TokenWithoutValue = LineBreakToken | EndOfFileToken

export interface ParagraphToken {
  type: TokenType.Paragraph
  value: string
}

export interface HeadingToken {
  type: TokenType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  value: string
}

export interface CodeBlockToken {
  type: TokenType.CodeBlock
  value: string
}

export interface BlockQuoteToken {
  type: TokenType.BlockQuote
  value: string
}

export interface ListToken {
  type: TokenType.List
  value: string
  ordered: boolean
}

export interface TableToken {
  type: TokenType.Table
  value: string
}

export interface HorizontalRuleToken {
  type: TokenType.HorizontalRule
  value: string
}

export interface FootnoteToken {
  type: TokenType.Footnote
  value: string
}

export interface LineBreakToken {
  type: TokenType.LineBreak
}

export interface EndOfFileToken {
  type: TokenType.EndOfFile
}
