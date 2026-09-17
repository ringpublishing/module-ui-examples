---
name: ring-public-apis
description: >
  This skill should be used whenever anything calls a Ring Publishing public
  API, no matter which side the call comes from: finding which API exists and
  under what code name and path in the Public API catalog, fetching a GraphQL or
  REST schema, using a playground or the beta host, calling an API from a module
  front-end through the /_api bridge, authenticating a module's own backend with
  the x-ring-token identity token and OAuth token exchange, obtaining a bearer
  token with OAuth client credentials and an API key for a cron, ETL,
  third-party integration or an interactive terminal or agent session, and
  diagnosing 401, 403, invalid_client, invalid_grant, missing capability and
  rate-limit failures. It covers reaching the API; RingSDK, Ring UI components
  and the rest of a module's code have their own skill.
---

# Ring Public APIs

> **Boundary:** This skill covers reaching an API — which one, how to authenticate as
> whoever is calling, and how to read a failure. RingSDK, Ring UI components, TopBar and
> the rest of a module's code are `/ring-module-development`. Creating an API key and
> granting a module access to an API are `/ring-module-configuration`.

## 1. Pick your path

Read this table before anything else. The paths do not mix: each has its own credential,
and applying one path's rules to another is the most common way to waste an afternoon.

| You are | Your credential | Go to |
|---|---|---|
| a module front-end running in the Ring iframe | none — the platform authenticates for you | [section 3](#3-from-a-module-front-end) |
| a module's own backend, serving a request that came from your front-end | the `x-ring-token` that arrived with it | [section 4](#4-from-a-module-backend) |
| anything else server-side — a cron job, an ETL process, another system, your own terminal, an agent session | an API key created in Management Console | [section 5](#5-with-your-own-api-key) |
| a service acting on behalf of a *different* client | that service's own key, plus the other client's token | not covered here — see [Credentialed Token Exchange](https://developer.ringpublishing.com/topics/public-api/authentication.html#credentialed-token-exchange). It needs a service account that is not self-service; ask Ring Support before designing around it. |

Every path first needs section 2.

## 2. Find the API

[api.ringpublishing.com](https://api.ringpublishing.com/) is the live list, generated from
the platform. The [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html)
adds what the live list does not show, and it is the page to open first.

Four things come from it, and you need all four before writing a request:

- **Protocol** — REST or GraphQL.
- **Path** — what you call, for example `/content/v2`.
- **Module code name** — what you ask for a token for, for example `content-api`.
- **Space type** — Content, Website or Management. An API can only be reached in a Space of
  its type.

> **The path and the module code name are different strings, and for most APIs they do not
> match.** They are separate columns in the catalog. Taking one where the other belongs is
> the single most common setup mistake, and section 6 shows exactly what it looks like when
> it happens. Read each from its own column.

The catalog lists what is available to you rather than everything that exists — an API can
be hidden. And [api-beta.ringpublishing.com](https://api-beta.ringpublishing.com/) is the
same thing for the beta environment, with its own catalog, where a version can be tried
before it reaches production.

### Learn the schema before writing a query

Do not guess field names. Every GraphQL API serves an interactive
[playground](https://developer.ringpublishing.com/topics/public-api/graphql-playground.html)
at its base URL, and every REST API serves
[its own](https://developer.ringpublishing.com/topics/public-api/rest-api-playground.html).
A GraphQL schema is also fetchable for codegen or introspection:

```text
https://api.ringpublishing.com/<codename>/v<version>/schema
```

Fetching the schema from the host directly is a development-time lookup and is expected.
It is not how a module front-end makes runtime calls — see section 3.

Names do not carry over from other GraphQL APIs you have used. Content API, for example,
counts the results of a connection with `total`, not the `totalCount` the convention would
suggest. A wrong guess costs a round trip, and the validation error names the right field
(`Did you mean "total"?`), so reading the schema or the error beats reasoning about it.

Fields, filters, mutations and error contracts belong to each API's own documentation,
linked from the catalog. This skill does not restate them.

## 3. From a module front-end

A module application does not call `api.ringpublishing.com`. It calls a relative path, and
Ring UI Proxy authenticates the request on behalf of the signed-in user:

```text
Module iframe → /_api/<codename>/v<version> → Ring API Gateway → target API
```

```ts
const response = await fetch('/_api/content/v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
        query: 'query { stories(first: 1) { edges { node { id } } } }'
    })
});
```

Rules for this path:

- **Never call a Ring API host directly from module code.** The module does not hold and
  must not manage a platform key or user token.
- **The Space is not passed.** UI Proxy adds it from the module's context. Do not hardcode
  a Space, client or user identifier.
- **The whole `/_api` prefix is reserved.** Do not use it in the module's own routing.
- **Access must be granted first.** A `400` or `403` carrying error code `9002` comes from
  the bridge rather than the API: the codename or version does not exist, or the module was
  never granted that API. That is a Management Console problem — go to
  `/ring-module-configuration`, not to your request code.
- **Read `x-api-err-kind` and `x-api-err-code`** on a failed response, including a GraphQL
  error returned with `200`, before deciding whether to retry. These headers belong to the
  bridge; they are not present on the direct-host paths in sections 4 and 5.
- **Rate limits are shared.** They apply per API key and Space, so every user of the module
  in that Space draws on the same allowance. Batch rather than loop.

Full table of bridge errors and limits:
[Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html).

## 4. From a module backend

When a request goes front-end → your backend → a Ring API, your backend has two jobs:
establish that the request really came from Ring and who it is for, then call the API as
that person without holding a credential for every Space it serves. One short-lived token
answers both.

The sequence:

1. Ring UI Proxy adds an **`x-ring-token`** header when it forwards a request to your
   module application. It describes the user and their context and is valid for ten
   minutes. A token arriving from the browser is discarded and replaced, so what you
   receive is always one the platform issued.
2. **Verify it.** Never trust a token you have not checked.
3. **Exchange it** for an access token scoped to the API you want. No credentials of your
   own are needed for this exchange.
4. **Call the API** with that access token as a bearer token.

Rules that are easy to get wrong:

- **Fetch signing keys from the issuer, do not embed a public key.** The platform rotates
  them and each token's `kid` says which one was used. Discovery lives at
  `https://auth.ringpublishing.com/.well-known/openid-configuration`.
- **Tokens are signed with ES256.** If your stack cannot verify that, talk to Ring Support
  rather than designing around it.
- **Check signature, issuer, full audience and expiry** — then apply your own authorization
  on top. A valid token proves who is asking, not that they may do it.
- **There are two different audiences in the chain, and confusing them is the usual first
  mistake.** The token arriving at your backend is audienced to *your* module. The token
  you exchange it for is audienced to *the API you are about to call*.
- **A token that has already been exchanged cannot be exchanged again.**
- **The exchanged token expires no later than the token it came from**, so a long job needs
  its own strategy rather than one token carried through.
- **Your module must have been granted the target API**, exactly as for the bridge in
  section 3.
- **Do not build on the `x-ring-*` headers.** They still carry the same context and still
  work, but they are deprecated: a header is merely asserted, while a token is signed and
  can be verified. Everything they carry is a claim in the token.

[Authenticating your module's backend](https://developer.ringpublishing.com/topics/public-api/backend-integration.html)
walks the whole sequence with a working `jose` verifier and the exchange request. Use it
rather than reconstructing the code from this summary.

## 5. With your own API key

For a caller with no signed-in user — a cron job, an ETL process, another system, or you at
a terminal. You need an **access key and secret key** pair, created in Management Console
for the Space you are working in and for the module that *publishes the API you want to
reach* — the string in the catalog's **Module code name** column, not a module of your own
([Manage API keys](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-api-keys.html)).
Permissions are attached to a key per Space.

Exchange the pair for a short-lived bearer token, then send that with each request:

```bash
curl -sS -X POST https://auth.ringpublishing.com/oauth2/token \
  -u "$RING_KEY:$RING_SECRET" \
  -d grant_type=client_credentials \
  --data-urlencode "audience=com.ringpublishing:<module-code-name>:<space-uuid>"
```

```bash
curl -sS -X POST "https://api.ringpublishing.com/<codename>/v<version>/<space-uuid>" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"query":"query { __typename }"}'
```

Note what appears where: the **module code name** goes in the audience, the **path** goes in
the URL, and the **Space UUID goes in both**.

- Tokens last ten minutes. `expires_in` reports what is **left at the moment of the
  response**, not what the token was issued with. Re-mint when one expires; there is nothing
  to refresh.
- **`scope` in the response lists the capabilities the key holds** for the audience you
  asked for.
- The token also carries the context it resolved to — client, module and Space, each as an
  id and a code name. The claim names are listed under
  [The identity token](https://developer.ringpublishing.com/topics/public-api/backend-integration.html#the-identity-token);
  an access token minted from a key carries the same ones.

AWS Signature Version 4 also still works and is still supported for integrations that
already use it, but it has been deprecated since 2026-09. Do not start there, and do not
reach for it from memory.

Reference: [Authentication](https://developer.ringpublishing.com/topics/public-api/authentication.html).

### 5a. From an agent session or a terminal

Mechanically this is section 5. What differs is handling the secret, because an agent
session writes down everything it runs.

- **There is no personal access token for Ring public APIs.** The credential is an access
  key / secret key pair issued in Management Console for a Space and a target module. If you
  are looking for a way to authenticate as yourself with your own login, there isn't one —
  get a key.
- **Keep the secret out of the transcript.** Read it from a gitignored env file into
  variables and let the HTTP client interpolate them, as in the commands above. Never write
  the literal secret into a command, a fixture, a commit or a comment. A secret that reaches
  the session log has to be rotated, not deleted.
- **Mint per task, never cache a token to disk.** Ten minutes is shorter than most
  debugging sessions; a fresh token costs one request.
- **Explore before you query.** Open the playground or fetch the schema (section 2). Field
  names guessed from another API's conventions will cost more than the lookup.
- **Try an unreleased version against the beta host**, not against production.

## 6. When a call fails

Four failures look alike and have nothing to do with each other. Establish which one you
have before changing any code.

**The token endpoint refused you.** The body carries an OAuth error code:

| Response | What it usually means |
|---|---|
| `400` `invalid_request`, `Unknown module` | the audience holds the API's **path** where its **module code name** belongs — the section 2 trap |
| `400` `invalid_request`, `Unknown audience` | the audience is missing the `com.ringpublishing` prefix, or is otherwise malformed |
| `401` `invalid_client`, `Unknown client` | the key or secret is wrong |
| `401` `invalid_client`, **no description** | the key is fine, but it was not issued for the Space named in the audience |
| `400` `invalid_grant` | the subject token is expired, already exchanged, or not one this exchange accepts |

> One trap worth knowing: `invalid_client` does **not** reliably mean bad credentials. The
> same code covers a good key pointed at the wrong Space, and the presence of
> `error_description` is the only difference.

**The API refused the token.** On a direct host call, a gateway rejection looks like
`RING_API_GTW_AUTH_ERROR` with an inner `RING_API_GTW_UNAUTHORIZED_KEY`.

- `401` with `Invalid JWT token` covers both a genuinely bad token **and** a valid token
  whose audience names a different Space than the URL path. The message cannot tell them
  apart; compare the Space in the URL against `ring_space_id` in the token.
- A missing `authorization` header gives `403`, while a bad one gives `401` — the reverse of
  the usual convention. Do not read the status as a hint about which happened.
- Through the bridge instead of the host, read `x-api-err-kind` and `x-api-err-code`, and
  treat code `9002` as a grant problem (section 3).

**A capability is missing.** The call authenticated and was then refused, or a field comes
back empty. Check `scope` from the token response against what the operation needs, then
the grant in `/ring-module-configuration`.

**You are being rate limited.** Limits apply per API key and per Space over a one-minute
window, so several integrations sharing a Space draw on one allowance.
[Monitoring your API usage](https://developer.ringpublishing.com/topics/public-api/monitoring.html)
shows your own traffic in Traffic Analytics, grouped by caller, Space and error code —
which also settles whether a failure is yours or the API's.

## 7. Documentation routing

Consult the canonical source for anything that changes independently of this skill.

**Any path** — [Public API catalog](https://developer.ringpublishing.com/reference/public-api-catalog.html)
(codename, path, version, protocol, Space type) · each API's own documentation, linked from
the catalog, for fields and error contracts · [GraphQL playground](https://developer.ringpublishing.com/topics/public-api/graphql-playground.html)
and [REST playground](https://developer.ringpublishing.com/topics/public-api/rest-api-playground.html) ·
[Monitoring your API usage](https://developer.ringpublishing.com/topics/public-api/monitoring.html)

**Path 3, module front-end** — [Call Ring Publishing APIs from a module](https://developer.ringpublishing.com/howto/build-a-module/call-ring-apis.html)
(the bridge, its errors, its limits) · `/ring-module-configuration` for the grant ·
`/ring-module-development` for the code around the call

**Path 4, module backend** — [Authenticating your module's backend](https://developer.ringpublishing.com/topics/public-api/backend-integration.html)
(the whole sequence, with a working verifier) · [Authentication](https://developer.ringpublishing.com/topics/public-api/authentication.html#oauth-2-0-token-exchange)
for the exchange grant itself

**Path 5, your own key** — [Public APIs authentication](https://developer.ringpublishing.com/howto/public-apis-authentication.html)
(the how-to) · [Authentication](https://developer.ringpublishing.com/topics/public-api/authentication.html)
(the grant in full) · [Manage API keys](https://help.ringpublishing.com/docs/ManagementConsole/howto/manage-api-keys.html)
(getting the pair)

**Permissions, whichever path** — [Permission model](https://developer.ringpublishing.com/topics/permissions/index.html)
