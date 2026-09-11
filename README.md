# AniVault — Anime Browser

A responsive anime browser built with **React + Tailwind CSS + Fetch API**, using the **Jikan REST API v4**.

The project is structured to satisfy the supplied INTECH 3112 project brief:
- React functional components
- component reuse
- props
- `useState`
- `useEffect`
- event handling
- Tailwind CSS
- responsive desktop/tablet/mobile UI
- asynchronous public REST API retrieval
- organized card-based data display
- search
- genre filtering
- sorting
- pagination
- API error handling
- reusable components
- Home, Browse, Favorites, and About views

## API source

The supplied public-apis reference lists **Jikan** under the Anime category as an unauthenticated HTTPS API with CORS support.

This implementation uses the public Jikan v4 endpoints:
- `https://api.jikan.moe/v4/top/anime`
- `https://api.jikan.moe/v4/seasons/now`
- `https://api.jikan.moe/v4/anime`
- `https://api.jikan.moe/v4/anime/{id}/full`

Jikan describes itself as an unofficial, open-source REST API for MyAnimeList data.

## Local setup

Requirements:
- Node.js 20+ recommended
- npm

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Vercel deployment

### GitHub method
1. Create a new GitHub repository.
2. Upload/push all files in this folder.
3. Go to Vercel and import the GitHub repository.
4. Vercel detects the Vite project.
5. Use:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy.

No API key or environment variable is required by this implementation.

### CLI method

```bash
npm install
npm run build
npx vercel
```

## Important

This is an **anime information browser**, not a streaming site. It uses Jikan/MyAnimeList metadata and links to the MyAnimeList source page for details.

Because the app calls a third-party public API from the browser, a temporary API rate limit can occur. The UI displays an error state and lets the user retry.

## Suggested GitHub files

```text
anime-browser/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── App.jsx
    ├── data.js
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── AnimeCard.jsx
    │   ├── AnimeGrid.jsx
    │   ├── AnimeModal.jsx
    │   ├── ErrorState.jsx
    │   ├── Loading.jsx
    │   ├── Logo.jsx
    │   ├── Navbar.jsx
    │   ├── Pagination.jsx
    │   └── SearchBar.jsx
    ├── pages/
    │   ├── About.jsx
    │   ├── Browse.jsx
    │   ├── Favorites.jsx
    │   └── Home.jsx
    └── services/
        └── jikan.js
```

## Source basis

The supplied project PDF requires a functional responsive React web application using Tailwind CSS and AJAX/API requests, with navigation, API retrieval, organized data display, search/filtering, error handling, responsive design, reusable components, and at least Home, Main Data, and About views. The implementation above maps those requirements directly to the application structure.

The project brief also states that CRUD/server-side components are not necessary, so this project remains a client-side React application.
