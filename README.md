# IRONCLAD
**Built by consistency.**

Offline-first Android/iOS training companion built with **Expo SDK 58, React Native, Expo Router, SQLite, Zustand, Reanimated, SVG, and local notifications**. No account or backend needed. Developer: Labib Hasan.

## What is included
- 12 complete workout presets, including the exact featured **Labib's Upper/Lower** (4 days, 30 exercises across sessions), with original starting weights, per-dumbbell/per-leg/total basis, suggested-weight flags, and timed planks.
- 8-step onboarding, training goal and measurement entry, routine selection, schedule and optional starting weight overrides (using a custom clone; original preset stays unchanged).
- Routine preview, activate/duplicate/edit, day schedule, custom exercises, sets/reps/rest/starting weights, exercise add/replace/remove/reorder. Switching routines leaves workout history untouched.
- Active workout: offline persisted sets, warm-ups, reps, kilograms/lb input, RIR, set edits/removal, exercise skip, order changes, notes, resume after process exit, confirmation before discarding, workout summary.
- Timestamp-based rest timer, ±15 seconds, pause/resume, optional background completion notification, tactile feedback.
- Progression recommendations, exercise history, PR estimates, muscle-set distribution, weekly volume and frequency charts, goal-aware weight trends and 7-day moving average.
- Bodyweight entries, optional waist/calorie notes, local progress photos, optional approximate maintenance-calorie estimate (adults with required measurements).
- Notifications for scheduled gym days, optional missed-workout follow-ups, weigh-ins, weekly summary; sound, quiet hours, permission controls.
- Settings, developer About screen, JSON backup/restore, CSV set export, explicit destructive confirmations.

## Prerequisites
- Node.js **22.13+** (Node 22 LTS recommended), npm
- Android device with Expo Go or a compatible development/preview build; for iOS, an iOS device and Xcode/macOS or EAS cloud build
- Internet **for first-time dependency installation and EAS builds only**. The app itself runs offline.

## Install & run

```bash
npm install
npx expo install --fix
npm run doctor
npm run typecheck
npm start
```

Scan the QR code in Expo Go on a compatible Android/iOS device. If the SDK 58 Expo Go distribution is unavailable for your device, use a development build.

**Note:** On fresh installs, `expo install --fix` aligns native modules with the selected SDK. Do not force incompatible dependency versions; resolve any doctor warnings before production release.

## Android-first: build an installable APK via GitHub Actions (no Expo account needed)

The repository includes `.github/workflows/android-apk.yml`. It uses a GitHub-hosted Ubuntu runner to install Android SDK 37, generate native Android files with Expo, and compile a **standalone APK with the JavaScript bundle included**. It does not require Android Studio on your Windows PC, an Expo account, or an Apple account. The first cloud build has **not been run** and could reveal native dependency errors.

1. Create a **completely empty** GitHub repository `IRONCLAD` under `lowkeylabib` (do not check "Add a README" or initialize with files).
2. In a terminal within the extracted `IRONCLAD` folder run:

```bash
# Only if this folder wasn't cloned or does not already contain .git:
git init -b main
git add .
git commit -m "Initial IRONCLAD Android-first source"
git remote add origin https://github.com/lowkeylabib/IRONCLAD.git
git push -u origin main
```

The supplied archive already includes a local `.git` repository and initial commit, so when extracting the **Git-ready ZIP** you only need the last two `git remote`/`git push` commands. If `origin` already exists, use `git remote set-url origin <URL>` instead.

3. On GitHub open **Actions → Android test APK → Run workflow** (a push to `main` also starts the job).
4. When the workflow succeeds, open its run → **Artifacts** → `ironclad-android-test-apk`, download ZIP, unzip, and install `app-release.apk` on your Android phone.
5. For early testing, allow installs from the app you used to open the APK. Use a backup before uninstalling.

**Signing warning:** The Actions-built APK uses the generated project's **debug/test signing** and is not a Play Store release. Different GitHub runners may use different test keys. Future CI APKs may therefore require uninstalling an earlier copy before reinstalling; uninstalling deletes locally stored workouts. Export a JSON backup first. For ongoing releases and seamless upgrades, switch to EAS-managed persistent signing credentials or configure a private CI keystore.

## Android APK (EAS alternative: stable signing)

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

The `preview` profile in `eas.json` requests an installable `.apk`. Expo/EAS may prompt to configure Android credentials; review before proceeding. **No build or deployment has been run in this delivered source package.**

## iOS readiness (implementation included; builds pending)

Both platforms share the Expo + React Native codebase. The project specifies an iOS bundle identifier (`com.lowkeylabib.ironclad`), photo-library usage messaging, 1024px application icon, and a dedicated simulator profile.

For an **iOS Simulator** build through EAS (requires Expo account, but generally does not require Apple signing for a simulator):

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile ios-simulator
```

For **physical iPhone** distribution, use `npx eas-cli@latest build --platform ios --profile preview` with an Apple Developer account and appropriate signing/provisioning, or use development tooling on a Mac. Apple device builds have **not** been validated.

Android is the first testing target. After its flows pass, perform iOS simulator checks and fix platform-specific native behavior before attempting an iPhone distribution build.

## Validation

```bash
npm run test:logic     # routine fidelity, starting weights, progression, volume, body trends
npm run typecheck      # TypeScript, requires npm install
npm run check:project   # project structure & import audit (local Node + TypeScript)
npm run doctor         # SDK native-package compatibility, requires npm install
```

The project was authored in an isolated environment with no DNS access to the npm registry. **Expo modules could not be downloaded, a full TypeScript dependency-resolved check could not run, and no Android/iOS device or EAS build was tested.** Locally, 5 domain-logic tests plus a project structure test passed; 28 TS/TSX files parsed and 87 relative imports resolved. The SQLite schema was exercised using an independent SQLite engine (including cascade behavior). Device testing remains essential.

## File structure
- `app/` — Expo Router screens (Home, Train, Progress, Body, Settings, workout, routine editor, history, calendar, records, goals, notifications, library, About)
- `src/data/` — real exercise catalog and 12 seeded presets
- `src/db/database.ts` — versioned SQLite schema, migrations, repositories, transactional backup restore
- `src/state/store.ts` — Zustand actions, refresh, offline state
- `src/lib/analytics.ts` — pure calculations for progression, volume, personal records, consistency, weight strategy
- `src/lib/notifications.ts` — local scheduling and background rest finish alerts
- `src/components/ui.tsx` — shared dark design system, charts and animated progress
- `tests/` — focused Node tests

## Data handling and limitations
- Everything is on the device; no accounts, servers, trackers, or paid API keys. The database persists across ordinary app restarts, but uninstalling usually deletes app data. **Export JSON regularly.**
- JSON backups include workout/body data and photo file **URIs**. Photo binary files are **not** embedded, so photos may be missing after restoring to another phone; back them up separately.
- Existing workouts are stored with an exercise snapshot, so editing or switching a routine cannot silently rewrite old sets.
- Suggested starting weights are stored separately from actual logged sets; no synthetic history or personal records are seeded.
- Local notifications rely on device permissions/power policies and may be delayed or suppressed. iOS/Android need separate real-device verification.
- Bodyweight insights are estimates from user entries, not diagnoses or personalized medical/nutrition prescriptions. Minors are not given calorie estimates.
- The app currently uses a fixed dark color theme. Cloud synchronization is intentionally omitted.
- The calorie estimate uses a neutral midpoint assumption and must be calibrated against observed changes; it is not an exact energy requirement.

## What is still blocking an actual APK from this session?

- The current execution container cannot resolve `registry.npmjs.org` and cannot download dependencies.
- This container does not contain an Android SDK, Gradle, Android emulator, or Expo build credentials.
- The connected GitHub integration can read/write **existing** repositories but has no repository-creation action here. Create the empty `IRONCLAD` repo once, then push the included Git-ready project from your computer.
- A native Android build and full dependency-resolved TypeScript check must run in GitHub Actions (or an EAS-connected machine). Any errors there should be fixed against the exact build logs.

No `.apk` or `.ipa` was produced in the session. Do not rename the source ZIP as an APK.

## Production release checklist
1. `npm install`, `npx expo install --fix`, `npm run typecheck`, `npm run test:logic` on a connected machine.
2. Exercise full workout creation/logging/finish, interruptions/background timer, units, edits, data backups, reminder channels on **physical Android and iOS** devices.
3. Review notification permissions and EAS signing; run `npx eas-cli@latest build --platform android --profile preview`.
4. Confirm JSON restore on a clean installation; separately migrate photos.
5. Add app icon and store screenshots before store submission. Publish or push only with explicit approval.

The project contains **source code, not a prebuilt APK**.


## IRONCLAD 1.1 — Navy / Cream / Coral update

- Brand palette: Navy `#14213D`, Cream `#F4EDE0`, Coral `#FF6B5B`.
- Branded native launch screen plus a short animated IRONCLAD introduction; bottom credit: **Developed by LowkeyLabib**.
- Refreshed cards, responsive spacing, raised navigation, and spring-feedback buttons using Reanimated.
- **Custom** routine starts from scratch: create it under Training, then choose days, exercise order, reps, loads, rest and schedule. Original built-in presets are never modified.
- Exercise movement references: a looping two-pose demo for the built-in catalog, displayed with online images from **RepDB's licensed free-tier illustrations**. Includes a fallback and a Google Images GIF-search link. These are *not* third-party GIF downloads, because Google image search does not provide a reuse license. Internet is required to view illustrations.
- External illustration credit: [Exercise data by RepDB (repdb.co)](https://repdb.co). Free in-app use requires attribution; do not redistribute their media as a raw dataset.
- New Android and iOS icons are generated consistently by `npm install` using `scripts/generate-brand-assets.cjs`; no paid design service required.

## Release builds

**Android installable APK:** Push to `main`; open Actions → *IRONCLAD Android release candidate*. After a successful workflow run, download the `ironclad-android-release-candidate-apk` artifact and extract `app-release.apk`. It is an internal installation build and not automatically Google Play signed.

**Android Play Store:** Connect Expo EAS, configure production Android signing, then run:

```sh
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform android --profile production
```

This produces a signed store-oriented Android App Bundle after EAS signing is configured. Keep signing credentials private.

**iOS:** This same Expo codebase includes the iOS bundle ID, icons, splash screen, modules, and a production EAS profile. To make a real TestFlight/App Store build, obtain an Apple Developer membership, configure iOS certificates/provisioning, and connect EAS:

```sh
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform ios --profile production
```

An optional manual GitHub workflow, `.github/workflows/ios-eas-production.yml`, requests an iOS EAS build once your Expo project, EAS credentials, Apple signing and the `EXPO_TOKEN` repository secret are ready. Never commit credentials.

**Release transparency:** This update was requested as a single production-oriented pass without an additional device QA cycle. Successful CI compilation alone does not verify rendering, image delivery, backup behavior, install continuity, or compliance with App Store/Play Store review. Do not market the resulting artifact as store-approved until it is signed and validated. Back up IRONCLAD workout data before uninstalling or overwriting a different signing-key build.
