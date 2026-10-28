# Setting up

What the example module needs on the Ring side, and how to run it from your machine. Back to the [README](../README.md).

## Requirements

To run and test this module against a real Ring environment, you need:

1. **A Ring Publishing account** with access to at least one Space.  
   → [Get access](https://help.ringpublishing.com/getting-started/get-access.html)

2. **A registered module** in Ring Management Console, with a module instance added to your Content Space.  
   → [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html)

3. **Content API permissions** granted to the module in that Content Space: both `read` and `write`. The example reads stories and also modifies Content API data, so both permission types are required for the full flow to work. Granting is self-service in Management Console; see [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html). Content API is one entry in the [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html), which lists each API's `/_api` path, codename and Space type.

4. **A development variant** of the module's vhost in Ring Accelerator with **Upstream type: Dev tunnel**, so that the platform can serve the module from your machine. See [Running locally](#running-locally).

5. **An AI agent (optional):** the add-comment view can ask an agent of Ring Agents about the comment. This needs an agent in the Ring Agents panel, the `agents-invoke` API granted to the module, and the agent's id in `src/config.ts`. See [AI help with a comment](ai-agent.md). Without it the rest of the example works as before.

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
