# Schema guide

A schema has a unique non-empty `id` and one or more steps. Every step has a
unique `id`, a `title`, and one or more fields. Field names are unique across
the form. Supported field types are `text`, `email`, `number`, `select`,
`checkbox`, and `textarea`.

Schema IDs, step IDs, and field names start with a letter and use only letters,
numbers, underscores, or hyphens. This keeps generated identifiers predictable.

Schemas are plain JSON-compatible data. Select fields require labeled string
options. Rules in 0.1.0 are limited to `required` and built-in type validation;
conditional rules, custom validators, and executable schema expressions are
not supported.

A field is required only when `required === true`. Omitting the property is
equivalent to `required: false`. Empty optional values pass; non-empty optional
values are still validated by their type. In 0.1.0, whitespace-only strings
are considered non-empty.

The complete schema and value semantics are documented in the root README.
