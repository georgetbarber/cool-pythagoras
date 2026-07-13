# Publish Guitar Academy

On macOS, double-click `PUBLISH_LIVE.command` at the repository root.

The publisher shows every file it intends to include and waits until `PUBLISH`
is typed. It then:

1. checks that the current branch is `main` and that GitHub has no newer commits;
2. runs the current application's tests and production build;
3. commits all displayed repository changes and pushes them to GitHub;
4. lets GitHub Actions deploy Firebase Hosting to the live site.

The first run may open a browser so GitHub can authenticate. Firebase Hosting is
then deployed by GitHub Actions, using a repository secret created during the
one-time Firebase setup. `apps/current/.env.local` remains intentionally excluded
from Git.

The Pixel installation is a Progressive Web App served by the same Firebase
Hosting deployment. It normally updates automatically after publishing. If an
already-open installation continues showing the old version, close and reopen it.

Recordings remain device-only. Publishing application code does not upload them.

If the GitHub Actions check fails, open the repository's Actions page for the
reported error, correct it, and publish again. Firestore rules and indexes are kept
in the repository and are deployed separately when those backend permissions need
changing; ordinary app releases do not need a Firestore deployment.
