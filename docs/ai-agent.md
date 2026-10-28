# AI help with a comment

How the add-comment view works with an AI agent, and how to connect one of your own. Back to the [README](../README.md).

## What it is

Ring Agents is the part of Ring Publishing where editors set up AI agents: assistants that read stories, answer questions and run small workflows, with the tools and the prompts they need. A module can hand work to such an agent instead of calling a language model itself.

This example plugs one into the add-comment view. While writing a comment on a story, the editor can ask the agent whether the comment is clear and on topic, and talk it over before posting. What the agent checks is decided by its system prompt in the Ring Agents panel, not by the module's code, so editors can change it without a new release of the module.

## How it works

The module sends the agent a message with the story id and the comment, as a chat would. The agent reads the story itself, with its own tools. The story's existing comments go along as context, so the agent can tell when a comment repeats one.

The answer streams into the view as the agent writes it, a run can be stopped, and the editor can reply: the reply goes on with the same thread, so the agent remembers what it said. All of it is plain [AG-UI](https://docs.ag-ui.com), which `RingSDK` gives the module ready to use.

The code is in `src/features/stories/comments/`: `use-comment-agent.ts` runs the agent, `comment-agent.tsx` shows the conversation. The API is described in [Use Ring Agents in a module](https://developer.ringpublishing.com/howto/build-a-module/use-ring-agents.html).

The wording of the message lives in the module. When it should live in the panel instead, so that editors can change it without a release of the module, Ring Agents has **actions**: a prompt with placeholders, kept next to the agent, which the module runs with `runAction()` giving only the values. The page above describes them.

## Connecting your own agent

1. Grant the module the `agents-invoke` API, the same way as Content API (see [Setting up](setup.md)).

2. In the Ring Agents panel, create an agent whose system prompt says what to check, for example:

   ```text
   You check comments editors want to leave on stories. Read the story with your tools and compare the comment with the comments already left on it. Say in two sentences whether it is on topic, new and clear enough to act on, starting with OK or Not OK.
   ```

   For the agent to read the story itself, give it a tool that fetches a story by its id.

3. Put the agent's id, shown in the panel, in `src/config.ts`.

Without the id the view says where to set it, and the rest of the example works as before.
