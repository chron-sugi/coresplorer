# SPL Static Editor Contract

This widget implements a "static analysis" code editor for SPL. It uses a layered approach:

1.  **Input Layer**: A transparent `<textarea>` for user input and selection.
2.  **Output Layer**: A syntax-highlighted (PrismJS) block rendered underneath.

## ⚠️ Critical Alignment Rules

For the cursor to align visually with the highlighted code, both layers **MUST** have identical:

- Font Family
- Font Size
- Line Height
- Padding / Box Model

## Configuration

- **Geometry**: All numerical values are defined in `config/editor-layout.config.ts`.
- **Styling**: Typography and base box model are enforced by `.spl-static-editor-layer` in `config/editor-theme.css`.

## Do Not Edit

- Do **NOT** apply global Tailwind typography classes (like `prose` or `leading-relaxed`) to the editor container.
- Do **NOT** change font size or line height in the React components directly.
- Do **NOT** rely on `CodeBlock` from `shared/ui` for this widget. We use a specialized `SplHighlighter` to guarantee 1:1 matching.

## Debugging Alignment

If the cursor is drifting:

1.  Inspect the `<textarea>` and the `<pre>` element in DevTools.
2.  Verify `line-height` is exactly `21px` (or configured value) on both.
3.  Verify `font-family` is identical.
4.  Check for `transform` or `zoom` on parent containers.
