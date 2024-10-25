# Markdown Parser

> Parse your Markdown code.

## Installation

```bash
npm install @ast-exp/markdown
```

## Usage

```ts
import parser from '@ast-exp/markdown'

const ast = parser('Your Markdown code')
```

## API Reference

### Node

```ts
type Node = Program | Paragraph | Heading | CodeBlock | BlockQuote | List | ListItem | Table
```

### NodeType

```ts
enum NodeType {
  Program = 'PROGRAM',
  Paragraph = 'PARAGRAPH',
  Heading = 'HEADING',
  CodeBlock = 'CODE_BLOCK',
  BlockQuote = 'BLOCK_QUOTE',
  List = 'LIST',
  ListItem = 'LIST_ITEM',
  Table = 'TABLE',
}
```

### Program

```ts
type Program = {
  type: NodeType.Program
  children: Node[]
}
```

### Paragraph

```ts
type Paragraph = {
  type: NodeType.Paragraph
  children: Inline[]
}
```

### Heading

```ts
type Heading = {
  type: NodeType.Heading
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: Inline[]
}
```

### CodeBlock

```ts
type CodeBlock = {
  type: NodeType.CodeBlock
  value: string
  language?: string
  meta?: string
}
```

### BlockQuote

```ts
type BlockQuote = {
  type: NodeType.BlockQuote
  children: Node[]
}
```

### List

```ts
type List = {
  type: NodeType.List
  ordered: boolean
  children: Node[]
}
```

### ListItem

```ts
type ListItem = {
  type: NodeType.ListItem
  checked: null | string
  children: Node[]
}
```

### Table

```ts
type Table = {
  type: NodeType.Table
  header: Inline[][]
  rows: Inline[][][]
  alignment?: ('left' | 'center' | 'right' | undefined)[]
}
```

### Inline

```ts
type Inline = Text | Code | Strong | Emphasis | Link | Image
```

### InlineType

```ts
enum InlineType {
  Text = 'TEXT',
  Code = 'CODE',
  Strong = 'STRONG',
  Emphasis = 'EMPHASIS',
  Link = 'LINK',
  Image = 'IMAGE',
}
```

### Text

```ts
type Text = {
  type: InlineType.Text
  value: string
}
```

### Code

```ts
type Code = {
  type: InlineType.Code
  value: string
}
```

### Strong

```ts
type Strong = {
  type: InlineType.Strong
  children: Inline[]
}
```

### Emphasis

```ts
type Emphasis = {
  type: InlineType.Emphasis
  children: Inline[]
}
```

### Link

```ts
type Link = {
  type: InlineType.Link
  children: Inline[]
  url: string
}
```

### Image

```ts
type Image = {
  type: InlineType.Image
  alt: string
  url: string
}
```
