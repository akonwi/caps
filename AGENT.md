# Agent Guidelines for cap-app

## Commands
- **Start dev server**: `npm start` (Expo dev server)
- **Build**: No explicit build command - uses Expo bundler
- **Lint**: `npm run lint` (ESLint with expo config)
- **Type check**: `npx tsc --noEmit`
- **Platform specific**: `npm run ios`, `npm run android`, `npm run web`

## Code Style
- **Framework**: Expo/React Native with TypeScript, expo-router for navigation
- **Imports**: Use `@/` alias for root imports (`@/components`, `@/hooks`, etc.)
- **File naming**: PascalCase for components, camelCase for hooks/utils
- **Components**: Functional components with TypeScript, export as named or default
- **Styling**: StyleSheet.create() pattern, avoid inline styles for complex styling
- **Types**: Use TypeScript interfaces for props, extend built-in types (e.g., `ViewProps`)
- **Theme**: Use themed components (`ThemedView`, `ThemedText`) for consistent theming
- **Structure**: `/app` for screens (expo-router), `/components` for reusable UI
- **State**: React hooks pattern, destructure props with `...otherProps` spread
- **Async**: Handle loading states (fonts, async operations) with conditional rendering

## Notes
- No test framework configured - add tests as needed
- Uses expo-router file-based routing in `/app` directory
- Strict TypeScript enabled with path mapping
