# Markdown Parser

> Parse your Markdown code.

## Installation

```bash
npm install @ast-exp/markdown
```

## Usage

```ts
import markdown from '@ast-exp/markdown'

const ast = markdown.parser('Your Markdown code')
```

## API Reference

### `markdown.parser(source)`

Generates an AST from a Markdown source.

#### Parameters

- `source: string`: The Markdown source.

#### Returns

- `ast: ProgramNode`: The AST.

#### Example

```ts
import markdown from '@ast-exp/markdown'

const ast = markdown.parser('Your Markdown code')
```

### `markdown.lexer(source)`

Generates a list of tokens from a Markdown source.

#### Parameters

- `source: string`: The Markdown source.

#### Returns

- `tokens: Token[]`: The list of tokens.

#### Example

```ts
import markdown from '@ast-exp/markdown'

const tokens = markdown.lexer('Your Markdown code')
```
