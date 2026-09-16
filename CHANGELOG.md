# CHANGELOG
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
