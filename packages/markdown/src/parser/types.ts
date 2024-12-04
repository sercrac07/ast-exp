import { InlineNode } from '../inline/types'

export enum NodeType {
  Program = 'PROGRAM',
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  OrderedList = 'ORDERED_LIST',
  UnorderedList = 'UNORDERED_LIST',
  ListItem = 'LIST_ITEM',
  HorizontalRule = 'HORIZONTAL_RULE',
  Table = 'TABLE',
  LineBreak = 'LINE_BREAK',
  Footnote = 'FOOTNOTE',
}

export type Node =
  | ProgramNode
  | ParagraphNode
  | HeadingNode
  | CodeBlockNode
  | BlockQuoteNode
  | OrderedListNode
  | UnorderedListNode
  | ListItemNode
  | HorizontalRuleNode
  | TableNode
  | LineBreakNode
  | FootnoteNode

export interface ProgramNode {
  type: NodeType.Program
  children: Node[]
  footnotes: Record<string, Node[]>
  raw: string
}

export interface ParagraphNode {
  type: NodeType.Paragraph
  children: InlineNode[]
  raw: string
}

export interface HeadingNode {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
  raw: string
}

export interface CodeBlockNode {
  type: NodeType.CodeBlock
  language?: string
  meta?: string
  value: string
  raw: string
}

export interface BlockQuoteNode {
  type: NodeType.BlockQuote
  children: Node[]
  callout: null | string
  raw: string
}

export interface OrderedListNode {
  type: NodeType.OrderedList
  children: ListItemNode[]
  start: number
  raw: string
}

export interface UnorderedListNode {
  type: NodeType.UnorderedList
  children: ListItemNode[]
  raw: string
}

export interface ListItemNode {
  type: NodeType.ListItem
  children: Node[]
  checked: null | string
  raw: string
}

export interface HorizontalRuleNode {
  type: NodeType.HorizontalRule
  value: string
}

export interface TableNode {
  type: NodeType.Table
  header: InlineNode[][]
  rows: InlineNode[][][]
  align: ('left' | 'center' | 'right')[]
  raw: string
}

export interface LineBreakNode {
  type: NodeType.LineBreak
}

export interface FootnoteNode {
  type: NodeType.Footnote
  name: string
  children: Node[]
  raw: string
}
