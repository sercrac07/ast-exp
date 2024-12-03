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
}

export type Node = ProgramNode | ParagraphNode | HeadingNode | CodeBlockNode | BlockQuoteNode | OrderedListNode | UnorderedListNode | ListItemNode | HorizontalRuleNode | TableNode

export interface ProgramNode {
  type: NodeType.Program
  children: Node[]
  footnotes: Record<string, Node[]>
}

export interface ParagraphNode {
  type: NodeType.Paragraph
  children: InlineNode[]
}

export interface HeadingNode {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

export interface CodeBlockNode {
  type: NodeType.CodeBlock
  language?: string
  meta?: string
  value: string
}

export interface BlockQuoteNode {
  type: NodeType.BlockQuote
  children: Node[]
  callout: null | string
}

export interface OrderedListNode {
  type: NodeType.OrderedList
  children: ListItemNode[]
  start: number
}

export interface UnorderedListNode {
  type: NodeType.UnorderedList
  children: ListItemNode[]
}

export interface ListItemNode {
  type: NodeType.ListItem
  children: Node[]
  checked: null | string
}

export interface HorizontalRuleNode {
  type: NodeType.HorizontalRule
}

export interface TableNode {
  type: NodeType.Table
  header: InlineNode[][]
  rows: InlineNode[][][]
  align: ('left' | 'center' | 'right')[]
}
