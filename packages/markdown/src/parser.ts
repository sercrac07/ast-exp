import { inline } from './inline'
import { lexer } from './lexer'
import { BlockQuoteToken, CodeBlockToken, HeadingToken, ListItemNode, ListToken, Node, NodeType, ParagraphToken, ProgramNode, Token, TokenType } from './types'

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
    const listItems: string[] = []
    const isOrdered = (this.current() as ListToken).ordered

    while (this.current().type !== TokenType.EndOfFile) {
      if (this.current().type === TokenType.List) listItems.push((this.eat() as ListToken).value.replace(/^\s*-\s|\s*\d+\.\s/, ''))
      else if (!('value' in this.current())) {
        this.eat()
        listItems.push('')
      } else if ((this.current() as any).value.startsWith('  ')) listItems.push((this.eat() as any).value.replace(/^\s{2}/, ''))
      else break
    }

    const children: ListItemNode[] = parser(listItems.join('\n')).children.map(child => ({ type: NodeType.ListItem, children: [child] }))

    if (isOrdered) return { type: NodeType.OrderedList, children }
    return { type: NodeType.UnorderedList, children }
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
