import { configureStore } from '@reduxjs/toolkit';
import { storiesApi } from './features/stories/shared/stories-api.js';

export const store = configureStore({
    reducer: {
        [storiesApi.reducerPath]: storiesApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(storiesApi.middleware)
});
