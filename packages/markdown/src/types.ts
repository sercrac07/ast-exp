/** Token types for different Markdown elements. */
export enum TokenType {
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  UnorderedList = 'UNORDERED_LIST',
  OrderedList = 'ORDERED_LIST',
  ListItem = 'LIST_ITEM',
  Table = 'TABLE',
}

/** Inline types for in-line Markdown elements. */
export enum InlineTokenType {
  Text = 'TEXT',
  Code = 'CODE',
  Strong = 'STRONG',
  Emphasis = 'EMPHASIS',
  Link = 'LINK',
  Image = 'IMAGE',
}

/** Token represents the different elements that can be parsed. */
export type Token = ParagraphToken | HeadingToken | CodeBlockToken | BlockQuoteToken | ListToken | ListItemToken | TableToken
/** Inline represents the different inline elements that can be parsed. */
export type InlineToken = TextToken | CodeToken | StrongToken | EmphasisToken | LinkToken | ImageToken

// Represents a paragraph token containing inline elements.
type ParagraphToken = {
  type: TokenType.Paragraph
  value: InlineToken[]
}

// Represents a heading token with a specific level (H1-H6).
type HeadingToken = {
  type: TokenType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  value: InlineToken[]
}

// Represents a code block token with optional language and metadata.
type CodeBlockToken = {
  type: TokenType.CodeBlock
  language?: string
  meta?: string
  value: string
}

// Represents a block quote token containing nested tokens.
type BlockQuoteToken = {
  type: TokenType.BlockQuote
  value: Token[]
}

// Represents a list token (ordered or unordered) containing list items.
type ListToken = {
  type: TokenType.UnorderedList | TokenType.OrderedList
  value: ListItemToken[]
}

// Represents an individual list item with an optional checkbox (for task lists).
export type ListItemToken = {
  type: TokenType.ListItem
  checked: null | string
  value: Token[]
}

// Represents a table token with headers and rows.
type TableToken = {
  type: TokenType.Table
  header: InlineToken[][]
  rows: InlineToken[][][]
  alignment: ('left' | 'center' | 'right' | undefined)[]
}

// Inline element for plain text.
type TextToken = {
  type: InlineTokenType.Text
  value: string
}

// Inline element for inline code.
type CodeToken = {
  type: InlineTokenType.Code
  value: string
}

// Inline element for bold text (strong emphasis).
type StrongToken = {
  type: InlineTokenType.Strong
  value: InlineToken[]
}

// Inline element for italic text (emphasis).
type EmphasisToken = {
  type: InlineTokenType.Emphasis
  value: InlineToken[]
}

// Inline element for hyperlinks.
type LinkToken = {
  type: InlineTokenType.Link
  url: string
  value: InlineToken[]
}

// Inline element for images.
type ImageToken = {
  type: InlineTokenType.Image
  url: string
  value: string
}

/** Defines the different node types for the AST. */
export enum NodeType {
  Program = 'PROGRAM',
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  List = 'LIST',
  ListItem = 'LIST_ITEM',
  Table = 'TABLE',
}

/** Defines the different inline types for nodes like text, strong, and links. */
export enum InlineNodeType {
  Text = 'TEXT',
  Code = 'CODE',
  Strong = 'STRONG',
  Emphasis = 'EMPHASIS',
  Link = 'LINK',
  Image = 'IMAGE',
}

/** Main Node type definition for the AST. */
export type Node = ProgramNode | ParagraphNode | HeadingNode | CodeBlockNode | BlockQuoteNode | ListNode | ListItemNode | TableNode

/** Main Inline type definition for inline content within block nodes. */
export type InlineNode = TextNode | CodeNode | StrongNode | EmphasisNode | LinkNode | ImageNode

/**
 * Represents the root node of the AST, containing all parsed nodes.
 */
type ProgramNode = {
  type: NodeType.Program
  children: Node[]
}

/**
 * Represents a paragraph node containing inline elements.
 */
type ParagraphNode = {
  type: NodeType.Paragraph
  children: InlineNode[]
}

/**
 * Represents a heading node, where `level` defines the heading level (h1-h6).
 */
type HeadingNode = {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

/**
 * Represents a code block node.
 */
type CodeBlockNode = {
  type: NodeType.CodeBlock
  value: string
  language?: string
  meta?: string
}

/**
 * Represents a blockquote node.
 */
type BlockQuoteNode = {
  type: NodeType.BlockQuote
  children: Node[]
}

/**
 * Represents a list node, where `ordered` indicates if it's an ordered or unordered list.
 */
type ListNode = {
  type: NodeType.List
  ordered: boolean
  children: Node[]
}

/**
 * Represents a list item node, where `checked` is used for task lists.
 */
type ListItemNode = {
  type: NodeType.ListItem
  checked: null | string
  children: Node[]
}

/**
 * Represents a table node, including its header and rows.
 */
type TableNode = {
  type: NodeType.Table
  header: InlineNode[][]
  rows: InlineNode[][][]
  alignment: ('left' | 'center' | 'right' | undefined)[]
}

/**
 * Represents inline text content.
 */
type TextNode = {
  type: InlineNodeType.Text
  value: string
}

/**
 * Represents inline code content.
 */
type CodeNode = {
  type: InlineNodeType.Code
  value: string
}

/**
 * Represents bold (strong) inline text.
 */
type StrongNode = {
  type: InlineNodeType.Strong
  children: InlineNode[]
}

/**
 * Represents italic (emphasis) inline text.
 */
type EmphasisNode = {
  type: InlineNodeType.Emphasis
  children: InlineNode[]
}

/**
 * Represents a hyperlink inline element.
 */
type LinkNode = {
  type: InlineNodeType.Link
  children: InlineNode[]
  url: string
}

/**
 * Represents an inline image element.
 */
type ImageNode = {
  type: InlineNodeType.Image
  alt: string
  url: string
}
