export enum InlineNodeType {
  Text = 'TEXT',
  Escape = 'ESCAPE',
  Code = 'CODE',
  Strong = 'STRONG',
  Italic = 'ITALIC',
  Footnote = 'FOOTNOTE',
  Link = 'LINK',
  Image = 'IMAGE',
  Delete = 'DELETE',
  Highlight = 'HIGHLIGHT',
  Superscript = 'SUPERSCRIPT',
  Subscript = 'SUBSCRIPT',
  Color = 'COLOR',
}

export type InlineNode = TextNode | EscapeNode | CodeNode | StrongNode | ItalicNode | FootnoteNode | LinkNode | ImageNode | DeleteNode | HighlightNode | SuperscriptNode | SubscriptNode | ColorNode

export interface TextNode {
  type: InlineNodeType.Text
  value: string
}

export interface EscapeNode {
  type: InlineNodeType.Escape
  value: string
}

export interface CodeNode {
  type: InlineNodeType.Code
  value: string
}

export interface StrongNode {
  type: InlineNodeType.Strong
  children: InlineNode[]
}

export interface ItalicNode {
  type: InlineNodeType.Italic
  children: InlineNode[]
}

export interface FootnoteNode {
  type: InlineNodeType.Footnote
  value: string
}

export interface LinkNode {
  type: InlineNodeType.Link
  url: string
  children: InlineNode[]
}

export interface ImageNode {
  type: InlineNodeType.Image
  url: string
  alt: string
}

export interface DeleteNode {
  type: InlineNodeType.Delete
  children: InlineNode[]
}

export interface HighlightNode {
  type: InlineNodeType.Highlight
  children: InlineNode[]
}

export interface SuperscriptNode {
  type: InlineNodeType.Superscript
  children: InlineNode[]
}

export interface SubscriptNode {
  type: InlineNodeType.Subscript
  children: InlineNode[]
}

export interface ColorNode {
  type: InlineNodeType.Color
  color: string
  children: InlineNode[]
}
