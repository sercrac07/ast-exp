export enum InlineNodeType {
  Text = 'TEXT',
  Escape = 'ESCAPE',
  Code = 'CODE',
  Strong = 'STRONG',
  Italic = 'ITALIC',
  FootnoteReference = 'FOOTNOTE_REFERENCE',
  Link = 'LINK',
  Image = 'IMAGE',
  Delete = 'DELETE',
  Highlight = 'HIGHLIGHT',
  Superscript = 'SUPERSCRIPT',
  Subscript = 'SUBSCRIPT',
  Color = 'COLOR',
  Spoiler = 'SPOILER',
}

export type InlineNode =
  | TextNode
  | EscapeNode
  | CodeNode
  | StrongNode
  | ItalicNode
  | FootnoteReferenceNode
  | LinkNode
  | ImageNode
  | DeleteNode
  | HighlightNode
  | SuperscriptNode
  | SubscriptNode
  | ColorNode
  | SpoilerNode

export interface TextNode {
  type: InlineNodeType.Text
  value: string
  raw: string
}

export interface EscapeNode {
  type: InlineNodeType.Escape
  value: string
  raw: string
}

export interface CodeNode {
  type: InlineNodeType.Code
  value: string
  raw: string
}

export interface StrongNode {
  type: InlineNodeType.Strong
  children: InlineNode[]
  raw: string
}

export interface ItalicNode {
  type: InlineNodeType.Italic
  children: InlineNode[]
  raw: string
}

export interface FootnoteReferenceNode {
  type: InlineNodeType.FootnoteReference
  value: string
  raw: string
}

export interface LinkNode {
  type: InlineNodeType.Link
  url: string
  children: InlineNode[]
  raw: string
}

export interface ImageNode {
  type: InlineNodeType.Image
  url: string
  alt: string
  raw: string
}

export interface DeleteNode {
  type: InlineNodeType.Delete
  children: InlineNode[]
  raw: string
}

export interface HighlightNode {
  type: InlineNodeType.Highlight
  children: InlineNode[]
  raw: string
}

export interface SuperscriptNode {
  type: InlineNodeType.Superscript
  children: InlineNode[]
  raw: string
}

export interface SubscriptNode {
  type: InlineNodeType.Subscript
  children: InlineNode[]
  raw: string
}

export interface ColorNode {
  type: InlineNodeType.Color
  color: string
  children: InlineNode[]
  raw: string
}

export interface SpoilerNode {
  type: InlineNodeType.Spoiler
  children: InlineNode[]
  raw: string
}
