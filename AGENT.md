# AGENT.md

This file provides guidance to an LLM agent when working with code in this repository.

## Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run check`: Run type checking
- `npm run lint`: Run Prettier checks
- `npm run format`: Format code with Prettier

## Code Style Guidelines
- Use tabs for indentation (not spaces)
- Use single quotes for strings
- No trailing commas
- 100 character line length limit
- TypeScript with strict type checking
- Component files use `.svelte` extension with `<script lang="ts">`
- Follow Svelte component conventions (script, markup, style order)
- Use named exports for component libraries
- Use `$lib` path alias for imports from src/lib
- Document functions with JSDoc for complex logic
- Use camelCase for variables/functions, PascalCase for components
- Use TailwindCSS for styling with the `cn()` utility for class merging
- Handle form validation with appropriate error messages
- Prefer functional programming patterns when appropriate
- use bits-ui components where possible
  - To access the LLM-friendly version of any supported Bits UI documentation page, simply append /llms.txt to the end of the page's URL. This will return the content in a plain-text, LLM-optimized format.
