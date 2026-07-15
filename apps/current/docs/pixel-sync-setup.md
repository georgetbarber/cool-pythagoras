# Pixel installation and cross-device sync

Live app: [https://learn-the-guitar.web.app](https://learn-the-guitar.web.app)

The application is ready to run as an HTTPS-hosted Progressive Web App. Firebase
Hosting serves the application while the laptop is off. Firebase Authentication
identifies the learner, and Cloud Firestore synchronises structured learning data.

## What synchronises

- curriculum progress and activity evidence;
- mastery context, settings, and current path position;
- sketches, chord choices, rhythm notes, sections, reflections, and revisions.

Evidence is append-only. Concurrent sketch changes prefer the newest edit while
merging revision history. Deletion timestamps prevent an offline device from
restoring a sketch that was deleted elsewhere.

Recordings never enter Firestore. A new take remains in memory until **Keep on
this device** is selected. Retained audio remains on that device and can be
measured or cleared from Settings.

## Firebase setup status

The `learn-the-guitar` Firebase project is configured and deployed. Google sign-in
is enabled, Firestore is in the London region, private per-user rules are active,
and Hosting serves the production PWA. The steps below are retained for future
maintenance or recreating the deployment.

## Recreating the Firebase setup

1. Create a project in the [Firebase console](https://console.firebase.google.com/).
2. Add a Web app and copy its configuration values into a new `.env.local`, using
   `.env.example` as the template.
   For GitHub Actions deployments, add the same six `VITE_FIREBASE_*` entries as
   repository variables under **Settings → Secrets and variables → Actions →
   Variables**. The local file is ignored by Git and is not available to the
   deployment workflow.
3. In **Authentication → Sign-in method**, enable Google.
4. Create a Cloud Firestore database. The repository's `firestore.rules` ensures
   each authenticated account can access only its own `/users/{uid}` data.
5. Copy `.firebaserc.example` to `.firebaserc` and replace the project ID.
6. Install the Firebase CLI, sign in, build, and deploy:

   ```bash
   npm install --global firebase-tools
   firebase login
   npm run build
   firebase deploy --only hosting,firestore
   ```

The Firebase web configuration is an application identifier and is safe to ship
to the browser. Access control is enforced by Authentication and Firestore rules,
not by hiding those values.

## Move the existing laptop history into sync

Browser storage belongs to its exact web address. If the local development address
already contains V8 progress, open `http://127.0.0.1:4184`, choose **Settings and
sync → Continue with Google**, and wait for **All progress is synchronised**. Then:

1. Open the [live address](https://learn-the-guitar.web.app) on the laptop and sign
   into the same Google account.
2. Confirm Settings says **All progress is synchronised**.
3. Open the live address in Chrome on the Pixel and sign into the same account.
4. In Settings, select **Install app**. If the button is unavailable, use Chrome's
   menu and choose **Install app**.

If the app was removed but an old app window still says it is installed, close
that window completely from Android's recent-apps screen. Open Chrome itself,
visit the live address, and use **Install app** or **Add to Home screen** from the
Chrome menu. If Chrome still treats it as installed, check **Android Settings →
Apps → Guitar Academy**; removing a home-screen icon does not uninstall the app.

If the development server is unavailable, export a complete backup from the local
address and import it at the live address before relying on cloud sync.

The installed app works offline. Changes made offline are saved locally and sent
to Firestore when connectivity returns.

## Updating the app

Run `npm run build` and deploy Hosting again. The service worker downloads the new
version, removes outdated caches, and activates it automatically.
