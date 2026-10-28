# What the example demonstrates

The flow of the example module, and what it deliberately leaves out. Back to the [README](../README.md).

The module presents a list of stories loaded from Content API, with an example filter for publication status and a text search. Selecting a story displays its details and opens a comments view. The comments view loads comments assigned to the story and demonstrates adding new comments, editing existing comments, and soft-deleting comments. While a comment is written, an AI agent can look at it (see [AI help with a comment](ai-agent.md)).

The flow demonstrates:

- using [`RingSDK`](https://developer.ringpublishing.com/reference/ring-sdk-ui.html) for module and [TopBar](https://developer.ringpublishing.com/howto/build-a-module/manage-topbar.html) integration, navigation, [dialogs](https://developer.ringpublishing.com/howto/build-a-module/manage-simple-dialogs.html), notifications, and platform context;
- reading stories, story details, publication statuses, and comments from Content API through the [`/_api/` bridge](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html);
- creating, updating, and soft-deleting comments through Content API mutations;
- running an AI agent of Ring Agents from the module: a message sent from the view, the answer streamed back into it, a conversation in the same thread ([Use Ring Agents in a module](https://developer.ringpublishing.com/howto/build-a-module/use-ring-agents.html));
- combining Ring UI components with an application-specific user flow.

The exact API operations, data model, and permissions should be adapted to the needs of the module being built.

## What it is not

The demonstrated flow is intentionally simplified and may not represent a complete real-world editorial scenario. The example is illustrative in the same way throughout: it demonstrates the **integration layer and platform capabilities** rather than prescribing an application structure. Its directory layout, framework, state management, routing, naming, and individual implementation choices are not required patterns. Use the code to understand how the module can communicate with Ring, not as a template that every project should copy.

The folders and files in this repository are organized for readability and demonstration purposes only. They do not define how a Ring module must be structured. Choose the directory structure, architectural boundaries, framework, state-management approach, and naming conventions that fit your own module.
