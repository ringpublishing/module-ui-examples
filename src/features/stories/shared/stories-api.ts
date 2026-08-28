import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    CREATE_NOTE_MUTATION,
    DELETE_NOTE_MUTATION,
    PUBLICATION_STATUSES_QUERY,
    STORIES_QUERY,
    STORY_DETAIL_QUERY,
    STORY_NOTES_QUERY,
    UPDATE_NOTE_MUTATION
} from './queries.js';
import type {
    CreateNoteArgs,
    CreateNoteResponse,
    GraphQLResponse,
    NoteMutationPayload,
    PublicationStatus,
    PublicationStatusesApiResponse,
    StoriesApiResponse,
    StoriesQueryParams,
    StoryDetailsApiResponse,
    StoryNode,
    StoryNotesApiResponse,
    StoryNote,
    StoryRow,
    UpdateNoteArgs,
    UpdateNoteResponse
} from './types.js';

const getPublicationStatus = (node: StoryNode): PublicationStatus => {
    if (!node.publication) {
        return 'NEW';
    }

    return node.publication.status;
};

const mapStoryToRow = (node: StoryNode): StoryRow => ({
    id: node.id,
    title: node.title,
    publicationStatus: getPublicationStatus(node)
});

const getResponseData = <T>({ data, errors }: GraphQLResponse<T>): T => {
    if (errors?.length) {
        throw new Error(errors.map(({ message }) => message).join(', '));
    }

    if (!data) {
        throw new Error('The GraphQL response did not contain data.');
    }

    return data;
};

const getAffectedId = (affectedId: string | null, errors: Array<{ message: string; }> | null): string => {
    if (errors?.length) {
        throw new Error(errors.map(({ message }) => message).join(', '));
    }

    if (!affectedId) {
        throw new Error('The mutation did not return an affected note.');
    }

    return affectedId;
};

const getMutationResult = <T, R extends NoteMutationPayload>(
    response: GraphQLResponse<T>,
    selectResult: (data: T) => R
): string => {
    const { affectedId, errors } = selectResult(getResponseData(response));

    return getAffectedId(affectedId, errors);
};

export const storiesApi = createApi({
    reducerPath: 'storiesApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/_api/content/v2' }),
    tagTypes: ['StoryNotes'],
    endpoints: (builder) => ({
        getStories: builder.query<StoryRow[], StoriesQueryParams>({
            query: ({ publicationFilter, phrase }) => ({
                url: '',
                method: 'POST',
                body: {
                    query: STORIES_QUERY,
                    variables: {
                        filter: publicationFilter ? { publicationStatus: { eq: publicationFilter } } : undefined,
                        phrase: phrase || undefined
                    }
                }
            }),
            transformResponse: (response: StoriesApiResponse) =>
                getResponseData(response).stories.edges.map((edge) => mapStoryToRow(edge.node))
        }),
        getPublicationStatuses: builder.query<PublicationStatus[], void>({
            query: () => ({
                url: '',
                method: 'POST',
                body: { query: PUBLICATION_STATUSES_QUERY }
            }),
            transformResponse: (response: PublicationStatusesApiResponse) =>
                getResponseData(response).__type?.enumValues.map(({ name }) => name) ?? []
        }),
        getStoryDetail: builder.query<StoryNode | null, string>({
            query: (id) => ({
                url: '',
                method: 'POST',
                body: {
                    query: STORY_DETAIL_QUERY,
                    variables: { id }
                }
            }),
            transformResponse: (response: StoryDetailsApiResponse) =>
                getResponseData(response).story
        }),
        getStoryNotes: builder.query<StoryNote[], string>({
            providesTags: (result, error, storyId) => {
                void result;
                void error;

                return [{ type: 'StoryNotes', id: storyId }];
            },
            query: (storyId) => ({
                url: '',
                method: 'POST',
                body: {
                    query: STORY_NOTES_QUERY,
                    variables: {
                        filter: {
                            target: { eq: storyId },
                            status: { notIn: ['DELETED'] }
                        }
                    }
                }
            }),
            transformResponse: (response: StoryNotesApiResponse): StoryNote[] =>
                getResponseData(response).notes.edges.map(({ node }) => node)
        }),
        createNote: builder.mutation<string, CreateNoteArgs>({
            query: ({ text, targetId, userId }) => ({
                url: '',
                method: 'POST',
                body: {
                    query: CREATE_NOTE_MUTATION,
                    variables: { input: { text, targetId }, userId }
                }
            }),
            invalidatesTags: (result, error, { targetId }) => {
                void result;
                void error;

                return [{ type: 'StoryNotes', id: targetId }];
            },
            transformResponse: (response: CreateNoteResponse): string => {
                return getMutationResult(response, ({ createNote }) => createNote);
            }
        }),
        updateNote: builder.mutation<string, UpdateNoteArgs>({
            query: ({ id, text, userId }) => ({
                url: '',
                method: 'POST',
                body: {
                    query: UPDATE_NOTE_MUTATION,
                    variables: { id, input: { text }, userId }
                }
            }),
            invalidatesTags: (result, error, { storyId }) => {
                void result;
                void error;

                return [{ type: 'StoryNotes', id: storyId }];
            },
            transformResponse: (response: UpdateNoteResponse): string => {
                return getMutationResult(response, ({ updateNote }) => updateNote);
            }
        }),
        deleteNote: builder.mutation<string, { id: string; userId: string; storyId: string; }>({
            query: ({ id, userId }) => ({
                url: '',
                method: 'POST',
                body: {
                    query: DELETE_NOTE_MUTATION,
                    variables: { id, input: { status: 'DELETED' }, userId }
                }
            }),
            invalidatesTags: (result, error, { storyId }) => {
                void result;
                void error;

                return [{ type: 'StoryNotes', id: storyId }];
            },
            transformResponse: (response: UpdateNoteResponse): string => {
                return getMutationResult(response, ({ updateNote }) => updateNote);
            }
        })
    })
});

export const {
    useGetStoriesQuery,
    useGetPublicationStatusesQuery,
    useGetStoryDetailQuery,
    useGetStoryNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation
} = storiesApi;
