import { createBrowserRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ROUTES } from './routes.js';
import Comments from '../features/stories/comments/comments.js';
import AddNote from '../features/stories/comments/add-comment.js';
import StoryBrowser from '../features/stories/story-browser/story-browser.js';

const StoryBrowserRoute = (): ReactElement => {
    return <StoryBrowser />;
};

const router = createBrowserRouter([
    {
        path: ROUTES.home,
        element: <StoryBrowserRoute />
    },
    {
        path: ROUTES.storiesExample,
        element: <StoryBrowserRoute />
    },
    {
        path: ROUTES.storyOpenApp,
        element: <Comments />
    },
    {
        path: ROUTES.storyAddNote,
        element: <AddNote />
    }
]);

export default router;
