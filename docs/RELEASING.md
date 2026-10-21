# Maintainer release guide

Demetria follows Semantic Versioning 2.0.0, Conventional Commits, manually
maintained changelog entries, and `vX.Y.Z` Git tags. Releases are manual; no
script publishes, pushes, commits, or creates tags.

## Before release

1. Confirm with the repository owner that MIT is the intended license.
2. Confirm the version in `package.json` and date/version in `CHANGELOG.md`.
3. Ensure the worktree contains only the intended release changes.
4. Run `npm ci` with Node.js 24.
5. Run `npm run release:check`.
6. Run the external tarball smoke test described below.
7. Confirm `npm whoami`, package ownership, registry URL, and version
   availability without printing credentials.

## External tarball smoke test

From the repository, write the package to a temporary directory:

```sh
mkdir -p /tmp/demetria-release
npm pack --pack-destination /tmp/demetria-release
```

In a separate temporary consumer, initialize an npm project, install the
generated `.tgz`, and verify both an ESM JavaScript import and a strict
TypeScript import. Inspect `npm ls --omit=dev --depth=0`; Demetria must add no
runtime dependencies. Build and serve the examples over HTTP rather than using
`file://` URLs.

## Publish manually

After review and owner approval:

```sh
git add -A
git commit -m "feat: release demetria v0.1.0"
git tag -a v0.1.0 -m "Demetria v0.1.0"
git push origin main
git push origin v0.1.0
npm publish
```

Finally, create GitHub release `v0.1.0` manually using the matching changelog
entry. Do not claim that the Markdown documentation is a deployed GitHub Pages
site unless Pages has separately been configured and verified.
