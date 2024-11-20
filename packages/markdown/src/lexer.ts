import { Token, TokenType } from './types'

class Lexer {
  sources: string[]

  constructor(source: string) {
    this.sources = source.split(/\r?\n/g)
  }

  private current(): string {
    return this.sources[0]
  }
  private eat(): string {
    return this.sources.shift()!
  }

  public lexerize(): Token[] {
    const tokens: Token[] = []

    while (this.sources.length > 0) {
      // TODO: revisar los `trim()`
      if (this.current().trim() === '') tokens.push(this.lexerizeNewLine())
      else if (/^\s*#{1,6}\s/.test(this.current())) tokens.push(this.lexerizeHeading())
      else if (/^\s*```/.test(this.current())) tokens.push(this.lexerizeCodeBlock())
      else if (/^\s*>/.test(this.current())) tokens.push(this.lexerizeBlockQuote())
      else if (/^\s*-\s/.test(this.current()) || /^\s*\d+\.\s/.test(this.current())) tokens.push(this.lexerizeList())
      else tokens.push(this.lexerizeParagraph())
    }

    tokens.push({ type: TokenType.EndOfFile })

    return tokens
  }

  private lexerizeNewLine(): Token {
    this.eat()
    return { type: TokenType.NewLine }
  }
  private lexerizeParagraph(): Token {
    return { type: TokenType.Paragraph, value: this.eat() }
  }
  private lexerizeHeading(): Token {
    const level = this.current().match(/^\s*(#+)\s/)![1].length as 1 | 2 | 3 | 4 | 5 | 6
    return { type: TokenType.Heading, level, value: this.eat() }
  }
  private lexerizeCodeBlock(): Token {
    return { type: TokenType.CodeBlock, value: this.eat() }
  }
  private lexerizeBlockQuote(): Token {
    return { type: TokenType.BlockQuote, value: this.eat() }
  }
  private lexerizeList(): Token {
    const token = this.eat()
    const ordered = /^\s*\d+\.\s/.test(token)
    return { type: TokenType.List, value: token, ordered }
  }
}

/**
 * Generates a list of tokens from a Markdown source.
 *
 * [API Reference](https://github.com/sercrac07/ast-exp/tree/master/packages/markdown#lexersource)
 */
export function lexer(source: string): Token[] {
  return new Lexer(source).lexerize()
}
