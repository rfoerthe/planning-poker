# Setup & Installation

## Prerequisites

Install the following tools before working on Planning Poker:

| Tool | Required Version | Notes |
| --- | --- | --- |
| Node.js | `22.0.0` or higher | CI uses Node 22.x. |
| pnpm | `9.0.0` or higher | Repository package manager is `pnpm@11.1.1`. |
| Git | `[Placeholder: supported version]` | Required for source control. |
| Firebase project | `[Placeholder: project name/id]` | Required for real Firestore-backed local testing. |
| Docker | Optional | Required only for container builds. |

## Clone The Repository

```bash
git clone https://github.com/rfoerthe/planning-poker.git
cd planning-poker
```

For forks or private mirrors, replace the URL with `[Placeholder: repository URL]`.

## Install Dependencies

```bash
pnpm install
```

Use the lockfile when installing in CI:

```bash
pnpm install --frozen-lockfile
```

## Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Update `.env` with Firebase configuration:

```text
VITE_FB_API_KEY=[Placeholder: Firebase API key]
VITE_FB_AUTH_DOMAIN=[Placeholder: Firebase auth domain]
VITE_FB_PROJECT_ID=[Placeholder: Firebase project ID]
VITE_FB_STORAGE_BUCKET=[Placeholder: Firebase storage bucket]
VITE_FB_MESSAGING_SENDER_ID=[Placeholder: Firebase messaging sender ID]
VITE_FB_APP_ID=[Placeholder: Firebase app ID]
VITE_FB_MEASUREMENT_ID=[Placeholder: Firebase measurement ID]
```

Do not commit `.env` files containing real credentials.

## Start Local Development

```bash
pnpm run dev
```

Open the local app:

```text
http://localhost:5173
```

## Run Tests

```bash
pnpm test
```

Tests use Vitest and Testing Library.

## Run Linting

```bash
pnpm lint
```

Run linting before opening a pull request.

## Build For Production

```bash
pnpm build
```

The production build output is generated in:

```text
dist/
```

## Preview Production Build

```bash
pnpm preview
```

The configured preview command serves on:

```text
http://localhost:5000
```

## Docker Setup

### Build Docker Image

The Dockerfile expects `.env` to be mounted as a build secret.

```bash
docker build --secret id=myenv,src=.env -t planning-poker .
```

### Run Docker Container

```bash
docker run -d -p 8080:80 --name planning-poker planning-poker
```

Open:

```text
http://localhost:8080
```

### Stop And Remove Container

```bash
docker stop planning-poker
docker rm planning-poker
```

## Firebase Hosting Setup

The repository includes `firebase.json` configured for a single-page application:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Deployment requires Firebase CLI access and project permissions.

```bash
pnpm build
firebase deploy
```

`[Placeholder: Add exact Firebase project alias, required CLI login method, and deployment owner.]`

## Localization Setup

Translation files live under:

```text
public/locales/
```

Current locale folders include:

- `en`
- `pt-BR`
- `zh-Hant`

When adding a new language:

1. Create `public/locales/[locale]/translation.json`.
2. Add all keys from the English translation file.
3. Update language selection behavior if needed.
4. Test the UI for layout overflow and missing translations.

## Troubleshooting

| Issue | Likely Cause | Resolution |
| --- | --- | --- |
| App starts but Firestore calls fail | Missing or invalid `.env` values | Confirm Firebase variables and restart Vite. |
| Build fails with dependency mismatch | pnpm lockfile or Node version drift | Use Node 22 and run `pnpm install --frozen-lockfile`. |
| Tests fail in CI but pass locally | Environment or dependency version mismatch | Match CI Node version and run clean install. |
| Docker build cannot find Firebase config | Build secret missing | Pass `--secret id=myenv,src=.env`. |
| Routes 404 after deploy | SPA rewrites missing | Confirm `firebase.json` rewrite to `/index.html`. |

