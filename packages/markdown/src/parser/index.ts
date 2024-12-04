import { inline } from '../inline'
import { InlineNode } from '../inline/types'
import { lexerize } from '../lexer'
import { CodeBlockToken, FootnoteToken, HeadingToken, HorizontalRuleToken, ListToken, ParagraphToken, Token, TokenType, TokenWithValue } from '../lexer/types'
import { ListItemNode, Node, NodeType, OrderedListNode, ProgramNode, UnorderedListNode } from './types'

class Parser {
  private tokens: Token[]
  private source: string
  private children: Node[] = []
  private footnotes: Record<string, Node[]> = {}

  constructor(source: string) {
    this.source = source
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
    while (this.remaining()) {
      const token = this.current()

      if (token.type === TokenType.Paragraph) this.parseParagraph()
      else if (token.type === TokenType.LineBreak) this.parseLineBreak()
      else if (token.type === TokenType.Heading) this.parseHeading()
      else if (token.type === TokenType.CodeBlock) this.parseCodeBlock()
      else if (token.type === TokenType.BlockQuote) this.parseBlockQuote()
      else if (token.type === TokenType.List) this.parseList()
      else if (token.type === TokenType.HorizontalRule) this.parseHorizontalRule()
      else if (token.type === TokenType.Table) this.parseTable()
      else if (token.type === TokenType.Footnote) this.parseFootnote()
      else this.eat()
    }

    return { type: NodeType.Program, children: this.children, footnotes: this.footnotes, raw: this.source }
  }
  private parseParagraph(): void {
    const paragraphs: string[] = []
    while (this.remaining() && this.current().type === TokenType.Paragraph) {
      const token = this.eat() as ParagraphToken
      paragraphs.push(token.value)
    }

    this.children.push({ type: NodeType.Paragraph, children: inline(paragraphs.map(p => p.trim()).join('\n')), raw: paragraphs.join('\n') })
  }
  private parseHeading(): void {
    const token = this.eat() as HeadingToken
    const value = token.value.replace(/^\s*#+\s/, '').trim()

    this.children.push({ type: NodeType.Heading, level: token.level, children: inline(value), raw: token.value })
  }
  private parseLineBreak(): void {
    this.eat()
    this.children.push({ type: NodeType.LineBreak })
  }
  private parseCodeBlock(): void {
    const openingToken = this.eat() as CodeBlockToken
    const language = openingToken.value.match(/^\s*```(\w+)/)?.[1] || undefined
    const meta = openingToken.value.match(/^\s*```\w+\s+(.*)$/)?.[1] || undefined

    const content: string[] = []
    const rawContent: string[] = [openingToken.value]

    while (this.remaining() && this.current().type !== TokenType.CodeBlock) {
      if ('value' in this.current()) {
        const lineToken = this.eat() as TokenWithValue
        content.push(lineToken.value)
        rawContent.push(lineToken.value)
      } else {
        this.eat()
        content.push('')
        rawContent.push('')
      }
    }

    if (this.remaining() && this.current().type === TokenType.CodeBlock) {
      const closingToken = this.eat() as CodeBlockToken
      rawContent.push(closingToken.value)
    }

    this.children.push({
      type: NodeType.CodeBlock,
      language,
      meta,
      value: content.join('\n'),
      raw: rawContent.join('\n'),
    })
  }
  private parseBlockQuote(): void {
    const content: string[] = []
    const rawContent: string[] = []

    while (this.remaining() && this.current().type === TokenType.BlockQuote) {
      if ('value' in this.current()) {
        const token = this.eat() as TokenWithValue
        content.push(token.value.replace(/^\s*>/, ''))
        rawContent.push(token.value)
      } else {
        this.eat()
        content.push('')
        rawContent.push('')
      }
    }

    let callout: null | string = null
    if (/^\s*\[!.*\]\s*/.test(content[0])) {
      callout = content[0].match(/^\s*\[!(.*)\]\s*/)![1]
      content.shift()
    }

    const parsedChildren = parser(content.join('\n')).children

    this.children.push({
      type: NodeType.BlockQuote,
      children: parsedChildren,
      callout,
      raw: rawContent.join('\n'),
    })
  }
  private parseList(): void {
    const isOrdered = (this.current() as ListToken).ordered
    let node: OrderedListNode | UnorderedListNode
    if (isOrdered) {
      node = {
        type: NodeType.OrderedList,
        children: [],
        start: Number((this.current() as ListToken).value.match(/^\s*(\d+)\.\s/)![1]),
        raw: '',
      }
    } else {
      node = { type: NodeType.UnorderedList, children: [], raw: '' }
    }

    const buffer: string[] = []
    const rawBuffer: string[] = []

    const flush = () => {
      if (buffer.length > 0) {
        const checked = buffer[0].match(/^\s*\[(.)\]\s/)?.[1]
        if (checked) buffer[0] = buffer[0].replace(/^\s*\[(.)\]\s/, '')
        const itemRaw = rawBuffer.join('\n')
        const itemNode: ListItemNode = {
          type: NodeType.ListItem,
          children: parser(buffer.join('\n')).children,
          checked: checked ?? null,
          raw: itemRaw,
        }
        node.children.push(itemNode)
        node.raw += (node.raw ? '\n' : '') + itemRaw
        buffer.length = 0
        rawBuffer.length = 0
      }
    }

    while (this.remaining()) {
      if ('value' in this.current()) {
        const currentToken = this.current() as TokenWithValue
        if (currentToken.value.startsWith('  ')) {
          if (currentToken.type === TokenType.List) {
            const newBuffer: string[] = []
            const newRawBuffer: string[] = []
            while (this.remaining()) {
              if (this.current().type === TokenType.List) {
                const listToken = this.current() as ListToken
                if (listToken.value.startsWith('  ')) {
                  newBuffer.push(listToken.value.replace(/^\s{2}/, ''))
                  newRawBuffer.push(listToken.value)
                  this.eat()
                } else if ('value' in this.current()) {
                  const valueToken = this.current() as TokenWithValue
                  if (valueToken.value.startsWith('    ')) {
                    newBuffer.push(valueToken.value.replace(/^\s{2}/, ''))
                    newRawBuffer.push(valueToken.value)
                    this.eat()
                  } else break
                } else {
                  newBuffer.push('')
                  newRawBuffer.push('')
                  this.eat()
                }
              } else break
            }
            buffer.push(newBuffer.join('\n'))
            rawBuffer.push(newRawBuffer.join('\n'))
          } else {
            buffer.push(currentToken.value.replace(/^\s{2}/, ''))
            rawBuffer.push(currentToken.value)
            this.eat()
          }
        } else {
          if (currentToken.type === TokenType.List) {
            if ((currentToken as ListToken).ordered !== isOrdered) break
            flush()
            const token = this.eat() as ListToken
            buffer.push(token.value.replace(/^\s*-\s|\s*\d+\.\s/, ''))
            rawBuffer.push(token.value)
          } else break
        }
      } else if (this.current().type === TokenType.LineBreak) {
        this.eat()
        buffer.push('')
        rawBuffer.push('')
      } else break
    }

    flush()

    this.children.push(node)
  }
  private parseHorizontalRule(): void {
    const token = this.eat() as HorizontalRuleToken
    this.children.push({ type: NodeType.HorizontalRule, value: token.value })
  }
  private parseTable(): void {
    const tableRows: string[] = []
    const raw: string[] = []
    while (this.remaining() && this.current().type === TokenType.Table) {
      const token = this.eat() as TokenWithValue
      tableRows.push(token.value)
      raw.push(token.value)
    }

    if (tableRows.length < 2) {
      this.children.push(this.parseTableAsParagraph(tableRows, raw.join('\n')))
      return
    }

    if (!this.isValidAlignmentRow(tableRows[1])) {
      this.children.push(this.parseTableAsParagraph(tableRows, raw.join('\n')))
      return
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

    this.children.push({
      type: NodeType.Table,
      align,
      header,
      rows,
      raw: raw.join('\n'), // Add the raw property
    })
  }
  private parseTableAsParagraph(tableRows: string[], rawContent: string): Node {
    const content = tableRows.join('\n')
    return {
      type: NodeType.Paragraph,
      children: inline(content.trim()),
      raw: rawContent, // Add the raw property
    }
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
  private parseFootnote(): void {
    const token = this.eat() as FootnoteToken
    const name = token.value.match(/^\s*\[\^(.+)\]/)![1]

    const buffer: string[] = [token.value.match(/^\s*\[\^.+\]:(.*)/)![1]]
    const rawBuffer: string[] = [token.value]

    while (this.remaining()) {
      if ('value' in this.current()) {
        const currentToken = this.current() as TokenWithValue
        if (currentToken.value.startsWith('  ')) {
          const content = currentToken.value.replace(/^\s{2}/, '')
          buffer.push(content)
          rawBuffer.push(currentToken.value)
          this.eat()
        } else {
          break
        }
      } else if (this.current().type === TokenType.LineBreak) {
        this.eat()
        buffer.push('')
        rawBuffer.push('')
      } else {
        break
      }
    }

    const raw = rawBuffer.join('\n')
    const children = parser(buffer.join('\n')).children

    this.footnotes[name] = children
    this.children.push({
      type: NodeType.Footnote,
      name,
      children: children,
      raw: raw,
    })
  }
}

export function parser(source: string): ProgramNode {
  return new Parser(source).parse()
}
