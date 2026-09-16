---
name: ring-module-configuration
description: >
  This skill should be used when the user needs to register or update a Ring
  module in Ring Management Console, choose its Space type, configure a Module
  Application (Application URL, route, main application), add or manage a module
  instance in a Space, declare what an administrator configures per Space, grant
  API permissions and capabilities, deploy the application, or troubleshoot
  module availability and "You have no access" or "Selected API not exists"
  errors from /_api. It covers the configuration model, dependencies,
  verification and troubleshooting, and routes click-by-click Management Console
  steps to the canonical guides.
---

# Ring Module Configuration

> **Boundary:** This skill covers Management Console configuration and module lifecycle setup. For implementing module code, use `/ring-module-development`. Platform concepts and relationships are summarized here only where they are needed to complete the configuration.

## Documentation routing

Use this skill for the configuration model, dependencies, verification, and troubleshooting. When the task requires Management Console labels, form fields, button names, or click-by-click actions, consult the corresponding canonical Ring Console guide instead of inferring or reproducing those details here:

- **Create or edit a Module or Module Application:** consult [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html).
- **Create or edit a Module Instance in a Space:** consult [Manage module instance in Space](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-module-instance-in-space/index.html).
- **End-to-end path from registration to deployment:** [Getting started](https://developer.ringpublishing.com/getting-started/index.html) in the developer guide.
- **What the module definition settings do, and how instance configuration and user settings differ:** [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html).
- **Groups, capabilities and API keys:** [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html).
- **Which APIs exist and can be granted:** [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html), generated from the platform at [api.ringpublishing.com](https://api.ringpublishing.com/).
- **Automating module management:** [Modules Framework API](https://developer.ringpublishing.com/topics/modules-framework-api/index.html). Module Instances and Group permissions still require Management Console.
- **Running the module locally once it is registered:** use `/ring-module-local-development`.

Treat the linked Ring Console guides as authoritative for the current Management Console workflow. Do not treat this skill as a replacement for those procedures.

## Module definition

The **Space type** decides where the module can be used and which APIs it may be granted, and cannot be changed later. Changing the definition affects every instance; configuring an instance affects only its Space. The settings that control how the application is loaded (Application URL, `route`, `isMain`, menu visibility) are described in [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html).

## Module instance configuration

When the module needs values from an administrator, the module definition declares how they are collected: **No configuration**, **Configuration from schema** or **Module hosted configuration**. Required fields have to be filled in before the instance can be enabled, so mark as required only what the module cannot start without. The front-end reads the values from `getProfile().currentModuleInstance.metadata.configuration`. Schema rules and the generated form: [Module configuration](https://developer.ringpublishing.com/topics/module-configuration/index.html).

## Grant Module API Permissions

API permissions for a module are granted in Management Console using **Grant module API permissions**. The normal flow does not require a Service Desk request or direct handling of API keys by the module author.

The module calls a Ring Public API through `/_api/<api-codename>/<version>`. Ring UI Proxy uses the configured module permission and forwards the request on behalf of the logged-in user.

The list of APIs offered depends on the module's Space type, and a module with none of an API's capabilities selected cannot call it at all. A `400` or `403` with error code `9002` from `/_api` points back to this grant; see [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html).

For implementation details, consult the API Integration section in `/ring-module-development`. For the Management Console procedure, consult the [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html) guide.

## Deployment

Either self-host the application and set its public URL as the Application URL, or upload the built archive from the module definition and let the platform host it. See Step 6 of [Getting started](https://developer.ringpublishing.com/getting-started/index.html).
