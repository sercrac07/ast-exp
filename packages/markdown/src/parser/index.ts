import { inline } from '../inline'
import { InlineNode } from '../inline/types'
import { lexerize } from '../lexer'
import { CodeBlockToken, FootnoteToken, HeadingToken, ListToken, ParagraphToken, Token, TokenType, TokenWithValue } from '../lexer/types'
import { Node, NodeType, OrderedListNode, ProgramNode, UnorderedListNode } from './types'

class Parser {
  private tokens: Token[]

  constructor(source: string) {
    this.tokens = lexerize(source)
  }

  private current(): Token {
    return this.tokens[0]
  }
  private eat(): Token {
    return this.tokens.shift()!
  }
  private remaining(): boolean {
    return this.current().type !== TokenType.EndOfFile
  }

  public parse(): ProgramNode {
    const program: ProgramNode = { type: NodeType.Program, children: [], footnotes: {} }

    while (this.remaining()) {
      const token = this.current()

      if (token.type === TokenType.Paragraph) program.children.push(this.parseParagraph())
      else if (token.type === TokenType.LineBreak) this.parseLineBreak()
      else if (token.type === TokenType.Heading) program.children.push(this.parseHeading())
      else if (token.type === TokenType.CodeBlock) program.children.push(this.parseCodeBlock())
      else if (token.type === TokenType.BlockQuote) program.children.push(this.parseBlockQuote())
      else if (token.type === TokenType.List) program.children.push(this.parseList())
      else if (token.type === TokenType.HorizontalRule) program.children.push(this.parseHorizontalRule())
      else if (token.type === TokenType.Table) program.children.push(this.parseTable())
      else if (token.type === TokenType.Footnote) {
        const footnote = this.parseFootnote()
        program.footnotes[footnote[0]] = footnote[1]
      } else this.eat()
    }

    return program
  }
  private parseParagraph(): Node {
    const paragraphs: string[] = []
    while (this.remaining() && this.current().type === TokenType.Paragraph) {
      const token = this.eat() as ParagraphToken
      paragraphs.push(token.value)
    }

    return { type: NodeType.Paragraph, children: inline(paragraphs.map(p => p.trim()).join('\n')) }
  }
  private parseHeading(): Node {
    const token = this.eat() as HeadingToken
    const value = token.value.replace(/^\s*#+\s/, '').trim()

    return { type: NodeType.Heading, level: token.level, children: inline(value) }
  }
  private parseLineBreak(): void {
    this.eat()
  }
  private parseCodeBlock(): Node {
    const token = this.eat() as CodeBlockToken
    const language = token.value.match(/^\s*```(\w+)/)?.[1] || undefined
    const meta = token.value.match(/^\s*```\w+\s+(.*)$/)?.[1] || undefined
    const content: string[] = []
    while (this.remaining() && this.current().type !== TokenType.CodeBlock) {
      if ('value' in this.current()) content.push((this.eat() as TokenWithValue).value)
      else {
        this.eat()
        content.push('')
      }
    }
    if (this.current().type === TokenType.CodeBlock) this.eat()
    return { type: NodeType.CodeBlock, language, meta, value: content.join('\n') }
  }
  private parseBlockQuote(): Node {
    const content: string[] = []
    while (this.remaining() && this.current().type === TokenType.BlockQuote) {
      if ('value' in this.current()) content.push((this.eat() as TokenWithValue).value.replace(/^\s*>/, ''))
      else {
        this.eat()
        content.push('')
      }
    }
    let callout: null | string = null
    if (/^\s*\[!.*\]\s*/.test(content[0])) {
      callout = content[0].match(/^\s*\[!(.*)\]\s*/)![1]
      content.shift()
    }

    return { type: NodeType.BlockQuote, children: parser(content.join('\n')).children, callout }
  }
  private parseList(): Node {
    const isOrdered = (this.current() as ListToken).ordered
    let node: OrderedListNode | UnorderedListNode
    if (isOrdered) node = { type: NodeType.OrderedList, children: [], start: Number((this.current() as ListToken).value.match(/^\s*(\d+)\.\s/)![1]) }
    else node = { type: NodeType.UnorderedList, children: [] }

    const buffer: string[] = []

    function flush() {
      if (buffer.length > 0) {
        const checked = buffer[0].match(/^\s*\[(.)\]\s/)?.[1]
        if (checked) buffer[0] = buffer[0].replace(/^\s*\[(.)\]\s/, '')
        node.children.push({ type: NodeType.ListItem, children: parser(buffer.join('\n')).children, checked: checked ?? null })
        buffer.length = 0
      }
    }

    while (this.remaining()) {
      if ('value' in this.current()) {
        if ((this.current() as ParagraphToken).value.startsWith('  ')) {
          if (this.current().type === TokenType.List) {
            const newBuffer: string[] = []
            while (this.remaining()) {
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
            buffer.push(token.value.replace(/^\s*-\s|\s*\d+\.\s/, ''))
          } else break
        }
      } else if (this.current().type === TokenType.LineBreak) {
        this.eat()
        buffer.push('')
      } else break
    }

    flush()

    return node
  }
  private parseHorizontalRule(): Node {
    this.eat()
    return { type: NodeType.HorizontalRule }
  }
  private parseTable(): Node {
    const tableRows: string[] = []
    while (this.remaining() && this.current().type === TokenType.Table) {
      tableRows.push((this.eat() as TokenWithValue).value)
    }

    if (tableRows.length < 2) {
      return this.parseTableAsParagraph(tableRows)
    }

    if (!this.isValidAlignmentRow(tableRows[1])) {
      return this.parseTableAsParagraph(tableRows)
    }

    const header = this.parseTableRow(tableRows[0])
    const length = header.length

    const align = this.parseAlignmentRow(tableRows[1])
    align.length = length
    for (let i = 0; i < length; i++) {
      if (!align[i]) align[i] = 'left'
    }

    const rows = tableRows
      .slice(2)
      .map(row => this.parseTableRow(row))
      .map(row => {
        row.length = length
        for (let i = 0; i < length; i++) {
          if (!row[i]) row[i] = []
        }
        return row
      })

    return { type: NodeType.Table, align, header, rows }
  }
  private parseTableAsParagraph(tableRows: string[]): Node {
    const content = tableRows.join('\n')
    return { type: NodeType.Paragraph, children: inline(content.trim()) }
  }
  private isValidAlignmentRow(row: string): boolean {
    return /^\s*\|(\s*(:-+:|:-{2,}|-{2,}:|-{3,})\s*\|)+\s*$/.test(row)
  }
  private parseAlignmentRow(row: string): ('left' | 'center' | 'right')[] {
    const cells = row.split('|')
    cells.shift()
    cells.pop()
    return cells.map(cell => {
      cell = cell.trim()
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center'
      else if (cell.endsWith(':')) return 'right'
      else return 'left'
    })
  }
  private parseTableRow(row: string): InlineNode[][] {
    const cells = row.split('|')
    cells.shift()
    cells.pop()
    return cells.map(cell => inline(cell.trim()))
  }
  private parseFootnote(): [string, Node[]] {
    const token = this.eat() as FootnoteToken
    const name = token.value.match(/^\s*\[\^(.+)\]/)![1]

    const buffer = [token.value.match(/^\s*\[\^.+\]:(.*)/)![1]]

    while (this.remaining()) {
      if ('value' in this.current()) {
        if ((this.current() as TokenWithValue).value.startsWith('  ')) {
          const token = (this.eat() as TokenWithValue).value.replace(/^\s{2}/, '')
          buffer.push(token)
        } else break
      } else if (this.current().type === TokenType.LineBreak) {
        this.eat()
        buffer.push('')
      } else {
        break
      }
    }

    const footnote: [string, Node[]] = [name, parser(buffer.join('\n')).children]

    return footnote
  }
}

export function parser(source: string): ProgramNode {
  return new Parser(source).parse()
}
