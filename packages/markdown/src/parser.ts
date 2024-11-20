import { inline } from './inline'
import { lexer } from './lexer'
import { BlockQuoteToken, CodeBlockToken, HeadingToken, ListToken, Node, NodeType, OrderedListNode, ParagraphToken, ProgramNode, Token, TokenType, UnorderedListNode } from './types'

class Parser {
  private tokens: Token[]

  constructor(source: string) {
    this.tokens = lexer(source)
  }

  private current(): Token {
    return this.tokens[0]
  }
  private eat(): Token {
    return this.tokens.shift()!
  }

  public parse(): ProgramNode {
    const program: ProgramNode = { type: NodeType.Program, children: [] }

    while (this.current().type !== TokenType.EndOfFile) {
      if (this.current().type === TokenType.Paragraph) program.children.push(this.parseParagraph())
      else if (this.current().type === TokenType.Heading) program.children.push(this.parseHeading())
      else if (this.current().type === TokenType.CodeBlock) program.children.push(this.parseCodeBlock())
      else if (this.current().type === TokenType.BlockQuote) program.children.push(this.parseBlockQuote())
      else if (this.current().type === TokenType.List) program.children.push(this.parseList())
      else this.eat()
    }

    return program
  }
  private parseParagraph(): Node {
    const paragraphs: string[] = []

    while (this.current().type === TokenType.Paragraph) {
      paragraphs.push((this.eat() as ParagraphToken).value)
    }

    return { type: NodeType.Paragraph, children: inline(paragraphs.join('\n')) }
  }
  private parseHeading(): Node {
    const token = this.eat() as HeadingToken
    return { type: NodeType.Heading, level: token.level, children: inline(token.value.replace(/^\s*#+\s*/, '')) }
  }
  private parseCodeBlock(): Node {
    const token = this.eat() as CodeBlockToken
    const language = token.value.match(/^\s*```(\w+)/)?.[1] || undefined
    const meta = token.value.match(/^\s*```\w+\s+(.*)$/)?.[1] || undefined
    const content: string[] = []
    while (this.current().type !== TokenType.EndOfFile && this.current().type !== TokenType.CodeBlock) {
      if ('value' in this.current()) content.push((this.eat() as any).value)
      else {
        this.eat()
        content.push('')
      }
    }
    if (this.current().type === TokenType.CodeBlock) this.eat()
    return { type: NodeType.CodeBlock, language, meta, value: content.join('\n') }
  }
  private parseBlockQuote(): Node {
    const blockQuotes: string[] = []

    while (this.current().type === TokenType.BlockQuote) {
      blockQuotes.push((this.eat() as BlockQuoteToken).value.replace(/^\s*>\s*/, ''))
    }

    return { type: NodeType.BlockQuote, children: parser(blockQuotes.join('\n')).children }
  }
  private parseList(): Node {
    const isOrdered = (this.current() as ListToken).ordered
    let node: OrderedListNode | UnorderedListNode
    if (isOrdered) node = { type: NodeType.OrderedList, children: [] }
    else node = { type: NodeType.UnorderedList, children: [] }

    const buffer: string[] = []

    function flush() {
      if (buffer.length > 0) {
        node.children.push({ type: NodeType.ListItem, children: parser(buffer.join('\n')).children })
        buffer.length = 0
      }
    }

    while (this.current().type !== TokenType.EndOfFile) {
      if ('value' in this.current()) {
        if ((this.current() as ParagraphToken).value.startsWith('  ')) {
          if (this.current().type === TokenType.List) {
            const newBuffer: string[] = []
            while (this.current().type !== TokenType.EndOfFile) {
              if (this.current().type === TokenType.List) {
                if ((this.current() as ListToken).value.startsWith('  ')) {
                  newBuffer.push((this.eat() as ListToken).value.replace(/^\s{2}/, ''))
                } else if ('value' in this.current()) {
                  if ((this.current() as ParagraphToken).value.startsWith('    ')) {
                    newBuffer.push((this.eat() as ParagraphToken).value.replace(/^\s{2}/, ''))
                  } else break
                } else newBuffer.push('')
              } else break
            }
            buffer.push(newBuffer.join('\n'))
          } else {
            buffer.push((this.eat() as ParagraphToken).value.replace(/^\s{2}/, ''))
          }
        } else {
          if (this.current().type === TokenType.List) {
            if ((this.current() as ListToken).ordered !== isOrdered) break
            flush()
            const token = this.eat() as ListToken
            buffer.push(token.value.replace(/^-\s|\d+\.\s/, ''))
          } else break
        }
      } else if (this.current().type === TokenType.NewLine) {
        this.eat()
        buffer.push('')
      } else break
    }

    flush()

    return node
  }
}

/**
 * Generates an AST from a Markdown source.
 *
 * [API Reference](https://github.com/sercrac07/ast-exp/tree/master/packages/markdown#parsersource)
 */
export function parser(source: string): ProgramNode {
  return new Parser(source).parse()
}
