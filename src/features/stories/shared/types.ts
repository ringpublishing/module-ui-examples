export interface Publication {
    status: PublicationStatus;
}

export type PublicationStatus = 'EMBARGOED' | 'NEW' | 'PUBLISHED' | 'SCHEDULED' | 'WITHDRAWN';

export interface StoryNode {
    id: string;
    title: string;
    publication: Publication | null;
    image: { url: string; } | null;
}

export interface StoryRow {
    id: string;
    title: string;
    publicationStatus: PublicationStatus;
}

export interface StoriesQueryParams {
    publicationFilter?: PublicationStatus;
    phrase: string;
}

export interface StoryNote {
    id: string;
    text: string;
    status: string;
    system: { creationTime: string; creator: { id: string; name: string; }; };
}

export interface GraphQLError {
    message: string;
}

export interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

export type StoriesApiResponse = GraphQLResponse<{
    stories: { edges: Array<{ node: StoryNode; }>; };
}>;

export type PublicationStatusesApiResponse = GraphQLResponse<{
    __type: { enumValues: Array<{ name: PublicationStatus; }>; } | null;
}>;

export type StoryDetailsApiResponse = GraphQLResponse<{
    story: StoryNode | null;
}>;

export type StoryNotesApiResponse = GraphQLResponse<{
    notes: { edges: Array<{ node: StoryNote; }>; };
}>;

export interface NoteMutationPayload {
    affectedId: string | null;
    errors: Array<{ message: string; }> | null;
}

export type CreateNoteResponse = GraphQLResponse<{ createNote: NoteMutationPayload; }>;
export type UpdateNoteResponse = GraphQLResponse<{ updateNote: NoteMutationPayload; }>;

type NoteMutationArgs = { id: string; userId: string; storyId: string; };
export type UpdateNoteArgs = NoteMutationArgs & { text: string; };
export type DeleteNoteArgs = NoteMutationArgs;
export type CreateNoteArgs = { text: string; targetId: string; userId: string; };
