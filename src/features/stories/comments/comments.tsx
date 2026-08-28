import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import { type CommentsProps, Comments as RingComments, type OnDeleteType, type OnUpdateType } from '@ringpublishing/mui-components';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStoryAddNotePath } from '../../../routes/routes.js';
import { useDeleteNoteMutation, useGetStoryNotesQuery, useUpdateNoteMutation } from '../shared/stories-api.js';

interface CommentsAppResult {
    action?: 'commentAdded';
}

const DEMO_COMMENTS: CommentsProps['initialComments'] = [
    {
        id: 'demo-comment-1',
        text: 'Demo comment - this is an example and does not come from the API.',
        creationTime: 'Just now',
        author: 'Demo user • DEMO',
        isOwner: false
    },
    {
        id: 'demo-comment-2',
        text: 'Add your own comment to replace these demo comments.',
        creationTime: 'Just now',
        author: 'Demo user • DEMO',
        isOwner: false
    },
    {
        id: 'demo-comment-3',
        text: 'These examples are shown only while there are no comments.',
        creationTime: 'Just now',
        author: 'Demo user • DEMO',
        isOwner: false
    }
];

const Comments = (): ReactElement => {
    const { storyId = '' } = useParams<{ storyId: string; }>();
    const [demoCommentsHidden, setDemoCommentsHidden] = useState(false);
    const {
        data: notes = [],
        isFetching: areNotesFetching,
        isError: areNotesError,
        refetch: refetchNotes
    } = useGetStoryNotesQuery(storyId, { skip: !storyId });
    const [updateNote] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();
    const [userId, setUserId] = useState<string>();

    useEffect(() => {
        void RingSDK.api.auth.getProfile()
            .then(({ user }) => setUserId(user.userId))
            .catch(() => setUserId(undefined));
    }, []);

    useEffect(() => {
        setDemoCommentsHidden(false);
    }, [storyId]);

    const handleRefresh = useCallback(async (): Promise<void> => {
        await refetchNotes();
    }, [refetchNotes]);

    const handleAddComment = useCallback(async (): Promise<void> => {
        try {
            const result = await RingSDK.api.apps.openApp<CommentsAppResult>({
                moduleCodeName: '<YOUR_MODULE_CODE_NAME>',
                title: 'Add comment',
                params: {
                    path: getStoryAddNotePath(storyId)
                },
                trackingEvent: { sourceViewName: 'comments', targetViewName: 'addComment' }
            });

            if (result?.action === 'commentAdded') {
                setDemoCommentsHidden(true);
                await new Promise((resolve) => setTimeout(resolve, 300));
                await refetchNotes();
            }
        } catch {
            await RingSDK.api.toasts.showToast({
                title: 'Comment not added',
                message: 'Could not open the add-comment panel.',
                toastVariant: 'error'
            });
        }
    }, [refetchNotes, storyId]);

    useEffect(() => {
        void RingSDK.api.topBar.setActions([
            {
                type: 'button',
                label: 'REFRESH',
                appearance: 'secondary',
                onClick: handleRefresh,
                disabled: areNotesFetching
            },
            {
                type: 'button',
                label: 'ADD',
                appearance: 'primary',
                onClick: handleAddComment
            }
        ]);
    }, [areNotesFetching, handleAddComment, handleRefresh]);

    useEffect(() => () => {
        void RingSDK.api.topBar.setActions([]);
    }, []);

    if (areNotesFetching) {
        return <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}><CircularProgress /></Stack>;
    }

    if (areNotesError) {
        return <Alert severity="error" sx={{ m: 3 }}>Could not load comments for story {storyId}.</Alert>;
    }

    const handleUpdate: OnUpdateType = async (id, text, api): Promise<void> => {
        if (!userId) {
            api.setError('User profile is not available.');

            return;
        }

        try {
            await updateNote({ id: String(id), text, userId, storyId }).unwrap();
            api.updateComment({ text });
        } catch (error) {
            api.setError(error instanceof Error ? error.message : 'Could not update the comment.');
        }
    };

    const handleDelete: OnDeleteType = async (id, api): Promise<void> => {
        if (!userId) {
            api.setError('User profile is not available.');

            return;
        }

        const response = await RingSDK.api.dialog.createDialog({
            title: 'Delete comment?',
            content: 'Are you sure you want to delete this comment?',
            buttons: [
                { label: 'No', name: RingSDK.constants.ButtonTypes.DECISION_NO },
                {
                    label: 'Yes',
                    name: RingSDK.constants.ButtonTypes.DECISION_YES,
                    primary: true
                }
            ]
        });

        if (response !== RingSDK.constants.ButtonTypes.DECISION_YES) {
            api.setError('');

            return;
        }

        try {
            await deleteNote({ id: String(id), userId, storyId }).unwrap();
            api.deleteComment();
            await refetchNotes();
        } catch (error) {
            api.setError(error instanceof Error ? error.message : 'Could not delete the comment.');
        }
    };

    const comments: CommentsProps['initialComments'] = notes.length > 0 || demoCommentsHidden
        ? notes.map((note) => ({
            id: note.id,
            text: note.text,
            creationTime: note.system.creationTime,
            author: note.system.creator.name,
            isOwner: note.system.creator.id === userId
        }))
        : DEMO_COMMENTS;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <RingComments
                initialComments={comments}
                disableCreatePanel={true}
                labels={{
                    placeholder: 'Comment',
                    editing: 'Editing',
                    modified: 'Modified',
                    add: 'Add',
                    update: 'Update',
                    cancel: 'Cancel'
                }}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default Comments;
