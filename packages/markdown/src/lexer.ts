import { InlineToken, InlineTokenType, ListItemToken, Token, TokenType } from './types'

/**
 * This function takes a Markdown source string as input and returns an array of tokens.
 * It processes the input line by line, identifying various Markdown structures such as
 * headings, paragraphs, code blocks, block quotes, lists, and in-line elements (like
 * bold, italic, links, and images).
 */
export default function lexerize(source: string): Token[] {
  const tokens: Token[] = []
  const lines = source.split(/\r?\n/g) // Split source into lines
  const paragraphBuffer: string[] = [] // Buffer to collect paragraph content

  // Process inline elements like text, emphasis, links, etc.
  function handleInline(line: string): InlineToken[] {
    const inlines: InlineToken[] = []
    const chars = line.split('') // Convert line into array of characters
    let text = ''

    // Add text to inlines and reset buffer
    function handleText() {
      if (text.length === 0) return
      inlines.push({ type: InlineTokenType.Text, value: text })
      text = ''
    }

    // Loop through each character
    while (chars.length > 0) {
      const char = chars.shift()!

      // Handle escaped characters
      if (char === '\\') {
        if (chars[0]) text += chars.shift()!
      }
      // Handle inline code
      else if (char === '`') {
        handleText()
        let code = ''
        while (chars.length > 0 && chars[0] !== '`') {
          if (chars[0] === '\\') chars.shift()
          code += chars.shift()!
        }
        chars.shift()
        inlines.push({ type: InlineTokenType.Code, value: code })
      }
      // Handle strong emphasis (bold)
      else if ((char === '*' || char === '_') && chars[0] === char) {
        handleText()
        chars.shift()
        let strong = ''
        while (chars.length > 0 && !(chars[0] === char && chars[1] === char)) {
          if (chars[0] === ('\\' as any)) strong += chars.shift()
          strong += chars.shift()!
        }
        chars.shift()
        chars.shift()
        inlines.push({ type: InlineTokenType.Strong, value: handleInline(strong) })
      }
      // Handle emphasis (italic)
      else if (char === '*' || char === '_') {
        handleText()
        let emphasis = ''
        while (chars.length > 0 && chars[0] !== char) {
          if (chars[0] === '\\') emphasis += chars.shift()
          emphasis += chars.shift()!
        }
        chars.shift()
        inlines.push({ type: InlineTokenType.Emphasis, value: handleInline(emphasis) })
      }
      // Handle links and images
      else if (char === '[') {
        let value = ''
        while (chars.length > 0 && chars[0] !== ']') {
          if (chars[0] === '\\') chars.shift()
          value += chars.shift()!
        }
        chars.shift()
        if (chars[0] === '(') {
          handleText()
          chars.shift()
          let url = ''
          while (chars.length > 0 && chars[0] !== (')' as any)) {
            if (chars[0] === ('\\' as any)) chars.shift()
            url += chars.shift()!
          }
          chars.shift()
          inlines.push({ type: InlineTokenType.Link, url, value: handleInline(value) })
        } else text += `[${value}]`
      }
      // Handle images
      else if (char === '!' && chars[0] === '[') {
        chars.shift()
        let value = ''
        while (chars.length > 0 && chars[0] !== (']' as any)) {
          if (chars[0] === ('\\' as any)) chars.shift()
          value += chars.shift()!
        }
        chars.shift()
        if (chars[0] === ('(' as any)) {
          handleText()
          chars.shift()
          let url = ''
          while (chars.length > 0 && chars[0] !== (')' as any)) {
            if (chars[0] === ('\\' as any)) chars.shift()
            url += chars.shift()!
          }
          chars.shift()
          inlines.push({ type: InlineTokenType.Image, url, value })
        } else text += `![${value}]`
      }
      // Handle HTML comments
      else if (char === '<' && chars[0] === '!' && chars[1] === '-' && chars[2] === '-') {
        handleText()
        chars.shift()
        chars.shift()
        chars.shift()
        chars.shift()
        while (chars.length > 0 && !(chars[0] === ('-' as any) && chars[1] === '-' && chars[2] === ('>' as any))) {
          if (chars[0] === ('\\' as any)) chars.shift()
          chars.shift()!
        }
        chars.shift()
        chars.shift()
        chars.shift()
      }
      // Collect remaining text
      else {
        text += char
      }
    }

    handleText()
    return inlines
  }

  // Main loop for processing each line
  while (lines.length > 0) {
    const line = lines.shift()!

    // Handle the buffered paragraph content
    function handleBuffer() {
      if (paragraphBuffer.length === 0) return
      if (paragraphBuffer.join('') === '') return

      tokens.push({
        type: TokenType.Paragraph,
        value: handleInline(paragraphBuffer.join('\n')),
      })
      paragraphBuffer.length = 0
    }

    // Detect headings
    const isHeading = /^(#{1,6})\s/.exec(line)
    if (isHeading) {
      handleBuffer()

      const headingLevel = isHeading[1].length as 1 | 2 | 3 | 4 | 5 | 6
      const heading = line.replace(/^#+\s+/, '')

      tokens.push({
        type: TokenType.Heading,
        level: headingLevel,
        value: handleInline(heading),
      })
    }
    // Handle code blocks
    else if (line.startsWith('```')) {
      handleBuffer()
      const codeBlock: string[] = []
      const match = line.match(/^```(\w+|\s)\s*(.*)/)
      const language = match?.[1]
      const meta = match?.[2]
      while (lines.length > 0 && !lines[0].startsWith('```')) {
        codeBlock.push(lines.shift()!)
      }
      lines.shift()
      tokens.push({
        type: TokenType.CodeBlock,
        language: language === ' ' ? undefined : language,
        meta: meta === '' ? undefined : meta,
        value: codeBlock.join('\n'),
      })
    }
    // Handle block quotes
    else if (line.startsWith('> ')) {
      handleBuffer()
      const blockQuote: string[] = [line.replace(/^>\s+/, '')]
      while (lines.length > 0 && lines[0].startsWith('> ')) {
        blockQuote.push(lines.shift()!.replace(/^>\s+/, ''))
      }
      tokens.push({
        type: TokenType.BlockQuote,
        value: lexerize(blockQuote.join('\n')),
      })
    }
    // Handle lists
    else if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      handleBuffer()
      const isOrdered = /^\d+\.\s/.test(line)
      const cleanLine = isOrdered ? line.replace(/^\d+\.\s/, '') : line.replace(/^-\s+/, '')
      const match = cleanLine.match(/^\[(.)\]\s(.+)/)
      const checked = match?.[1] ?? null
      const content = match?.[2] ?? cleanLine
      const list: ListItemToken[] = [{ type: TokenType.ListItem, checked, value: lexerize(content) }]
      const leveledList: string[] = []

      while ((lines.length > 0 && (isOrdered ? /^\d+\.\s/.test(lines[0]) : /^-\s+/.test(lines[0]))) || /^\s{2,}/.test(lines[0])) {
        if (/^\s{2,}/.test(lines[0])) leveledList.push(lines.shift()!.replace(/^\s{2}/, ''))
        else {
          if (leveledList.length > 0 && lexerize(leveledList.join('\n'))[0]) {
            list[list.length - 1].value.push(lexerize(leveledList.join('\n'))[0])
            leveledList.length = 0
          }
          const cleanLine = isOrdered ? lines.shift()!.replace(/^\d+\.\s/, '') : lines.shift()!.replace(/^-\s+/, '')
          const match = cleanLine.match(/^\[(.)\]\s(.+)/)
          const checked = match?.[1] ?? null
          const content = match?.[2] ?? cleanLine
          list.push({ type: TokenType.ListItem, checked, value: lexerize(content) })
        }
      }
      if (leveledList.length > 0 && lexerize(leveledList.join('\n'))[0]) list[list.length - 1].value.push(lexerize(leveledList.join('\n'))[0])
      tokens.push({
        type: isOrdered ? TokenType.OrderedList : TokenType.UnorderedList,
        value: list,
      })
    }
    // Handle tables
    else if (/^\|(.+)\|$/.test(line)) {
      // Validate next line is a valid separator
      if (/^\|(\s*[-:]{3,}\s*\|)+$/.test(lines[0])) {
        const alignment = lines
          .shift()!
          .split('|')
          .slice(1, -1)
          .map(cell => {
            const c = cell.trim()
            if (c.startsWith(':')) {
              return c.endsWith(':') ? 'center' : 'left'
            } else if (c.endsWith(':')) {
              return 'right'
            }
            return undefined
          })

        const header = line
          .split('|')
          .slice(1, -1)
          .map(cell => handleInline(cell.trim()))

        const rows: InlineToken[][][] = []
        while (lines.length > 0 && lines[0].startsWith('|') && lines[0].endsWith('|')) {
          const row = lines.shift()!.split('|').slice(1, -1)
          rows.push(row.map(cell => handleInline(cell.trim())))
        }

        tokens.push({ type: TokenType.Table, header, rows, alignment })
      } else {
        paragraphBuffer.push(line)
      }
    }
    // Handle paragraphs
    else {
      if (line.trim().length === 0) handleBuffer()
      else paragraphBuffer.push(line)
    }

    if (lines.length === 0) handleBuffer()
  }

  return tokens
}
