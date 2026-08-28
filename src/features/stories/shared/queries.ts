export const STORIES_QUERY = `
    query GetStories($filter: StoryFilterInput, $phrase: String) {
        # Example module: pagination is intentionally omitted for presentation purposes.
        stories(
            filter: $filter
            sortBy: [{ field: CREATION_TIME, order: DESC }]
            first: 20
            phrase: $phrase
        ) {
            edges {
                node {
                    id
                    title
                    image { url }
                    publication { status }
                }
            }
        }
    }
`;

export const PUBLICATION_STATUSES_QUERY = `
    query GetPublicationStatuses {
        __type(name: "PublicationStatusEnum") {
            enumValues {
                name
            }
        }
    }
`;

export const STORY_DETAIL_QUERY = `
    query GetStoryDetail($id: UUID!) {
        story(id: $id) {
            id
            title
            image { url }
            publication { status }
        }
    }
`;

export const STORY_NOTES_QUERY = `
    query GetStoryNotes($filter: NoteFilterInput) {
        # Example module: pagination is intentionally omitted for presentation purposes.
        notes(filter: $filter, first: 100) {
            edges {
                node {
                    id
                    text
                    status
                    system {
                        creationTime
                        creator { id name }
                    }
                }
            }
        }
    }
`;

export const CREATE_NOTE_MUTATION = `
    mutation CreateNote($input: CreateNoteInput!, $userId: UUID!) {
        createNote(input: $input, userId: $userId) {
            affectedId
            errors { message }
        }
    }
`;

export const UPDATE_NOTE_MUTATION = `
    mutation UpdateNote($id: UUID!, $input: UpdateNoteInput!, $userId: UUID!) {
        updateNote(id: $id, input: $input, userId: $userId) {
            affectedId
            errors { message }
        }
    }
`;

export const DELETE_NOTE_MUTATION = `
    mutation DeleteNote($id: UUID!, $input: UpdateNoteInput!, $userId: UUID!) {
        updateNote(id: $id, input: $input, userId: $userId) {
            affectedId
            errors { message }
        }
    }
`;
