import { Alert, Link, Stack, TextField } from '@mui/material';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { config } from '../../../config.js';
import { useCreateNoteMutation, useGetStoryNotesQuery } from '../shared/stories-api.js';
import CommentAgent from './comment-agent.js';

const StoryAddNote = (): ReactElement => {
    const { storyId = '' } = useParams<{ storyId: string; }>();
    const [text, setText] = useState('');
    const [createNote, { isLoading }] = useCreateNoteMutation();
    const { agents } = config;
    // The notes are only context for the agent; without one the view does not fetch them.
    const { data: notes = [], isLoading: notesLoading } = useGetStoryNotesQuery(storyId, { skip: !storyId || !agents.agentId });

    const handleAdd = useCallback(async (): Promise<void> => {
        try {
            const profile = await RingSDK.api.auth.getProfile();
            await createNote({ text: text.trim(), targetId: storyId, userId: profile.user.userId }).unwrap();

            await RingSDK.api.toasts.showToast({
                title: 'Comment added',
                message: 'The comment was added successfully.',
                toastVariant: 'success'
            });

            await RingSDK.api.apps.closeApp({ action: 'commentAdded' });
        } catch {
            await RingSDK.api.toasts.showToast({
                title: 'Comment not added',
                message: 'Could not add the comment.',
                toastVariant: 'error'
            });
        }
    }, [createNote, storyId, text]);

    useEffect(() => {
        void RingSDK.api.topBar.setActions([
            {
                type: 'button',
                label: 'ADD',
                appearance: 'primary',
                onClick: handleAdd,
                disabled: isLoading || !text.trim()
            }
        ]);
    }, [handleAdd, isLoading, text]);

    useEffect(() => () => {
        void RingSDK.api.topBar.setActions([]);
    }, []);

    return (
        <Stack spacing={3} sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
            <TextField
                label="Comment *"
                multiline={true}
                minRows={3}
                fullWidth={true}
                value={text}
                onChange={(event): void => setText(event.target.value)}
                disabled={isLoading}
            />
            {agents.agentId
                ? (
                    <CommentAgent
                        agentId={agents.agentId}
                        comment={text}
                        notes={notes}
                        notesLoading={notesLoading}
                        storyId={storyId}
                    />
                )
                : (
                    <Alert severity="info">
                        AI help with the comment is off. To turn it on, put the id of an agent in{' '}
                        <code>src/config.ts</code>; see{' '}
                        <Link href="https://developer.ringpublishing.com/howto/build-a-module/use-ring-agents.html" target="_blank" rel="noopener">
                            Use Ring Agents in a module
                        </Link>
                        .
                    </Alert>
                )}
        </Stack>
    );
};

export default StoryAddNote;
