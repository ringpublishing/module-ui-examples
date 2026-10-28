# ring-example-module

Two things for anyone building a module for the [Ring Publishing](https://ringpublishing.com) platform: a **reference module** that shows how a module talks to the platform, and the **agent skills** that encode how to build one.

> **Important:** This repository demonstrates possible implementation techniques. A real module may use a different project structure, technology choices, UI flow, and architectural approach.

## The example module

A standalone UI application loaded from the Ring menu. It lists stories from Content API, manages their comments, and lets an AI agent of Ring Agents help with a comment while it is written. On the way it shows how a module uses `RingSDK`, calls Ring APIs through the `/_api` bridge and builds its screens from Ring UI components.

Ring Publishing is a modular editorial platform: independent **Module Applications** are loaded inside the TopBar shell, each in the context of a **Space** (an isolated environment within a client organisation), and reach Ring APIs through the Ring API Gateway. This module is one of them.

To run it you need a Ring Publishing account, a registered module with Content API permissions, and a development variant of its vhost with an Accelerator dev tunnel - see [Setting up](docs/setup.md). Then:

```bash
npm install
cp .env.example .env.local   # fill in the vhost, the variant and the token from the Accelerator panel
npm run dev
```

- [Setting up](docs/setup.md) - the account, the module registration, the API permissions and the dev tunnel
- [What the example demonstrates](docs/walkthrough.md) - the flow screen by screen, and what it deliberately leaves out
- [AI help with a comment](docs/ai-agent.md) - the agent behind the add-comment view, and how to connect your own

## The skills

Four [agent skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) under `.agents/skills/` that encode technical and design guidelines for building Ring modules. They are useful on their own, in any module project - not only in this one. They follow the standard skill format (`SKILL.md` with YAML frontmatter) and work with GitHub Copilot CLI, Claude, and other agents that support the `.agents/skills/` convention.

| Skill | Description |
|---|---|
| `/ring-module-development` | Implementing modules - RingSDK API, UI components, TopBar management, dialogs, cross-module communication. |
| `/ring-public-apis` | Talking to Ring public APIs from any caller - the API catalog and schemas, the `/_api` bridge, authenticating a module backend or an integration of your own, and reading a failure. |
| `/ring-module-configuration` | Configuring modules in Ring Management Console - modules, applications, instances in Spaces, API permissions, and troubleshooting. |
| `/ring-module-local-development` | Running a module locally through a Ring Accelerator dev tunnel - variant setup, Vite plugin wiring, Bookmarklet mapping, and troubleshooting. |

Describe what you want to build - the agent maps your requirements to Ring platform patterns and loads the relevant skill on its own. → [Installing the skills](#installing-the-skills)

## Installing the skills

**Install as a plugin** - the skills stay in this repository, so an update reaches every project that has the plugin installed. The repository is both the marketplace and the plugin; the skills are read from `.agents/skills/`.

```bash
# Claude Code
claude plugin marketplace add ringpublishing/module-ui-examples
claude plugin install ring-publishing-integrations@ring-publishing-integrations

# Codex
codex plugin marketplace add ringpublishing/module-ui-examples
# then pick "Ring Publishing Integrations" in /plugins
```

Restart the agent session afterwards. Installed this way the skills are namespaced under the plugin, e.g. `/ring-publishing-integrations:ring-module-development`.

**Or copy them into your project** - copy the `.agents/skills/` directory into your own repository (under `.agents/skills/`, `.github/skills/`, or `.claude/skills/`). Any agent that supports the convention auto-discovers them, and they keep their plain names (e.g. `/ring-module-development`). The copy does not follow this repository.

## Where to read more

The canonical documentation is the [Ring Publishing developer guide](https://developer.ringpublishing.com/); the business side lives in [Ring Publishing Help](https://help.ringpublishing.com/). The pages most relevant to this repository:

| Topic | Page |
|---|---|
| A module is one of several ways to extend Ring, and the choice is expensive to change later - read this before building | [Ways to extend Ring Publishing](https://developer.ringpublishing.com/overview/extensibility.html) |
| How UI Proxy, TopBar and the API Gateway fit together, and what Clients, Spaces, Modules and Module Applications are | [Ring Modules Framework](https://developer.ringpublishing.com/overview/ring-modules-framework.html) and [Basic structure](https://developer.ringpublishing.com/overview/basic-structure.html) |
| From registering a module to deploying it, end to end | [Getting started](https://developer.ringpublishing.com/getting-started/index.html) |
| Tutorials for what the example does: TopBar, dialogs, calling APIs, slots and extensions | [Build a module](https://developer.ringpublishing.com/howto/build-a-module/index.html) |
| Every `RingSDK` method and the `RingSDK.constants` values | [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) |
| Which APIs a module can call, their codenames, `/_api` paths and Space types | [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html) |
| Running AI agents of Ring Agents from a module: actions, streaming, stopping a run | [Use Ring Agents in a module](https://developer.ringpublishing.com/howto/build-a-module/use-ring-agents.html) |
| Per-instance configuration, per-user settings and the module definition | [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html) |
| Groups, capabilities and what UI Proxy checks | [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html) |
| Modules with a backend of their own | [Authenticating your module's backend](https://developer.ringpublishing.com/topics/public-api/backend-integration.html) |
| Management Console procedures | [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html) |
| The terms used throughout this repository | [Glossary](https://developer.ringpublishing.com/overview/glossary.html) |
