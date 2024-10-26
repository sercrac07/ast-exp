import lexerize from './lexer'
import { InlineNode, InlineNodeType, InlineToken, InlineTokenType, Node, NodeType, Token, TokenType } from './types'

/**
 * Parses a Markdown string into an AST.
 */
export default function parser(source: string): Node {
  const tokens = lexerize(source)

  const program: Node = {
    type: NodeType.Program,
    children: [],
  }

  /**
   * Converts an inline token to its corresponding Inline node representation.
   */
  function handleInline(inline: InlineToken): InlineNode {
    switch (inline.type) {
      case InlineTokenType.Text: {
        return {
          type: InlineNodeType.Text,
          value: inline.value,
        }
      }
      case InlineTokenType.Code: {
        return {
          type: InlineNodeType.Code,
          value: inline.value,
        }
      }
      case InlineTokenType.Strong: {
        return {
          type: InlineNodeType.Strong,
          children: inline.value.map(handleInline),
        }
      }
      case InlineTokenType.Emphasis: {
        return {
          type: InlineNodeType.Emphasis,
          children: inline.value.map(handleInline),
        }
      }
      case InlineTokenType.Link: {
        return {
          type: InlineNodeType.Link,
          children: inline.value.map(handleInline),
          url: inline.url,
        }
      }
      case InlineTokenType.Image: {
        return {
          type: InlineNodeType.Image,
          alt: inline.value,
          url: inline.url,
        }
      }
    }
  }

  /**
   * Converts a block-level token to its corresponding Node representation.
   */
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

  // Process tokens and build the AST.
  while (tokens.length > 0) {
    const token = tokens.shift()!
    program.children.push(handleToken(token))
  }

  return program
}
