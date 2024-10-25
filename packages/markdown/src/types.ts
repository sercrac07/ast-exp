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
export enum InlineType {
  Text = 'TEXT',
  Code = 'CODE',
  Strong = 'STRONG',
  Emphasis = 'EMPHASIS',
  Link = 'LINK',
  Image = 'IMAGE',
}

/** Main Node type definition for the AST. */
export type Node = Program | Paragraph | Heading | CodeBlock | BlockQuote | List | ListItem | Table

/** Main Inline type definition for inline content within block nodes. */
export type Inline = Text | Code | Strong | Emphasis | Link | Image

/**
 * Represents the root node of the AST, containing all parsed nodes.
 */
type Program = {
  type: NodeType.Program
  children: Node[]
}

/**
 * Represents a paragraph node containing inline elements.
 */
type Paragraph = {
  type: NodeType.Paragraph
  children: Inline[]
}

/**
 * Represents a heading node, where `level` defines the heading level (h1-h6).
 */
type Heading = {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: Inline[]
}

/**
 * Represents a code block node.
 */
type CodeBlock = {
  type: NodeType.CodeBlock
  value: string
  language?: string
  meta?: string
}

/**
 * Represents a blockquote node.
 */
type BlockQuote = {
  type: NodeType.BlockQuote
  children: Node[]
}

/**
 * Represents a list node, where `ordered` indicates if it's an ordered or unordered list.
 */
type List = {
  type: NodeType.List
  ordered: boolean
  children: Node[]
}

/**
 * Represents a list item node, where `checked` is used for task lists.
 */
type ListItem = {
  type: NodeType.ListItem
  checked: null | string
  children: Node[]
}

/**
 * Represents a table node, including its header and rows.
 */
type Table = {
  type: NodeType.Table
  header: Inline[][]
  rows: Inline[][][]
  alignment?: ('left' | 'center' | 'right' | undefined)[]
}

/**
 * Represents inline text content.
 */
type Text = {
  type: InlineType.Text
  value: string
}

/**
 * Represents inline code content.
 */
type Code = {
  type: InlineType.Code
  value: string
}

/**
 * Represents bold (strong) inline text.
 */
type Strong = {
  type: InlineType.Strong
  children: Inline[]
}

/**
 * Represents italic (emphasis) inline text.
 */
type Emphasis = {
  type: InlineType.Emphasis
  children: Inline[]
}

/**
 * Represents a hyperlink inline element.
 */
type Link = {
  type: InlineType.Link
  children: Inline[]
  url: string
}

/**
 * Represents an inline image element.
 */
type Image = {
  type: InlineType.Image
  alt: string
  url: string
}
