# Fennex

Multilingual real estate site with an Arabic-first property admin panel.

## Run locally

```bash
npm install
npm run dev
```

The public site opens at `http://localhost:3000` and defaults to Arabic. French and English are available at `/fr` and `/en`.

## Property administration

Open `http://localhost:3000/admin`. The panel supports adding, editing, and deleting properties. Changes appear on the public listing and detail pages.

Property records are stored in the current browser's localStorage. The initial listings appear until you edit them. Edits persist across reloads and are visible on the public pages in the same browser. They are not shared with other browsers, devices, or visitors. The admin route has no sign-in protection. The editor lets you choose photos from the existing `public/images` library.
