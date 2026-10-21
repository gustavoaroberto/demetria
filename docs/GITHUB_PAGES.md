# GitHub Pages setup

The repository contains `.github/workflows/pages.yml`. On a push to `main`, it
installs with `npm ci`, builds the package and static documentation artifact,
checks relative links, uploads `site-dist`, and deploys it with GitHub's official
Pages actions.

The owner must complete these manual steps before a public URL is claimed:

1. Open **Settings → Pages** in the GitHub repository.
2. Select **GitHub Actions** as the build and deployment source.
3. Run the **GitHub Pages** workflow or merge a verified change to `main`.
4. Confirm the deployment environment and open every page and example at the
   generated `/demetria/` URL.
5. Verify keyboard behavior, error focus, mobile reflow, and browser console
   output before adding the URL to README or package metadata.

Do not deploy documentation from an unreviewed local change. The workflow has
read-only repository access during build and receives Pages write permissions
only in its deployment job.
