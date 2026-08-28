# ring-example-module

A reference implementation of a module for the [Ring Publishing](https://ringpublishing.com) platform. This repository is a **demonstration example**, not a complete or production-ready implementation of a real editorial use case. It showcases selected RingSDK capabilities, communication with Ring APIs, and use of the Ring UI component library.

The example is intentionally illustrative: it demonstrates the **integration layer and platform capabilities** rather than prescribing an application structure. Its directory layout, framework, state management, routing, naming, and individual implementation choices are not required patterns. Use the code to understand how the module can communicate with Ring, not as a template that every project should copy.

The example uses Content API to read data and to modify it through API mutations. The exact API operations, data model, and permissions should be adapted to the needs of the module being built.

> **Important:** This repository demonstrates possible implementation techniques. A real module may use a different project structure, technology choices, UI flow, and architectural approach.

## Background

Ring Publishing is a modular editorial platform. Its micro-frontend architecture loads independent **Module Applications** inside the TopBar shell via iframes. Each module runs in the context of a **Space** (an isolated environment within a client organisation) and has access to Ring APIs through the Ring API Gateway.

The module demonstrated here is a standalone UI application loaded from the Ring menu.

It runs inside the Ring TopBar shell and communicates with Ring APIs through the platform gateway.

For a full description of the platform architecture see:  
→ [Ring Publishing Help](https://help.ringpublishing.com/)  

## Requirements

To run and test this module against a real Ring environment, you need:

1. **A Ring Publishing account** with access to at least one Space.  
   → [Get access](https://help.ringpublishing.com/getting-started/get-access.html)

2. **A registered module** in Ring Management Console, with a module instance added to your Content Space.  
   → [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html)

3. **Content API permissions** granted to the module in that Content Space: both `read` and `write`. The example reads stories and also modifies Content API data, so both permission types are required for the full flow to work.

Without the module configuration and these permissions, the example cannot access Content API through the Ring API Gateway. For setup details, see the `/ring-module-configuration` skill.

Before running the example, replace the `<YOUR_MODULE_CODE_NAME>` value used by the `openApp` calls with the code name of your configured module. This value is environment-specific and must not be hardcoded from this repository's example configuration.

Also replace `<HERE_ADD_YOUR_HOST>` in `vite.config.ts` with the host used by your Ring environment. This host must be included in Vite's `server.allowedHosts` so the development server can be accessed through the configured Ring environment.

> The configuration described here is specific to running this example. Other modules may need different APIs, permissions, or Space configuration.

To run the project locally, install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application still needs to run inside a configured Ring module environment to exercise RingSDK and Content API integration.

## What this example demonstrates

This example presents a list of stories loaded from Content API, with an example filter for publication status and a text search. Selecting a story displays its details and opens a comments view. The comments view loads comments assigned to the story and demonstrates adding new comments, editing existing comments, and soft-deleting comments.

The flow demonstrates:

- using `RingSDK` for module and TopBar integration, navigation, dialogs, notifications, and platform context;
- reading stories, story details, publication statuses, and comments from Content API through the `/_api/` bridge;
- creating, updating, and soft-deleting comments through Content API mutations;
- combining Ring UI components with an application-specific user flow.

The demonstrated flow is intentionally simplified and may not represent a complete real-world editorial scenario. Treat it as a collection of integration examples and implementation ideas, not as a required project blueprint.

## Project structure

The folders and files in this repository are organized for readability and demonstration purposes only. They do not define how a Ring module must be structured. Choose the directory structure, architectural boundaries, framework, state-management approach, and naming conventions that fit your own module.

## AI Coding Assistant (Skills)

This repository includes [agent skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) under `.agents/skills/` that encode technical and design guidelines for building Ring modules. They follow the standard skill format (`SKILL.md` with YAML frontmatter) and work with GitHub Copilot CLI, Claude, and other agents that support the `.agents/skills/` convention.

| Skill | Description |
|---|---|
| `/ring-module-development` | Implementing modules - RingSDK API, UI components, API integration, TopBar management, dialogs, cross-module communication. |
| `/ring-module-configuration` | Configuring modules in Ring Management Console - modules, applications, instances in Spaces, API permissions, and troubleshooting. |

**How to use:**

1. Copy the `.agents/skills/` directory into your own project (under `.agents/skills/`, `.github/skills/`, or `.claude/skills/`).
2. Your AI agent will auto-discover and load the relevant skill - or you can invoke it explicitly (e.g. `/ring-module-development`).
3. Describe what you want to build. The AI will map your requirements to Ring platform patterns.
