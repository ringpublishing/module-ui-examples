import type { Message } from '@ag-ui/client';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import StopCircleOutlined from '@mui/icons-material/StopCircleOutlined';
import { Alert, Button, IconButton, LinearProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { type ReactElement, useState } from 'react';
import type { StoryNote } from '../shared/types.js';
import { useCommentAgent } from './use-comment-agent.js';

interface CommentAgentProps {
    agentId: string;
    comment: string;
    notes: StoryNote[];
    notesLoading: boolean;
    storyId: string;
}

// Only the text of the conversation; tool calls and their results stay out of the view.
const isText = (message: Message): message is Message & { content: string; } =>
    (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content !== '';

const MessageBubble = ({ message }: { message: Message & { content: string; }; }): ReactElement => (
    <Paper
        variant={message.role === 'user' ? 'elevation' : 'outlined'}
        elevation={0}
        sx={message.role === 'user'
            ? { alignSelf: 'flex-end', maxWidth: '85%', px: 2, py: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }
            : { alignSelf: 'flex-start', maxWidth: '85%', px: 2, py: 1 }}
    >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
    </Paper>
);

const CommentAgent = ({ agentId, comment, notes, notesLoading, storyId }: CommentAgentProps): ReactElement => {
    const { ask, error, isRunning, messages, reply, stop } = useCommentAgent(agentId);
    const [draft, setDraft] = useState('');
    const conversation = messages.filter(isText);

    const handleReply = (): void => {
        if (draft.trim()) {
            void reply(draft.trim());
            setDraft('');
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<SmartToyOutlined />}
                    // The notes go to the agent as context, so an ask waits until they are loaded.
                    disabled={isRunning || notesLoading || !comment.trim()}
                    onClick={(): void => void ask(storyId, comment.trim(), notes)}
                >
                    Ask the agent
                </Button>
                {isRunning && (
                    <Button variant="outlined" startIcon={<StopCircleOutlined />} onClick={stop}>
                        Stop
                    </Button>
                )}
                <Typography variant="body2" color="text.secondary">
                    Asks the agent whether the comment fits the story and the comments it already has.
                </Typography>
            </Stack>
            {conversation.map((message) => <MessageBubble key={message.id} message={message} />)}
            {isRunning && <LinearProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {conversation.length > 0 && !isRunning && !error && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField
                        size="small"
                        fullWidth={true}
                        placeholder="Reply to the agent"
                        value={draft}
                        onChange={(event): void => setDraft(event.target.value)}
                        onKeyDown={(event): void => {
                            // Enter also confirms a character composed with an IME; that one is not a send.
                            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                                handleReply();
                            }
                        }}
                    />
                    <IconButton aria-label="Send" disabled={!draft.trim()} onClick={handleReply}>
                        <SendIcon />
                    </IconButton>
                </Stack>
            )}
        </Stack>
    );
};

export default CommentAgent;
