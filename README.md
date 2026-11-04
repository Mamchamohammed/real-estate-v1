# Omar Immobilier

Multilingual real estate site with an Arabic-first property admin panel.

## Run locally

```bash
npm install
npm run dev
```

The public site opens at `http://localhost:3000` and defaults to Arabic. French and English are available at `/fr` and `/en`.

## Property administration

Open `http://localhost:3000/admin`. The panel supports adding, editing, and deleting properties. Changes appear on the public listing and detail pages.

Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local` before signing in. See `.env.example` for the variable names. A local `.env.local` with random credentials was created during setup; it is ignored by Git. Keep these values private and set separate values in each deployment.

Property records are stored in `data/properties.json`, created on the first edit. The server needs a writable, persistent `data/` directory. Hosting with an ephemeral or read-only filesystem needs a database-backed store before admin edits can persist. The editor currently lets admins choose photos from the existing `public/images` library.
