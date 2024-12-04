import { InlineNode, InlineNodeType } from './types'

class Inline {
  private chars: string[]
  private nodes: InlineNode[] = []
  private text = ''

  private ESCAPES = ['\\', '`', '*', '_', '[', ']', '(', ')', '!', '~', '=', '^', '#', '>', '-', '.', '|', ':']

  constructor(line: string) {
    this.chars = line.split('')
  }

  private current(): string {
    return this.chars[0]
  }
  private eat(): string {
    return this.chars.shift()!
  }
  private remaining(): boolean {
    return this.chars.length > 0
  }

  public parse(): InlineNode[] {
    while (this.remaining()) {
      if (this.current() === '\\') this.parseEscape()
      else if (this.current() === '`') this.parseCode()
      else if (this.current() === '*' && this.chars[1] === '*') this.parseStrong()
      else if (this.current() === '_') this.parseItalic()
      else if (this.current() === '[' && this.chars[1] === '^') this.parseFootnote()
      else if (this.current() === '[') this.parseLink()
      else if (this.current() === '!' && this.chars[1] === '[') this.parseImage()
      else if (this.current() === '~' && this.chars[1] === '~') this.parseDelete()
      else if (this.current() === '=' && this.chars[1] === '=') this.parseHighlight()
      else if (this.current() === '^') this.parseSuperscript()
      else if (this.current() === '~') this.parseSubscript()
      else if (this.current() === '#' && this.chars[1] === '[') this.parseColor()
      else if (this.current() === '|') this.parseSpoiler()
      else if (this.current() === '#') this.parseTag()
      else this.text += this.eat()
    }

    this.flushText()

    return this.nodes
  }

  private parseEscape(): void {
    this.flushText()
    this.eat()
    if (this.remaining()) {
      if (this.ESCAPES.includes(this.current())) {
        const value = this.eat()
        this.nodes.push({ type: InlineNodeType.Escape, value, raw: `\\${value}` })
      } else this.text += '\\'
    } else this.text += '\\'
  }
  private parseCode(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== '`') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== '`') this.chars.unshift(...`\\\`${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Code, value, raw: `\`${value}\`` })
    }
  }
  private parseStrong(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && !(this.current() === '*' && this.chars[1] === '*')) {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (!(this.current() === '*' && this.chars[1] === '*')) this.chars.unshift(...`\\**${value}`)
    else {
      this.flushText()
      this.eat()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Strong, children: inline(value), raw: `**${value}**` })
    }
  }
  private parseItalic(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== '_') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== '_') this.chars.unshift(...`\\_${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Italic, children: inline(value), raw: `_${value}_` })
    }
  }
  private parseFootnote(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== ']') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== ']') this.chars.unshift(...`\\[^${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.FootnoteReference, value, raw: `[^${value}]` })
    }
  }
  private parseLink(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== ']') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== ']') this.chars.unshift(...`\\[${value}`)
    else {
      this.eat()
      if (this.current() === '(') {
        this.eat()
        let url = ''
        while (this.remaining() && this.current() !== ')') {
          if (this.current() === '\\' && this.chars[1]) url += this.eat()
          url += this.eat()
        }
        if (this.current() !== ')') this.chars.unshift(...`\\[${value}](${url}`)
        else {
          this.flushText()
          this.eat()
          this.nodes.push({ type: InlineNodeType.Link, url, children: inline(value), raw: `[${value}](${url})` })
        }
      } else {
        this.chars.unshift(...`\\[${value}]`)
      }
    }
  }
  private parseImage(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== ']') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== ']') this.chars.unshift(...`\\![${value}`)
    else {
      this.eat()
      if (this.current() === '(') {
        this.eat()
        let url = ''
        while (this.remaining() && this.current() !== ')') {
          if (this.current() === '\\' && this.chars[1]) url += this.eat()
          url += this.eat()
        }
        if (this.current() !== ')') this.chars.unshift(...`\\![${value}](${url}`)
        else {
          this.flushText()
          this.eat()
          this.nodes.push({ type: InlineNodeType.Image, url, alt: value, raw: `![${value}](${url})` })
        }
      } else {
        this.chars.unshift(...`\\![${value}]`)
      }
    }
  }
  private parseDelete(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && !(this.current() === '~' && this.chars[1] === '~')) {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (!(this.current() === '~' && this.chars[1] === '~')) this.chars.unshift(...`\\~~${value}`)
    else {
      this.flushText()
      this.eat()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Delete, children: inline(value), raw: `~~${value}~~` })
    }
  }
  private parseHighlight(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && !(this.current() === '=' && this.chars[1] === '=')) {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (!(this.current() === '=' && this.chars[1] === '=')) this.chars.unshift(...`\\==${value}`)
    else {
      this.flushText()
      this.eat()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Highlight, children: inline(value), raw: `==${value}==` })
    }
  }
  private parseSuperscript(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== '^') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== '^') this.chars.unshift(...`\\^${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Superscript, children: inline(value), raw: `^${value}^` })
    }
  }
  private parseSubscript(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== '~') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== '~') this.chars.unshift(...`\\~${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Subscript, children: inline(value), raw: `~${value}~` })
    }
  }
  private parseColor(): void {
    this.eat()
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== ']') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== ']') this.chars.unshift(...`\\#[${value}`)
    else {
      this.eat()
      if (this.current() === '(') {
        this.eat()
        let color = ''
        while (this.remaining() && this.current() !== ')') {
          if (this.current() === '\\' && this.chars[1]) color += this.eat()
          color += this.eat()
        }
        if (this.current() !== ')') this.chars.unshift(...`\\#[${value}](${color}`)
        else {
          this.flushText()
          this.eat()
          this.nodes.push({ type: InlineNodeType.Color, children: inline(value), color, raw: `#[${value}](${color})` })
        }
      } else {
        this.chars.unshift(...`\\#[${value}]`)
      }
    }
  }
  private parseSpoiler(): void {
    this.eat()
    let value = ''
    while (this.remaining() && this.current() !== '|') {
      if (this.current() === '\\' && this.chars[1]) value += this.eat()
      value += this.eat()
    }
    if (this.current() !== '|') this.chars.unshift(...`\\|${value}`)
    else {
      this.flushText()
      this.eat()
      this.nodes.push({ type: InlineNodeType.Spoiler, children: inline(value), raw: `|${value}|` })
    }
  }
  private parseTag(): void {
    this.eat()
    let value = ''
    while (this.remaining() && !/\s/.test(this.current())) {
      value += this.eat()
    }
    this.flushText()
    this.nodes.push({ type: InlineNodeType.Tag, value, raw: `#${value}` })
  }

  private flushText(): void {
    if (this.text.length > 0) {
      this.nodes.push({ type: InlineNodeType.Text, value: this.text.replace(/ +/g, ' '), raw: this.text })
      this.text = ''
    }
  }
}

/**
 * Generate an AST from the given inline Markdown source.
 *
 * [API Reference](https://github.com/sercrac07/ast-exp/tree/master/packages/markdown#inlinesource)
 */
export function inline(line: string): InlineNode[] {
  return new Inline(line).parse()
}
