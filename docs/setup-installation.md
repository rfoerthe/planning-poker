# Setup & Installation

## Prerequisites

Install the following tools before working on Planning Poker:

| Tool | Required Version | Notes |
| --- | --- | --- |
| Node.js | Current 22.x, at least `22.13.0`, or a compatible newer LTS release | `package.json` declares `>=22`, but the locked ESLint and jsdom versions require at least 22.13.0 on Node 22. CI uses 22.x. |
| pnpm | `11.1.1` | Use the version pinned in `packageManager`; the declared engine floor is `>=9.0.0`. |
| Git | A version with worktree support | Required for source control and isolated feature work. |
| Firebase project | Your development project with Firestore enabled | Required for real sessions; `.env.example` contains dummy values. |
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

Keep local environment files out of version control. Vite embeds `VITE_*` values in the browser build, so these variables must not contain private server secrets. Firebase access protection depends on Firestore rules, not on hiding the web configuration.

The app does not sign users in or connect to a Firestore emulator automatically. Configure rules for your target project separately; no Firestore rules file is shipped in this repository.

## Start Local Development

```bash
pnpm run dev
```

Open the local app:

```text
http://localhost:5173
```

Vite opens the default browser automatically. Setting `PORT` selects a different port and disables automatic browser opening.

## Run Tests

```bash
pnpm test
```

The test command runs the Vitest/Testing Library suite followed by Node.js integration tests for the deploy scripts. The deploy tests use fake local CLI binaries and never contact Firebase.

## Run Linting

```bash
pnpm lint
```

Run linting before opening a pull request.

## Run Type Checking

```bash
pnpm typecheck
```

`pnpm build` does not type check, so run this separately. CI runs it on every push and pull request.

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

The Firebase CLI is installed as a development dependency. The deploy scripts load `.env` using Node's `--env-file` option and pass `VITE_FB_PROJECT_ID` explicitly to the CLI as `--project`. There is no `.firebaserc` or repository-specific default project.

Set `VITE_FB_PROJECT_ID` and the other Firebase settings in `.env` to your target project, then log in and deploy:

```bash
pnpm exec firebase login
pnpm run deploy
```

`pnpm run deploy` validates the project ID is present, cleans `dist`, builds the app, and deploys only Firebase Hosting. A missing `.env` or empty project ID stops the command before cleanup or deployment. A failed build prevents deployment; Firebase failures return a nonzero exit status.

For a preview:

```bash
pnpm run preview-deploy
```

This uses the same configuration and build steps, then deploys to the `preview` Hosting channel with a 14-day expiry. A preview build still uses the database configured in `.env`; a preview channel does not isolate session data.

Both scripts share `scripts/deploy.mjs`. Values already exported in the calling environment take precedence over `.env`, as with the maintenance scripts. The resulting `VITE_FB_PROJECT_ID` is passed to both the build and the Firebase CLI, so Vite's mode-specific environment files cannot select a different database project for this deployment. Keep the other Firebase configuration values consistent with that project. Change `.env` (or the exported environment) to select a target; the wrapper does not accept additional CLI arguments.

Direct Firebase CLI commands do not read `VITE_FB_PROJECT_ID` automatically and must still receive `--project YOUR_FIREBASE_PROJECT_ID`. `firebase.json` remains required for Hosting configuration.

## Localization Setup

The application currently ships in German only. `src/locales/de.ts` contains the translations, and `src/config/i18n.ts` imports them into the bundle with `de` as the active, fallback, and only supported language. There is no language switch or runtime locale-file fetch.

To add a language, create a resource alongside `de.ts`, register it in `resources` and `supportedLngs`, and implement language selection. Check all translation keys and UI layouts. Markdown documentation remains English.

## Troubleshooting

| Issue | Likely Cause | Resolution |
| --- | --- | --- |
| App starts but Firestore calls fail | Missing or invalid `.env` values | Confirm Firebase variables and restart Vite. |
| Build fails with dependency mismatch | pnpm lockfile or Node version drift | Use a current Node 22.x release and run `pnpm install --frozen-lockfile`. |
| Tests fail in CI but pass locally | Environment or dependency version mismatch | Match CI Node version and run clean install. |
| Docker build cannot find Firebase config | Build secret missing | Pass `--secret id=myenv,src=.env`. |
| Routes 404 after deploy | SPA rewrites missing | Confirm `firebase.json` rewrite to `/index.html`. |

