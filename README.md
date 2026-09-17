# ring-example-module

A reference implementation of a module for the [Ring Publishing](https://ringpublishing.com) platform. This repository is a **demonstration example**, not a complete or production-ready implementation of a real editorial use case. It showcases selected RingSDK capabilities, communication with Ring APIs, and use of the Ring UI component library.

The example is intentionally illustrative: it demonstrates the **integration layer and platform capabilities** rather than prescribing an application structure. Its directory layout, framework, state management, routing, naming, and individual implementation choices are not required patterns. Use the code to understand how the module can communicate with Ring, not as a template that every project should copy.

The example uses Content API to read data and to modify it through API mutations. The exact API operations, data model, and permissions should be adapted to the needs of the module being built.

> **Important:** This repository demonstrates possible implementation techniques. A real module may use a different project structure, technology choices, UI flow, and architectural approach.

## Background

Ring Publishing is a modular editorial platform. Its micro-frontend architecture loads independent **Module Applications** inside the TopBar shell via iframes. Each module runs in the context of a **Space** (an isolated environment within a client organisation) and has access to Ring APIs through the Ring API Gateway.

The module demonstrated here is a standalone UI application loaded from the Ring menu.

It runs inside the Ring TopBar shell and communicates with Ring APIs through the platform gateway.

For the platform from a developer's perspective, start with these pages of the Ring Publishing developer guide:

- [Ways to extend Ring Publishing](https://developer.ringpublishing.com/overview/extensibility.html) - a module is one of several extension types, and the choice is expensive to change later. Read this before building.
- [Ring Modules Framework](https://developer.ringpublishing.com/overview/ring-modules-framework.html) and [Basic structure](https://developer.ringpublishing.com/overview/basic-structure.html) - how UI Proxy, TopBar and the API Gateway fit together, and what Clients, Spaces, Modules and Module Applications are.
- [Getting started](https://developer.ringpublishing.com/getting-started/index.html) - from registering a module to deploying it, end to end.
- [Glossary](https://developer.ringpublishing.com/overview/glossary.html) - the terms used throughout this README.

The business-side documentation lives in [Ring Publishing Help](https://help.ringpublishing.com/).

## Requirements

To run and test this module against a real Ring environment, you need:

1. **A Ring Publishing account** with access to at least one Space.  
   → [Get access](https://help.ringpublishing.com/getting-started/get-access.html)

2. **A registered module** in Ring Management Console, with a module instance added to your Content Space.  
   → [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html)

3. **Content API permissions** granted to the module in that Content Space: both `read` and `write`. The example reads stories and also modifies Content API data, so both permission types are required for the full flow to work. Granting is self-service in Management Console; see [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html). Content API is one entry in the [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html), which lists each API's `/_api` path, codename and Space type.

4. **A development variant** of the module's vhost in Ring Accelerator with **Upstream type: Dev tunnel**, so that the platform can serve the module from your machine. See [Running locally](#running-locally).

Without the module configuration and these permissions, the example cannot access Content API through the Ring API Gateway. For setup details, see the `/ring-module-configuration` skill.

The `openApp` calls open routes of this same module, so the example reads its own code name from `RingSDK.params.moduleCodeName`. To open another module, use that module's code name, shown in the module's details in Management Console.

> The configuration described here is specific to running this example. Other modules may need different APIs, permissions, or Space configuration.

## Running locally

The module only behaves like a module when Ring Publishing serves it: outside the platform `RingSDK` is not on the page and `/_api` has nothing to resolve against. Local development therefore goes through a **Ring Accelerator dev tunnel**. A development variant of the module's vhost forwards its traffic to the Vite dev server on your machine, while UI Proxy, `RingSDK` and `/_api` stay in front of it.

You need Node.js 24 and a development variant with **Upstream type: Dev tunnel** on the vhost configured as the Module Application endpoint. The `/ring-module-local-development` skill covers creating the variant, routing your browser to it and troubleshooting. The canonical guide is [Develop a module UI on your own machine](https://developer.ringpublishing.com/howto/build-a-module/develop-locally.html).

```bash
npm install
cp .env.example .env.local   # fill in the vhost, the variant and the token from the Accelerator panel
npm run dev
```

`npm run dev` starts Vite and, when the three `ACC_DEV_TUNNEL_*` variables are set, the tunnel with it (see `vite.config.ts`). Then open Ring Publishing, use the Accelerator Bookmarklet to map the module's vhost to the development variant (**Mappings** tab), and open the module from the menu.

Without the variables Vite starts as a plain dev server. `localhost` then shows a broken application, because `RingSDK` is missing.

## What this example demonstrates

This example presents a list of stories loaded from Content API, with an example filter for publication status and a text search. Selecting a story displays its details and opens a comments view. The comments view loads comments assigned to the story and demonstrates adding new comments, editing existing comments, and soft-deleting comments.

The flow demonstrates:

- using [`RingSDK`](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) for module and [TopBar](https://developer.ringpublishing.com/howto/build-a-module/manage-topbar.html) integration, navigation, [dialogs](https://developer.ringpublishing.com/howto/build-a-module/manage-simple-dialogs.html), notifications, and platform context;
- reading stories, story details, publication statuses, and comments from Content API through the [`/_api/` bridge](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html);
- creating, updating, and soft-deleting comments through Content API mutations;
- combining Ring UI components with an application-specific user flow.

The demonstrated flow is intentionally simplified and may not represent a complete real-world editorial scenario. Treat it as a collection of integration examples and implementation ideas, not as a required project blueprint.

## Documentation

The canonical documentation is the [Ring Publishing developer guide](https://developer.ringpublishing.com/). The pages most relevant to this example:

| Topic | Page |
|---|---|
| Tutorials for what the example does: TopBar, dialogs, calling APIs, slots and extensions | [Build a module](https://developer.ringpublishing.com/howto/build-a-module/index.html) |
| Every `RingSDK` method and the `RingSDK.constants` values | [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) |
| Which APIs a module can call, their codenames, `/_api` paths and Space types | [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html) |
| Per-instance configuration, per-user settings and the module definition | [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html) |
| Groups, capabilities and what UI Proxy checks | [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html) |
| Modules with a backend of their own | [Authenticating your module's backend](https://developer.ringpublishing.com/topics/public-api/backend-integration.html) |
| Management Console procedures | [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html) |

## Project structure

The folders and files in this repository are organized for readability and demonstration purposes only. They do not define how a Ring module must be structured. Choose the directory structure, architectural boundaries, framework, state-management approach, and naming conventions that fit your own module.

## AI Coding Assistant (Skills)

This repository includes [agent skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) under `.agents/skills/` that encode technical and design guidelines for building Ring modules. They follow the standard skill format (`SKILL.md` with YAML frontmatter) and work with GitHub Copilot CLI, Claude, and other agents that support the `.agents/skills/` convention.

| Skill | Description |
|---|---|
| `/ring-module-development` | Implementing modules - RingSDK API, UI components, TopBar management, dialogs, cross-module communication. |
| `/ring-public-apis` | Talking to Ring public APIs from any caller - the API catalog and schemas, the `/_api` bridge, authenticating a module backend or an integration of your own, and reading a failure. |
| `/ring-module-configuration` | Configuring modules in Ring Management Console - modules, applications, instances in Spaces, API permissions, and troubleshooting. |
| `/ring-module-local-development` | Running a module locally through a Ring Accelerator dev tunnel - variant setup, Vite plugin wiring, Bookmarklet mapping, and troubleshooting. |

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

Either way, describe what you want to build - the agent maps your requirements to Ring platform patterns and loads the relevant skill on its own.
