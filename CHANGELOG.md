# CHANGELOG
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## 0.3.1 - 2026-09-17
### Changed
- [@albert-lacki]: `@ringpublishing/accelerator-dev-tunnel` moved from `1.0.0-alpha.1` to the stable `1.0.0`. The lockfile pinned the alpha, so `npm ci` installed it; the release carries no API change.
### Fixed
- [@albert-lacki]: `ring-public-apis` no longer documents the empty-`audience` case or the `scopes` claim name. A request without an audience is a malformed request rather than a scenario worth describing, and the claim name inside the token is due to change.

## 0.3.0 - 2026-09-17
### Added
- [@albert-lacki]: `ring-public-apis` skill - one place for talking to a Ring public API whoever is calling, with the front-end, module-backend and own-key paths kept separate, plus schema discovery and failure triage.
### Changed
- [@albert-lacki]: `ring-module-development` hands the API subject over to `ring-public-apis` and keeps the module-code rules; `ring-module-configuration` points there for calling an API once the grant exists.
### Fixed
- [@albert-lacki]: Dropped the `$schema` key from the plugin and marketplace manifests. Both URLs 404, so they gave editors nothing, and the Claude SDK reported the key as unrecognized on every plugin sync.

## 0.2.0 - 2026-09-08
### Added
- [@rmusial2]: Local development through a Ring Accelerator dev tunnel (`@ringpublishing/accelerator-dev-tunnel` Vite plugin, `.env.example`) and the `ring-module-local-development` skill.
- [@rmusial2]: The repository is also a Claude Code and Codex plugin marketplace - the skills install as the `ring-publishing-integrations` plugin instead of being copied, so they stay up to date.
### Changed
- [@rmusial2]: `openApp` reads the module's code name from `RingSDK.params` instead of a placeholder.
- [@rmusial2]: README and skills link to the Ring Publishing developer guide; skill descriptions reworked.

## 0.1.0 - 2026-05-19
### Added
- [@rmusial2]: Initial release - Ring module example with Story Browser feature and AI agent skills (`ring-module-development`, `ring-module-configuration`).
