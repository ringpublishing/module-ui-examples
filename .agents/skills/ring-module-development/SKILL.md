---
name: ring-module-development
description: >
  This skill should be used when the user is developing, scaffolding or
  modifying the code of a Ring Publishing module: using RingSDK (user profile
  and capabilities, TopBar, dialogs, toasts, openApp navigation, slots and
  extensions, user settings, WebMCP tools), Ring UI components, or calls to Ring
  APIs through /_api/ and their failure modes, or asking how a module reads its
  instance configuration. It covers implementation only; Management Console
  setup and running the module locally have their own skills.
---

# Ring Module Development

> **Runtime context:** A standalone module runs inside an iframe hosted by the Ring TopBar. It must use the platform SDK for shell interactions and must not access the parent page's DOM directly.
>
> **Scope:** This skill covers implementation. For creating or enabling a module in Ring Management Console, use `/ring-module-configuration`.

## How to use this skill

When implementing a module:

1. Clarify the user flow and the data it owns.
2. Select the Ring platform primitive that matches the flow: RingSDK, Ring UI component, `/_api/` request, TopBar action, dialog, toast, or app navigation.
3. Inspect the repository's existing patterns and adapt them rather than copying them blindly.

## Documentation routing

Use this skill for implementation decisions and verified usage patterns. Consult the canonical source for details that change independently from application code:

- **Management Console setup:** use `/ring-module-configuration` and its linked Ring Console guides.
- **Running the module locally:** use `/ring-module-local-development`.
- **RingSDK reference and tutorials:** [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) for every method and constant; [Build a module](https://developer.ringpublishing.com/howto/build-a-module/index.html) for the TopBar, dialog, API, slot and extension tutorials.
- **RingSDK types:** use `@ringpublishing/ui-sdk-types` as the source of truth for RingSDK method signatures, return values, optional parameters, and other API contracts; follow the types when adding SDK calls.
- **Ring UI components:** query `@ringpublishing/mui-components-mcp` and consult the component documentation before choosing props or variants.
- **Ring APIs:** codename, version, protocol and Space type come from the [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html); the bridge, its errors and rate limits are in [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html). Fields, filters and error contracts come from the target API's own documentation and schema.
- **Module with its own backend:** [Authenticating your module's backend](https://developer.ringpublishing.com/topics/public-api/backend-integration.html). Build on the signed `x-ring-token`, not on the deprecated `x-ring-*` headers.
- **Configuration and permissions:** [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html) and [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html).

Do not treat the examples in this skill as a complete SDK, component, API, or Management Console reference.

This skill does not prescribe a framework, state-management library, router, or build tool.

## 1. Runtime model
- The **TopBar** is the Ring shell and hosts module applications.
- A **Module Application** runs in an iframe and receives its Ring context from the platform.
- A **Space** is the tenant context for the running module. Do not hardcode a Space, client, or user identifier.
- `RingSDK` is the platform API exposed to the module.
- Requests to Ring Public APIs go through the `/_api/` bridge; the module does not manage the platform API key or user access token.

Configuration is a prerequisite for runtime access. If the module or API permission has not been configured, follow `/ring-module-configuration` before debugging application code.

## 2. Implementation rules

1. **Use `RingSDK` for platform interactions.** Use it for TopBar state, dialogs, notifications, authentication context, and cross-module navigation.
2. **Prefer `@ringpublishing/mui-components`.** Use MUI only when the Ring library has no suitable component; use custom UI only when neither library provides the required behavior.
3. **Call Ring APIs through `/_api/`.** Do not call Ring Public API hosts directly from module code. A module's own backend may use its own API contract.
4. **Reflect document state in TopBar.** Keep the TopBar state aligned with unsaved changes, saving, successful save, and failure.
5. **Use platform feedback primitives.** Use a toast for transient feedback, a dialog for confirmation or input, and TopBar state/actions for document-level work.
6. **Use `openApp` or `embedApp` for Ring app navigation.** Do not implement a parallel cross-module protocol.

## 3. RingSDK patterns

The SDK is always available inside a module running in Ring. Test RingSDK interactions in the Ring environment (see `/ring-module-local-development`); standalone execution without Ring context is outside this skill. Do not read `RingSDK` at import time: outside the Ring Publishing iframe the global does not exist, and a top-level call throws before the application renders, including in unit tests.

Prefer `RingSDK.constants` (`TopBarStates`, `OpenModes`, `ButtonTypes`) over literal strings; the string may change, the constant will not. See [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) for the full list.

### User and authorization context

Use `RingSDK.api.auth.getProfile()` when the module needs the logged-in user's profile, language, or platform-provided context. Do not infer user identity from URL parameters or maintain a second identity mechanism.

```js
const profile = await RingSDK.api.auth.getProfile();
console.log(profile.language);
```

The profile also carries `capabilities`, what this user may do in the module. Ring UI Proxy checks only that the user holds *some* capability; whether they may perform a particular operation is the module's decision, so read `capabilities` before exposing write actions. See [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html).

```js
const profile = await RingSDK.api.auth.getProfile();
const canWrite = profile.capabilities.includes('can_write');
```

### Configuration and user settings

Instance configuration, entered by an administrator per Space, arrives with the profile; per-user settings are read and written with `RingSDK.api.user`, and `saveSettings` replaces the stored object rather than merging. Which mechanism fits which kind of setting is explained in [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html).

```js
const profile = await RingSDK.api.auth.getProfile();
const config = profile.currentModuleInstance.metadata.configuration;
```

```js
const settings = await RingSDK.api.user.getSettings();
await RingSDK.api.user.saveSettings({ ...settings, defaultView: 'list' });
```

### TopBar state and actions

Use `MODIFIED` while the user has unsaved changes, `DEFAULT` after a successful save, and `ERROR` when an operation fails. On failure, expose a retry action and return to `DEFAULT` only after recovery.

```js
RingSDK.api.topBar.setState(RingSDK.constants.TopBarStates.MODIFIED);
RingSDK.api.topBar.setActions([
    {
        type: 'button',
        label: 'Save',
        appearance: 'primary',
        onClick: handleSave
    }
]);
RingSDK.api.topBar.setMoreActions([
    { label: 'Revert changes', onClick: handleRevert }
]);

// After save:
RingSDK.api.topBar.setState(RingSDK.constants.TopBarStates.DEFAULT);

// After a failed save:
RingSDK.api.topBar.setState(RingSDK.constants.TopBarStates.ERROR);
RingSDK.api.topBar.setActions([
    {
        type: 'button',
        label: 'Retry',
        appearance: 'primary',
        onClick: handleSave
    }
]);
```

Keep the TopBar action set complete when configuring the actions. Use `setTitle` when the module needs to identify the current view or resource. The title can be a string or an object with a title, a prefix, labels, and a subtitle.

Use `setAvatars` to show the users currently collaborating in the module. Each avatar item contains a display name, status, and UUID.

```js
RingSDK.api.topBar.setTitle({
    title: 'Story settings',
    subtitle: { text: 'Draft' },
    labels: [{ text: 'Unsaved', color: 'warning' }]
});

RingSDK.api.topBar.setAvatars({
    items: collaborators.map((user) => ({
        name: user.name,
        status: user.status,
        uuid: user.uuid
    }))
});
```

### Dialogs

Use a platform dialog for confirmation instead of building a second modal system.

```js
const response = await RingSDK.api.dialog.createDialog({
    title: 'Discard changes?',
    content: 'Unsaved changes will be lost.',
    buttons: [
        { label: 'No', name: RingSDK.constants.ButtonTypes.DECISION_NO },
        { label: 'Yes', name: RingSDK.constants.ButtonTypes.DECISION_YES, primary: true }
    ]
});

// `response` is the identifier of the button selected by the user.

if (response === RingSDK.constants.ButtonTypes.DECISION_YES) {
    handleRevert();
}
```

For text input, add the SDK dialog's `input` configuration. Without `input`, the promise resolves to the selected button name as a string. With `input`, it resolves to `{ response, value? }`.

```js
const { response, value } = await RingSDK.api.dialog.createDialog({
    title: 'Add comment',
    content: 'Enter a comment.',
    buttons: [
        { label: 'Cancel', name: RingSDK.constants.ButtonTypes.DECISION_NO },
        { label: 'Save', name: RingSDK.constants.ButtonTypes.DECISION_YES, primary: true }
    ],
    input: { value: '', labels: { title: 'Comment' } }
});

if (response === RingSDK.constants.ButtonTypes.DECISION_YES && value) {
    saveComment(value);
}
```

Button names are application-defined identifiers.

### App navigation

Use `openApp` to open a view in a side panel. The opened view can belong to the current module or to another module. This is useful for opening a route from the current application - for example, a form, an add or edit view, or another focused flow - without replacing the current view. Use `closeApp` to close the side panel and optionally return a result, `getInitialData` to read data supplied by the caller, and `embedApp` when another module should render inline. Define the data contract between the caller and the opened view; do not assume that the opened view accepts arbitrary `initialData`.

The promise returned by `openApp` resolves with the data supplied by the opened view when it calls `closeApp`. In this repository, the story browser opens its add-comment route in a side panel. The caller passes the story identifier in `params.initialData`, the opened route reads it with `getInitialData`, creates the comment, and closes the panel with an action result. The caller then refreshes the comments.

For a route of the same module, take the code name from `RingSDK.params.moduleCodeName`. To open another module, use that module's code name, shown in the module's details in Management Console; do not hardcode it.

```js
// Caller: open the add-comment route from the same module
const result = await RingSDK.api.apps.openApp({
    moduleCodeName: RingSDK.params.moduleCodeName,
    title: 'Add comment',
    params: {
        path: `/stories-example/${storyId}/add-comment`,
        initialData: { storyId }
    },
    trackingEvent: { sourceViewName: 'comments', targetViewName: 'addComment' }
});

// Opened route returns this result through closeApp after saving
if (result?.action === 'commentAdded') {
    await refetchComments();
}
```

The opened route can read the caller's data, perform its flow, and return a result when it closes:

```js
// Opened route: rendered in the side panel
const { storyId } = await RingSDK.api.apps.getInitialData();

// ... let the user write a comment and save it for storyId ...

await RingSDK.api.apps.closeApp({ action: 'commentAdded' });
```

Use the target module's documentation for its `path`, `initialData`, and returned-data contract. Do not hardcode an environment-specific host generated by `generateAppUrl`. Set the panel size with `params.options.mode` and `RingSDK.constants.OpenModes`.

When a core module opens this module, for example as a Story Editor slot or extension, the module runs in *external mode*: `getInitialData()` in, `closeApp({ data })` out. Follow the data contracts in [Creating Slot](https://developer.ringpublishing.com/howto/build-a-module/create-slot.html) and [Creating Extension](https://developer.ringpublishing.com/howto/build-a-module/create-extensions.html).

### Notifications and errors

Use `RingSDK.api.toasts.showToast` for short-lived success, warning, or error feedback. Use the SDK logging API for product analytics and error reporting, not for arbitrary debug logging.

```js
await RingSDK.api.toasts.showToast({
    title: 'Save failed',
    message: 'Could not save changes. Please try again.',
    toastVariant: 'alert'
});
```

For product analytics, use the typed logging methods documented by the SDK, such as `sendUIEvent` and `sendUIChangeView`.

UI events represent product behavior or navigation. Use `sendUIEvent`, `sendUIChangeView`, or `openApp`'s `trackingEvent` for meaningful events.

```js
RingSDK.api.logs.sendUIEvent({
    category: 'story',
    name: 'storySaved',
    metadata: { storyId: story.id }
});
```

### AI agent tools (WebMCP)

A module can expose its actions to AI agents with `RingSDK.api.webMCP.registerTool`. Register only operations that are safe to trigger programmatically, and unregister a tool when the view that owns it unmounts. Descriptor format and examples: [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html#ringsdk-api-webmcp).

## 4. Ring UI components

> **Example repository note:** The patterns and code in this repository are illustrative, including the StoryBrowser flow. They demonstrate platform integration rather than prescribing a project structure or a production architecture. Adapt the examples to the module's actual requirements.

### Component priority

1. `@ringpublishing/mui-components`
2. MUI (`@mui/material`, `@mui/x-*`)
3. A custom component only when neither library provides the needed behavior

The Ring Components MCP server is available as [`@ringpublishing/mui-components-mcp`](https://www.npmjs.com/package/@ringpublishing/mui-components-mcp). Use it to inspect component names, props, stories, usage guidance, and examples instead of guessing.

Configure it in an MCP-compatible client:

```json
{
    "mcpServers": {
        "ring-mui": {
            "command": "npx",
            "args": ["-y", "@ringpublishing/mui-components-mcp"]
        }
    }
}
```

### Theme

Wrap the application in `ThemeConfig` so the Ring theme is applied:

```tsx
import { ThemeConfig } from '@ringpublishing/mui-components';

<ThemeConfig mode="light">
    <App />
</ThemeConfig>
```

Choose the mode according to the module's supported theme behavior. Use the component documentation for component-specific props and variants.

### MUI X license

If the module uses Ring components built on MUI X Pro, initialize the license supplied by the platform when running inside Ring. For standalone development, use the licensing setup required by the MUI X package and your project agreement.

```js
const licenseKey = RingSDK.api.config.getComponentsLicenseKey();
LicenseInfo.setLicenseKey(licenseKey);
```

## 5. API integration

### Request pattern

Use a standard HTTP client with the Ring UI API bridge:

```text
Module iframe → /_api/<api-codename>/<version> → Ring API Gateway → target API
```

Ring APIs may expose REST or GraphQL. For a GraphQL API, the request commonly uses a JSON body containing `query` and `variables`; follow the target API's schema and error contract.

Take the codename and version from the [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html). The `/_api` prefix is reserved for Ring UI Proxy, so do not use it in the module's own routing. The Space is not passed; UI Proxy adds it from the module's context.

### API schema

The API schema endpoint follows this pattern:

```text
https://api.ringpublishing.com/<api-name>/v<version>/schema
```

Here, `<api-name>` is the API codename, such as `content`. Use the schema matching the API and version requested by the module when constructing GraphQL queries, variables, and mutations.

This is the one case where fetching `api.ringpublishing.com` directly is expected: it's a dev-time/tooling lookup (schema introspection, codegen, exploring the contract), not a runtime call from module code. At runtime, GraphQL requests still go through `/_api/<api-name>/<version>` per Rule 3.

#### StoryBrowser example

For the StoryBrowser example using Content API v2, the schema endpoint is:

```text
https://api.ringpublishing.com/content/v2/schema
```

Verify endpoint and schema details in the target API's canonical documentation; they are not part of the UI SDK contract. Every GraphQL API also serves an interactive [GraphQL playground](https://developer.ringpublishing.com/topics/public-api/graphql-playground.html) at its base URL, which is the quickest way to explore the schema and try a query.

The StoryBrowser example sends GraphQL requests through the Ring UI API bridge. It demonstrates both read operations and write operations: queries retrieve stories, details, statuses, and notes, while mutations create, update, and soft-delete notes. The exact schema fields, mutation contracts, and permission names must always be verified against the target Content API version.

```ts
const response = await fetch('/_api/content/v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
        query: 'query { stories(first: 1) { edges { node { id } } } }'
    })
});

await response.json();
```

### Failures and limits

Read `x-api-err-kind` and `x-api-err-code` on a failed response, including a GraphQL error returned with `200`, before deciding whether to retry. A `400` or `403` with error code `9002` comes from the bridge, not from the API: the codename or version does not exist, or the API has not been granted to the module. A `403` from the API itself usually means a capability missing from the grant. Rate limits are per API key and Space, shared by every user of the module in that Space, so batch requests. Error table and limits: [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html); the module's own traffic and headroom: [Monitoring your API usage](https://developer.ringpublishing.com/topics/public-api/monitoring.html).

### API permissions prerequisite

Requests to `/_api/*` require the module to be configured and granted access in Ring Management Console. For setup and configuration troubleshooting, consult `/ring-module-configuration` and the canonical [Ring Console documentation](https://help.ringpublishing.com/docs/ManagementConsole/index.html).

The module author does not manage or copy API keys. Ring UI Proxy uses the configured module permission when forwarding requests on behalf of the logged-in user. If a request returns `403`, verify configuration and user capability before changing request code.

## Further reading

- [Ring Publishing developer guide](https://developer.ringpublishing.com/) - [Getting started](https://developer.ringpublishing.com/getting-started/index.html), [Build a module](https://developer.ringpublishing.com/howto/build-a-module/index.html), [Ring SDK for UI](https://developer.ringpublishing.com/reference/ring-sdk-ui.html)
- [Ring Components MCP package](https://www.npmjs.com/package/@ringpublishing/mui-components-mcp)
- [Ring UI component Storybook](https://design.ringpublishing.com/)
- [Ring UI component repository](https://github.com/ringpublishing/mui-components)
