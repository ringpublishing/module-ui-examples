import Comment from '@mui/icons-material/Comment';
import { CircularProgress, Stack } from '@mui/material';
import { Detail, type DetailDescriptionItem } from '@ringpublishing/mui-components';
import type { ReactElement } from 'react';
import { getStoryOpenAppPath } from '../../../../routes/routes.js';
import { useGetStoryDetailQuery } from '../../shared/stories-api.js';

interface StoryDetailProps {
    storyId: string | null;
    onClose: () => void;
}

const StoryDetail = ({ storyId, onClose }: StoryDetailProps): ReactElement => {
    const openComments = async (): Promise<void> => {
        if (!storyId) {
            return;
        }

        await RingSDK.api.apps.openApp({
            moduleCodeName: '<YOUR_MODULE_CODE_NAME>',
            title: 'Comments',
            params: {
                path: getStoryOpenAppPath(storyId)
            },
            trackingEvent: { sourceViewName: 'storyBrowser', targetViewName: 'comments' }
        });
    };

    const { data: story = null, isFetching: loading } = useGetStoryDetailQuery(storyId ?? '', {
        skip: !storyId
    });

    if (loading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                <CircularProgress aria-label="Loading story details" />
            </Stack>
        );
    }

    const descriptionItems: DetailDescriptionItem[] = story
        ? [
            {
                sectionTitle: 'PUBLICATION DATA',
                fields: [
                    { name: 'Publication status', value: story.publication?.status ?? 'NEW' }
                ]
            },
            {
                sectionTitle: 'SYSTEM INFO',
                fields: [
                    { name: 'Identifier (UUID)', value: story.id }
                ]
            }
        ]
        : [];

    return (
        <Detail
            empty={!story}
            main={{
                title: story?.title ?? '',
                mediaProps: story?.image ? { image: story.image.url } : undefined,
                onCloseClick: onClose
            }}
            descriptionItems={descriptionItems}
            bottomActions={story ? [{ name: 'Comments', icon: <Comment />, onClick: openComments }] : []}
        />
    );
};

export default StoryDetail;
