import { Token, TokenType } from './types'

class Lexer {
  private sources: string[]

  constructor(source: string) {
    this.sources = source.split(/\r?\n/)
  }

  private current(): string {
    return this.sources[0]
  }
  private eat(): string {
    return this.sources.shift()!
  }
  private remaining(): boolean {
    return this.sources.length > 0
  }

  public tokenize(): Token[] {
    const tokens: Token[] = []

    while (this.remaining()) {
      tokens.push(this.tokenizeLine())
    }

    tokens.push({ type: TokenType.EndOfFile })

    return tokens
  }

  private tokenizeLine(): Token {
    const value = this.current()
    const cleaned = value.replace(/^\s*/, '')

    if (cleaned.length === 0) return this.tokenizeLineBreak()
    if (/^#{1,6}\s/.test(cleaned)) return this.tokenizeHeading()
    else if (/^```/.test(cleaned)) return this.tokenizeCodeBlock()
    else if (/^>/.test(cleaned)) return this.tokenizeBlockQuote()
    else if (/^-\s/.test(cleaned) || /^\d+\.\s/.test(cleaned)) return this.lexerizeList()
    else if (/^-{3,}\s*$/.test(cleaned)) return this.tokenizeHorizontalRule()
    else if (/^\|(.+\|)+\s*$/.test(cleaned)) return this.tokenizeTable()
    else if (/^\[\^.+\]:/.test(cleaned)) return this.tokenizeFootnote()
    else return this.tokenizeParagraph()
  }
  private tokenizeLineBreak(): Token {
    this.eat()
    return { type: TokenType.LineBreak }
  }
  private tokenizeParagraph(): Token {
    const value = this.eat()
    return { type: TokenType.Paragraph, value }
  }
  private tokenizeHeading(): Token {
    const value = this.eat()
    const level = value.match(/^\s*(#{1,6})\s/)![1].length as 1 | 2 | 3 | 4 | 5 | 6
    return { type: TokenType.Heading, level, value }
  }
  private tokenizeCodeBlock(): Token {
    const value = this.eat()
    return { type: TokenType.CodeBlock, value }
  }
  private tokenizeBlockQuote(): Token {
    const value = this.eat()
    return { type: TokenType.BlockQuote, value }
  }
  private lexerizeList(): Token {
    const token = this.eat()
    const ordered = /^\s*\d+\.\s/.test(token)
    return { type: TokenType.List, value: token, ordered }
  }
  private tokenizeHorizontalRule(): Token {
    const value = this.eat()
    return { type: TokenType.HorizontalRule, value }
  }
  private tokenizeTable(): Token {
    const value = this.eat()
    return { type: TokenType.Table, value }
  }
  private tokenizeFootnote(): Token {
    const value = this.eat()
    return { type: TokenType.Footnote, value }
  }
}

/**
 * Generate a list of tokens from the given Markdown source.
 *
 * [API Reference](https://github.com/sercrac07/ast-exp/tree/master/packages/markdown#lexersource)
 */
export function lexerize(source: string): Token[] {
  return new Lexer(source).tokenize()
}
