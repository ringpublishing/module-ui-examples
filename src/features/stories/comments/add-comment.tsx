import { Box, TextField } from '@mui/material';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateNoteMutation } from '../shared/stories-api.js';

const StoryAddNote = (): ReactElement => {
    const { storyId = '' } = useParams<{ storyId: string; }>();
    const [text, setText] = useState('');
    const [createNote, { isLoading }] = useCreateNoteMutation();

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
        <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
            <TextField
                label="Comment *"
                multiline={true}
                fullWidth={true}
                value={text}
                onChange={(event): void => setText(event.target.value)}
                disabled={isLoading}
            />
        </Box>
    );
};

export default StoryAddNote;
