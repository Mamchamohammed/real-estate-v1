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

In development, the admin login shows and prefills the default password `fennex123`, including when you open the site through a preview address. A configured `ADMIN_PASSWORD` also works. Production requires `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`; see `.env.example` for the variable names. Keep production values private and set separate values in each deployment.

Locally, property records are stored in `data/properties.json`, created automatically on first access with the initial listings. On Vercel, connect a Neon Postgres database so the deployment receives `DATABASE_URL`. The app creates its table and initial listings automatically on first access; later edits persist in Postgres. Set `ADMIN_PASSWORD` and a distinct `ADMIN_SESSION_SECRET` of at least 32 characters in Vercel's environment variables, then redeploy. The development password does not work on Vercel. The editor lets admins choose photos from the existing `public/images` library.
