import { InlineNode, InlineNodeType } from './types'

class Inline {
  private inlines: InlineNode[] = []
  private chars: string[]
  private text = ''

  constructor(line: string) {
    this.chars = line.split('')
  }

  private current(): string {
    return this.chars[0]
  }
  private eat(): string {
    return this.chars.shift()!
  }

  public parse(): InlineNode[] {
    while (this.chars.length > 0) {
      if (this.current() === '\\') this.parseEscape()
      else if (this.current() === '`') this.parseCode()
      else if (this.current() === '*' && this.chars[1] === '*') this.parseStrong()
      else if (this.current() === '_') this.parseEmphasis()
      else this.text += this.eat()
    }

    this.flushText()

    return this.inlines
  }
  private parseEscape(): void {
    this.flushText()
    this.eat()
    this.generateEscape(this.eat())
  }
  private parseCode(): void {
    this.flushText()
    this.eat()
    let value = ''
    while (this.chars.length > 0 && this.chars[0] !== '`') {
      value += this.eat()
    }
    this.chars.shift()
    this.inlines.push({ type: InlineNodeType.Code, value })
  }
  private parseStrong(): void {
    this.flushText()
    this.eat()
    this.eat()
    let value = ''
    while (this.chars.length > 0 && !(this.chars[0] === '*' && this.chars[1] === '*')) {
      value += this.eat()
    }
    this.chars.shift()
    this.chars.shift()
    this.inlines.push({ type: InlineNodeType.Strong, children: inline(value) })
  }
  private parseEmphasis(): void {
    this.flushText()
    this.eat()
    let value = ''
    while (this.chars.length > 0 && this.chars[0] !== '_') {
      value += this.eat()
    }
    this.chars.shift()
    this.inlines.push({ type: InlineNodeType.Emphasis, children: inline(value) })
  }

  private flushText(): void {
    if (this.text.length > 0) {
      this.inlines.push({ type: InlineNodeType.Text, value: this.text })
      this.text = ''
    }
  }
  private generateEscape(char?: string): void {
    const value = char ? `\\${char}` : '\\'
    const escaped = char ? char : ''
    this.inlines.push({ type: InlineNodeType.Escape, value, escaped })
  }
}

export function inline(line: string): InlineNode[] {
  return new Inline(line).parse()
}
