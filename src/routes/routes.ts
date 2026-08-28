export const ROUTES = {
    home: '/',
    storiesExample: '/stories-example',
    storyOpenApp: '/stories-example/:storyId',
    storyAddNote: '/stories-example/:storyId/add-comment'
} as const;

export const getStoryOpenAppPath = (storyId: string): string => `${ROUTES.storiesExample}/${encodeURIComponent(storyId)}`;
export const getStoryAddNotePath = (storyId: string): string => `${ROUTES.storiesExample}/${encodeURIComponent(storyId)}/add-comment`;
