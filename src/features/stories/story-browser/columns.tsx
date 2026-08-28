import { Chip, type ChipProps } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid-pro';
import type { ReactElement } from 'react';
import type { PublicationStatus, StoryRow } from '../shared/types.js';

const getPublicationStatusColor = (status: PublicationStatus): ChipProps['color'] => {
    switch (status) {
        case 'PUBLISHED':
            return 'success';
        case 'EMBARGOED':
            return 'error';
        case 'SCHEDULED':
            return 'warning';
        case 'NEW':
            return 'info';
        case 'WITHDRAWN':
            return 'default';
    }
};

const renderPublicationStatus = (status: PublicationStatus): ReactElement => (
    <Chip
        label={status}
        color={getPublicationStatusColor(status)}
        size="small"
    />
);

export const COLUMNS: GridColDef<StoryRow>[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200, filterable: false, sortable: false },
    {
        field: 'publicationStatus',
        headerName: 'Publication status',
        flex: 1,
        minWidth: 200,
        filterable: false,
        sortable: false,
        renderCell: (params): ReactElement => renderPublicationStatus(params.value)
    }
];
