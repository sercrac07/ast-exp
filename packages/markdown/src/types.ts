export enum TokenType {
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  List = 'LIST',

  NewLine = 'NEW_LINE',
  EndOfFile = 'END_OF_FILE',
}

export type Token = ParagraphToken | HeadingToken | CodeBlockToken | BlockQuoteToken | ListToken | NewLineToken | EndOfFileToken

export type ParagraphToken = {
  type: TokenType.Paragraph
  value: string
}

export type HeadingToken = {
  type: TokenType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  value: string
}

export type CodeBlockToken = {
  type: TokenType.CodeBlock
  value: string
}

export type BlockQuoteToken = {
  type: TokenType.BlockQuote
  value: string
}

export type ListToken = {
  type: TokenType.List
  value: string
  ordered: boolean
}

export type NewLineToken = {
  type: TokenType.NewLine
}

export type EndOfFileToken = {
  type: TokenType.EndOfFile
}

export enum NodeType {
  Program = 'PROGRAM',

  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  OrderedList = 'ORDERED_LIST',
  UnorderedList = 'UNORDERED_LIST',
  ListItem = 'LIST_ITEM',
}

export type Node = ProgramNode | ParagraphNode | HeadingNode | CodeBlockNode | BlockQuoteNode | OrderedListNode | UnorderedListNode | ListItemNode

export type ProgramNode = {
  type: NodeType.Program
  children: Node[]
}

export type ParagraphNode = {
  type: NodeType.Paragraph
  children: InlineNode[]
}

export type HeadingNode = {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

export type CodeBlockNode = {
  type: NodeType.CodeBlock
  language?: string
  meta?: string
  value: string
}

export type BlockQuoteNode = {
  type: NodeType.BlockQuote
  children: Node[]
}

export type OrderedListNode = {
  type: NodeType.OrderedList
  children: ListItemNode[]
}

export type UnorderedListNode = {
  type: NodeType.UnorderedList
  children: ListItemNode[]
}

export type ListItemNode = {
  type: NodeType.ListItem
  children: Node[]
}

export enum InlineNodeType {
  Text = 'TEXT',
  Code = 'CODE',
  Strong = 'STRONG',
  Emphasis = 'EMPHASIS',

  Escape = 'ESCAPE',
}

export type InlineNode = TextNode | CodeNode | StrongNode | EmphasisNode | EscapeNode

export type TextNode = {
  type: InlineNodeType.Text
  value: string
}

export type CodeNode = {
  type: InlineNodeType.Code
  value: string
}

export type StrongNode = {
  type: InlineNodeType.Strong
  children: InlineNode[]
}

export type EmphasisNode = {
  type: InlineNodeType.Emphasis
  children: InlineNode[]
}

export type EscapeNode = {
  type: InlineNodeType.Escape
  value: string
  escaped: string
}
