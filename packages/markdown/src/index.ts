import { Token, Inline as TokenInline, InlineType as TokenInlineType, TokenType } from '@lexer-exp/markdown'
import { Inline, InlineType, Node, NodeType } from './types'

export { InlineType, NodeType }
export type { Inline, Node }

export default function parser(tokens: Token[]): Node {
  const program: Node = {
    type: NodeType.Program,
    children: [],
  }

  function handleInline(inline: TokenInline): Inline {
    switch (inline.type) {
      case TokenInlineType.Text: {
        return {
          type: InlineType.Text,
          value: inline.value,
        }
      }
      case TokenInlineType.Code: {
        return {
          type: InlineType.Code,
          value: inline.value,
        }
      }
      case TokenInlineType.Strong: {
        return {
          type: InlineType.Strong,
          children: inline.value.map(handleInline),
        }
      }
      case TokenInlineType.Emphasis: {
        return {
          type: InlineType.Emphasis,
          children: inline.value.map(handleInline),
        }
      }
      case TokenInlineType.Link: {
        return {
          type: InlineType.Link,
          children: inline.value.map(handleInline),
          url: inline.url,
        }
      }
      case TokenInlineType.Image: {
        return {
          type: InlineType.Image,
          alt: inline.value,
          url: inline.url,
        }
      }
    }
  }

  function handleToken(token: Token): Node {
    switch (token.type) {
      case TokenType.Paragraph: {
        return {
          type: NodeType.Paragraph,
          children: token.value.map(handleInline),
        }
      }
      case TokenType.Heading: {
        return {
          type: NodeType.Heading,
          children: token.value.map(handleInline),
          level: token.level,
        }
      }
      case TokenType.CodeBlock: {
        return {
          type: NodeType.CodeBlock,
          value: token.value,
          language: token.language,
          meta: token.meta,
        }
      }
      case TokenType.BlockQuote: {
        return {
          type: NodeType.BlockQuote,
          children: token.value.map(handleToken),
        }
      }
      case TokenType.OrderedList:
      case TokenType.UnorderedList: {
        return {
          type: NodeType.List,
          ordered: token.type === TokenType.OrderedList,
          children: token.value.map(handleToken),
        }
      }
      case TokenType.ListItem: {
        return {
          type: NodeType.ListItem,
          checked: token.checked,
          children: token.value.map(handleToken),
        }
      }
      case TokenType.Table: {
        return {
          type: NodeType.Table,
          header: token.header.map(cell => cell.map(handleInline)),
          rows: token.rows.map(row => row.map(cell => cell.map(handleInline))),
          alignment: token.alignment,
        }
      }
    }
  }

  while (tokens.length > 0) {
    const token = tokens.shift()!

    program.children.push(handleToken(token))
  }

  return program
}
