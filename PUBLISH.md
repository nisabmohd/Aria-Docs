# Publishing

How to release the Ariadocs packages to npm.

## Packages

| Package | Folder | Version | Depends on |
| --- | --- | --- | --- |
| `@ariadocs/core` | `packages/lib-core` | 1.0.0 | nothing |
| `@ariadocs/openapi` | `packages/lib-openapi` | 1.0.0 | core |
| `@ariadocs/mdx` | `packages/lib-mdx` | 3.0.0 | core |
| `@ariadocs/components` | `packages/lib-components` | 0.1.0 | core, openapi |

`@ariadocs/mdx` replaces `@ariadocs/react`, whose last version on npm is 2.1.0. It starts at 3.0.0 so the version history carries on.

Publish in the order above. A package must be on npm before anything that depends on it.

## Before you publish

1. Log in to npm with an account that can publish to the `@ariadocs` scope:

   ```bash
   npm login
   npm whoami
   ```

2. Start from a clean `master`:

   ```bash
   git checkout master
   git pull
   git status # should print nothing to commit
   ```

3. Install, then build, test and lint everything:

   ```bash
   pnpm install
   pnpm build
   pnpm test
   pnpm lint
   pnpm check-types
   ```

   `pnpm build` also builds the docs site, which renders every package. If the site builds, the packages work together.

## Bump versions

Edit `version` in each package's `package.json` that you're releasing. Follow semver:

- patch (`0.1.0` to `0.1.1`) for bug fixes,
- minor (`0.1.0` to `0.2.0`) for new features,
- major (`0.1.0` to `1.0.0`) for breaking changes. While a package is below 1.0.0, a breaking change can be a minor bump.

When you bump `@ariadocs/core`, also release the packages that depend on it, so they pick up the new version.

Commit the bumps:

```bash
git commit -am "release: core 0.1.1, openapi 0.1.1"
```

## Check what will be published

Pack a package without publishing it:

```bash
cd packages/lib-openapi
pnpm pack
tar -tzf ariadocs-openapi-*.tgz
rm ariadocs-openapi-*.tgz
```

The tarball should contain only `dist/`, `package.json`, `README.md` and `LICENSE`. Its `package.json` should list `@ariadocs/core` with a real version number such as `1.0.0`, not `workspace:*`.

## Publish

Use `pnpm publish`, not `npm publish`. pnpm replaces `workspace:*` with the real version number. npm doesn't, and the package would fail to install.

```bash
pnpm --filter @ariadocs/core publish
pnpm --filter @ariadocs/openapi publish
pnpm --filter @ariadocs/mdx publish
pnpm --filter @ariadocs/components publish
```

Each package already has `"publishConfig": { "access": "public" }`, so you don't need `--access public`. pnpm refuses to publish from a branch other than `master` or with uncommitted changes. Fix the cause rather than passing `--no-git-checks`.

To try a release without publishing it, add `--dry-run`.

### Pre-releases

To let people test a version before it becomes `latest`:

```bash
# set "version": "0.2.0-beta.0" first
pnpm --filter @ariadocs/openapi publish --tag beta
```

Users install it with `pnpm add @ariadocs/openapi@beta`.

## After publishing

1. Tag the release and push:

   ```bash
   git tag openapi@0.1.1
   git push origin master --tags
   ```

2. Check that each package installs in a new project:

   ```bash
   mkdir /tmp/ariadocs-check && cd /tmp/ariadocs-check
   npm init -y
   npm install @ariadocs/mdx @ariadocs/openapi @ariadocs/components
   ```

3. The first time `@ariadocs/mdx` is published, point users of the old package to it:

   ```bash
   npm deprecate @ariadocs/react "Renamed to @ariadocs/mdx. See https://ariadocs.vercel.app/docs/guides/migration"
   ```

## If something goes wrong

npm lets you unpublish a version within 72 hours, but the version number can never be reused. It's usually better to publish a fixed patch version, and deprecate the broken one:

```bash
npm deprecate @ariadocs/openapi@0.1.1 "Broken build, use 0.1.2"
```
