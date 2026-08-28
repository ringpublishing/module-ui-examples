---
name: ring-module-configuration
description: >
  Guide for configuring Ring modules in Ring Management Console.
  Use when creating modules, configuring module applications, creating module
  instances in Spaces, granting API permissions, or troubleshooting module
  availability and access.
---

# Ring Module Configuration

> **Boundary:** This skill covers Management Console configuration and module lifecycle setup. For implementing module code, use `/ring-module-development`. Platform concepts and relationships are summarized here only where they are needed to complete the configuration.

## When to Use

Use this skill when a module needs to be made available in Ring Publishing, including when you need to:

- create or update a Module;
- configure a Module Application and its endpoint;
- create or manage a Module Instance in a Space;
- grant a module access to another Ring API;

## Documentation routing

Use this skill for the configuration model, dependencies, verification, and troubleshooting. When the task requires Management Console labels, form fields, button names, or click-by-click actions, consult the corresponding canonical Ring Console guide instead of inferring or reproducing those details here:

- **Create or edit a Module or Module Application:** consult [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html).
- **Create or edit a Module Instance in a Space:** consult [Manage module instance in Space](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-module-instance-in-space/index.html).

Treat the linked Ring Console guides as authoritative for the current Management Console workflow. Do not treat this skill as a replacement for those procedures.

## Grant Module API Permissions

API permissions for a module are granted in Management Console using **Grant module API permissions**. The normal flow does not require a Service Desk request or direct handling of API keys by the module author.

The module calls a Ring Public API through `/_api/<api-codename>/<version>`. Ring UI Proxy uses the configured module permission and forwards the request on behalf of the logged-in user.

For implementation details, consult the API Integration section in `/ring-module-development`. For the Management Console procedure, consult the [Manage modules](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-custom-modules.html) guide.
