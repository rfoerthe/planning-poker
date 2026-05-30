# Standard Operating Procedures

## Purpose

This document defines repeatable operational workflows for Planning Poker. Use it as the checklist source for contribution, testing, deployment, maintenance, and release activities.

## Roles And Responsibilities

| Role | Responsibilities |
| --- | --- |
| Contributor | Implements changes, adds tests, updates docs, opens pull requests. |
| Reviewer | Reviews correctness, maintainability, accessibility, tests, and documentation. |
| Maintainer | Merges approved changes, manages releases, deployment access, and production configuration. |
| Project Manager | Tracks scope, priorities, roadmap, stakeholder communication, and release readiness. |
| Moderator/User Support | Reports issues, validates user workflows, and contributes usability feedback. |

## SOP: Contribution Workflow

1. Sync with the default branch.
2. Create a feature branch.
3. Install dependencies with `pnpm install`.
4. Make the smallest coherent change.
5. Add or update tests for behavior changes.
6. Run `pnpm lint`.
7. Run `pnpm test`.
8. Run `pnpm build`.
9. Update documentation when behavior, setup, or operations change.
10. Open a pull request with a summary, screenshots for UI changes, and test evidence.

### Pull Request Checklist

- [ ] The change has a clear user or maintenance purpose.
- [ ] TypeScript types remain strict and meaningful.
- [ ] Components use functional React patterns and hooks.
- [ ] Shared business logic lives in `src/service/` when appropriate.
- [ ] Persistence code remains isolated in `src/repository/`.
- [ ] New UI follows existing Material UI and CSS conventions.
- [ ] Tests cover new or changed logic.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] Documentation is updated, or no documentation change is needed.

## SOP: Testing

### Local Test Procedure

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run linting:

   ```bash
   pnpm lint
   ```

3. Run tests:

   ```bash
   pnpm test
   ```

4. Build the app:

   ```bash
   pnpm build
   ```

5. For UI changes, manually verify:

   - Home page loads.
   - A game can be created.
   - A participant can join.
   - A player can vote.
   - Votes can be revealed.
   - The session can be reset.
   - A player can be removed.
   - Locale switching still works.

### CI Test Procedure

GitHub Actions runs on pushes and pull requests targeting `master`.

The workflow:

1. Checks out code.
2. Sets up Node 22.x.
3. Installs pnpm.
4. Restores pnpm cache.
5. Runs `pnpm install --frozen-lockfile`.
6. Runs `pnpm lint`.
7. Runs `pnpm test`.
8. Runs `pnpm build`.
9. Uploads `dist` as a build artifact.

`[Placeholder: Add status badge ownership and required check policy.]`

## SOP: Deployment To Firebase Hosting

### Preconditions

- The pull request is approved.
- CI checks are passing.
- Firebase project access is confirmed.
- Production environment variables are available.
- Firestore security rules are reviewed for the release.
- `[Placeholder: Confirm release approver.]`

### Deployment Steps

1. Check out the target release branch.
2. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Build:

   ```bash
   pnpm build
   ```

4. Deploy:

   ```bash
   firebase deploy
   ```

5. Validate production:

   - Home page loads.
   - A new game can be created.
   - A second browser can join the game.
   - Voting and reveal work.
   - Browser console has no critical runtime errors.

6. Record deployment notes in `[Placeholder: release log location]`.

## SOP: Docker Release

### Build

```bash
docker build --secret id=myenv,src=.env -t planning-poker:[version] .
```

### Run Smoke Test

```bash
docker run -d -p 8080:80 --name planning-poker planning-poker:[version]
```

Open `http://localhost:8080` and verify the app loads.

### Push

Use the repository helper script if configured:

```bash
./push-image.sh
```

`[Placeholder: Document container registry, image naming convention, and credentials.]`

## SOP: Session Data Maintenance

The application includes `deleteOldGames`, which removes games older than six months from Firestore.

### Preconditions

- Confirm the retention period is still six months.
- Confirm the target Firebase project.
- Confirm backup or rollback expectations.
- Confirm the requester and approval.

### Procedure

1. Validate Firestore access.
2. Run the old-game deletion path in a non-production project first.
3. Inspect logs for deleted game count and examples.
4. Run in production only after approval.
5. Record completion in `[Placeholder: operations log location]`.

### Caution

Deleting Firestore documents and subcollection documents is destructive. Production cleanup should be approved and logged.

## SOP: Incident Response

### Severity Levels

| Severity | Definition | Response Target |
| --- | --- | --- |
| Sev 1 | App unavailable or data writes failing for all users. | `[Placeholder: response target]` |
| Sev 2 | Core game workflows broken for many users. | `[Placeholder: response target]` |
| Sev 3 | Localized bug with workaround. | `[Placeholder: response target]` |
| Sev 4 | Cosmetic, documentation, or minor usability issue. | `[Placeholder: response target]` |

### Response Steps

1. Confirm the user impact.
2. Check recent deployments or dependency changes.
3. Reproduce the issue locally or in staging.
4. Inspect browser console errors and Firestore access behavior.
5. Decide whether to roll forward, roll back, or mitigate with configuration.
6. Communicate status to stakeholders.
7. Open a follow-up issue for root cause and prevention.

## SOP: Documentation Maintenance

Update docs when changing:

- Setup requirements.
- Environment variables.
- Firestore data model.
- User workflows.
- Deployment process.
- Test or release process.
- Moderator/admin capabilities.

Every documentation update should prefer concrete instructions over tribal knowledge. Use placeholders only when a detail is unknown and should be explicitly resolved later.

## Definition Of Done

A change is done when:

- It satisfies the agreed scope.
- It is tested locally.
- CI passes.
- Documentation is updated.
- User-facing behavior is manually checked when relevant.
- Review feedback is addressed.
- Deployment or release notes are recorded when relevant.

