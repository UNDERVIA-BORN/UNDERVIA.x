# UNDERVIA

**Born from being underestimated.**

A responsive English-learning platform built with HTML, CSS, and vanilla JavaScript. No backend, paid API, account, or build step is required.

## Included in this first build
- Responsive homepage with all nine learning paths.
- UNDERVIA typography branding (no logo asset).
- Functional General English vocabulary library with 150 entries.
- Search by word, Indonesian meaning, definition, or part of speech.
- Filter by CEFR level and sort A–Z / Z–A.
- Vocabulary detail panel with definition, translation, example, synonyms, antonyms, and usage notes where available.
- Save vocabulary and track reviewed words with LocalStorage.
- Mobile navigation and responsive layout.

The other eight paths are presented as part of the roadmap and are not falsely represented as complete yet.

## Run locally
You can open `index.html` directly in a browser, but using a local server is recommended because the content is loaded from JSON with `fetch`.

For example, with Python installed:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Publish with GitHub Pages
1. Create a GitHub repository named `undervia`.
2. Upload the contents of this folder (not the ZIP itself).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site.

## Project structure
```text
undervia/
├── index.html
├── style.css
├── app.js
├── README.md
└── data/
    ├── categories.json
    └── general-english.json
```

## Add more vocabulary
Add another object to `data/general-english.json` using the same fields:
`word`, `ipa`, `pronunciation`, `partOfSpeech`, `definition`, `meaning`, `example`, `exampleTranslation`, `synonyms`, `antonyms`, `level`, and `usage`.

Learning progress is stored locally in the user's browser. It does not sync between devices.
