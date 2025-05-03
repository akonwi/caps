# Caps - Hat Selection App

A simple, elegant application to help you decide which hat to wear each day. Built with SvelteKit and styled with TailwindCSS.

## Features

- Add, edit, and delete hats in your collection
- Upload images of your hats
- Randomly select a hat to wear (avoids selecting the same hat twice in a row)
- Persistent storage using localStorage
- Mobile-friendly, responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/caps.git
   cd caps
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
pnpm build
```

You can preview the production build with:

```bash
npm run preview
# or
pnpm preview
```

## How It Works

- The app stores your hat collection in the browser's localStorage
- Images are converted to base64 data URLs for persistent storage
- The random selection algorithm ensures you don't wear the same hat twice in a row

## Technologies Used

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.