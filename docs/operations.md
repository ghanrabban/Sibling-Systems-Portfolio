# Build, source control and hosting

## Local checks and reproducibility

Dockerfile pins Node's image digest and Bun 1.4.3. `bun.lock` pins dependencies, including Navfolio Git revisions. OS packages remain Debian repository inputs; byte-for-byte image reproducibility is not claimed. Docker QA uses Chromium; real Safari and physical-device checks are separate.

Use `docker compose --profile test run --build --rm qa` for unit checks, Astro diagnostics, a complete build and browser tests. Run draft/future/pagination integration fixtures using `docker compose run --build --rm build bun run test:publication`; the script removes its own temporary files and rebuilds the ordinary artifact. It refuses to overwrite existing fixture paths.

Pass `BUILD_DATE=YYYY-MM-DD` explicitly for repeatable eligibility. Set `SOURCE_COMMIT` to the reviewed commit after verifying a clean working tree:

```sh
git status --short
git rev-parse HEAD
SOURCE_COMMIT=<reviewed-commit> docker compose run --build --rm -e BUILD_DATE=2026-10-16 build
```

Replace placeholders/date with actual release inputs. `releases/<build-id>/build-inputs.json` records the date, source label, tool versions and indexing mode. `asset-report.json` records output paths, sizes and SHA-256 hashes. Only its sibling `dist/` is uploaded. Keep an off-machine copy of accepted release folders and configuration; Git does not back up ignored artifacts.

The audit fails on broken internal URLs/fragments, reference identity leaks, unpublished sentinels, unexpected source files, over 20,000 assets or any file above 25 MiB. It warns at 16,000 files or 20 MiB/file. These Free limits were checked against [Cloudflare Static Assets documentation](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/); recheck before later releases. Static requests are free and unlimited under that model. Runtime code, databases, paid bindings and Workers Builds are not required here.

## Git workflow

```sh
git switch -c content/my-update
git diff
git add app/content app/config/site.ts static/images
git diff --cached
git commit -m "content: publish my update"
git push -u origin content/my-update
```

Review the branch on GitHub and merge when checks/content are satisfactory. Correct mistakes with a new commit or `git revert <commit>` on a branch; avoid rewriting public history for ordinary corrections. Inspect staged file names and text. Never add credentials, reports, the SWEBOK book, caches or release folders. `origin` must be the Sibsys repository; `upstream` is Navfolio.

## First Cloudflare deployment

Wrangler is configured for **assets only**. Do not add a runtime `main`, SSR adapter, `run_worker_first` or paid binding for this portfolio. No account-specific domain route is committed until its existing association is inspected.

1. Authenticate the pinned Wrangler version using Cloudflare browser login or a scoped API token. Keep credentials out of Git, chat, build arguments and development/test containers.
2. Verify the account, Workers plan, `sibsys-portfolio` name and current `sibsys.dev` binding. Resolve existing project/domain associations before replacing them.
3. Run `wrangler deploy --dry-run --assets <absolute-release-dist>` against this `wrangler.jsonc`. A dry run does not verify account authorization.
4. Deploy that same reviewed directory with `wrangler deploy --assets <absolute-release-dist>`. Record the returned version/deployment ID, hostname, source commit and asset report.
5. Smoke-test the assigned `workers.dev` hostname before adding the custom domain through Workers → Settings → Domains & Routes. Verify TLS and actual `sibsys.dev` responses afterwards; preserve unrelated DNS records.
6. Check `/`, `/en/`, `/id/`, deep article/project links, translations, search, both RSS feeds, sitemap, headers and unknown root/EN/ID paths returning HTTP 404. Verify indexing policy.

When deploying in Docker, mount the selected artifact/configuration read-only and provide credentials only at runtime. Interactive OAuth/account selection requires owner access. A local test cannot establish a successful hosted deployment.

## Recovery and maintenance

Retain the last accepted artifact/configuration before each release. Recover by deploying its prior `dist/` with matching Wrangler configuration, recording the new deployment identity and rerunning smoke tests. Reverting Git alone does not roll back hosting. Rebuilds may change date eligibility; retained artifacts preserve the exact reviewed output.

The proposed recovery target is 30 minutes, unproven until a remote rehearsal is timed. Test a fresh GitHub clone and retained export during handover. Owner: the Sibsys repository owner. Review content/links, dependency advisories, Cloudflare limits and restore artifacts monthly. Upgrade on a branch, deliberately regenerate the lock, and rerun QA. No inherited GitHub Actions publish or send source to external review services.
