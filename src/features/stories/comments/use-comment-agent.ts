// An agent of Ring Agents, run from the module: https://developer.ringpublishing.com/howto/build-a-module/use-ring-agents.html
import type { AgentSubscriber, Context, Message } from '@ag-ui/client';
import type { RingAgent } from '@ringpublishing/ui-sdk-types';
import { useEffect, useRef, useState } from 'react';
import type { StoryNote } from '../shared/types.js';

export interface CommentAgent {
    ask(storyId: string, comment: string, notes: StoryNote[]): Promise<void>;
    error?: string;
    isRunning: boolean;
    messages: Message[];
    reply(content: string): Promise<void>;
    stop(): void;
}

// The agent reads the story with its own tools, if it has any; the comments the module already has.
function notesContext(notes: StoryNote[]): Context[] {
    const value = notes.map(({ system, text }) => ({ author: system.creator.name, createdAt: system.creationTime, text }));

    return [{ description: 'Comments already left on the story', value: JSON.stringify(value) }];
}

// `agentId` is the agent's id from the Ring Agents panel, set in src/config.ts.
export function useCommentAgent(agentId: string): CommentAgent {
    const agent = useRef<RingAgent | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string>();

    const run = async (start: (subscriber: AgentSubscriber) => Promise<unknown>): Promise<void> => {
        setIsRunning(true);
        setError(undefined);

        try {
            await start({
                onMessagesChanged: ({ messages: current }) => setMessages([...current]),
                // A run ends with RUN_ERROR instead of rejecting; abortRun() ends it with the code "abort".
                onRunErrorEvent: ({ event }) => {
                    if (event.code !== 'abort') {
                        setError(event.message);
                    }
                }
            });
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : String(failure));
        } finally {
            setIsRunning(false);
        }
    };

    // One more message of the user, and a run of the agent on the thread so far.
    const send = (current: RingAgent, content: string, subscriber: AgentSubscriber, context: Context[] = []): Promise<unknown> => {
        current.addMessage({ content, id: crypto.randomUUID(), role: 'user' });
        setMessages([...current.messages]);

        return current.runAgent({ context }, subscriber);
    };

    // Each ask starts a new thread, with the story id and the comment in its first message.
    // The agent is made inside the run, so a wrong id in the configuration shows as the run's error.
    const ask = (storyId: string, comment: string, notes: StoryNote[]): Promise<void> => {
        const prompt = `Check this comment an editor wants to leave on story ${storyId}.\n\n${comment}`;

        setMessages([]);

        return run((subscriber) => {
            agent.current = RingSDK.api.agents.createHttpAgent({ agentId });

            return send(agent.current, prompt, subscriber, notesContext(notes));
        });
    };

    // A reply goes on with the same thread.
    const reply = (content: string): Promise<void> => {
        const current = agent.current;

        return current ? run((subscriber) => send(current, content, subscriber)) : Promise.resolve();
    };

    const stop = (): void => agent.current?.abortRun();

    useEffect(() => () => agent.current?.abortRun(), []);

    return { ask, error, isRunning, messages, reply, stop };
}
