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

---

### `parser(source)`

Generate an AST from the given Markdown source.

#### Parameters

- `source (string)`

  The Markdown source to parse.

#### Returns

- `ast (object)`

  The generated AST.

#### Example

```ts
const ast = markdown.parser('Your Markdown code')
```

---

### `lexer(source)`

Generate a list of tokens from the given Markdown source.

#### Parameters

- `source (string)`

  The Markdown source to lex.

#### Returns

- `tokens (array)`

  The generated tokens.

#### Example

```ts
const tokens = markdown.lexer('Your Markdown code')
```

---

### `inline(source)`

Generate an AST from the given inline Markdown source.

#### Parameters

- `source (string)`

  The inline Markdown source to parse.

#### Returns

- `ast (object)`

  The generated AST.

#### Example

```ts
const ast = markdown.inline('Your inline Markdown code')
```

---
