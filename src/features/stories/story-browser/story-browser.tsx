import type { GridEventListener } from '@mui/x-data-grid-pro';
import { DataView, RingDataGrid } from '@ringpublishing/mui-components';
import { type ReactElement, useState } from 'react';
import { useGetPublicationStatusesQuery, useGetStoriesQuery } from '../shared/stories-api.js';
import type { PublicationStatus } from '../shared/types.js';
import { COLUMNS } from './columns.js';
import StoryDetail from './components/story-detail.js';
import StoryFilters from './components/story-filters.js';

const StoryBrowser = (): ReactElement => {
    const [publicationFilter, setPublicationFilter] = useState<PublicationStatus | ''>('');
    const [phrase, setPhrase] = useState('');
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const { data: rows = [], isFetching, isError, refetch } = useGetStoriesQuery({
        publicationFilter: publicationFilter || undefined,
        phrase
    });
    const { data: publicationStatuses = [] } = useGetPublicationStatusesQuery();

    const handleRowClick: GridEventListener<'rowClick'> = (params): void => {
        setSelectedStoryId(params.row.id);
        setDetailOpen(true);
    };

    return (
        <DataView
            sx={{ height: '100vh' }}
            slots={{
                left: (
                    <StoryFilters
                        publicationFilter={publicationFilter}
                        publicationStatuses={publicationStatuses}
                        onPublicationFilterChange={setPublicationFilter}
                        onClear={(): void => setPublicationFilter('')}
                    />
                ),
                main: (
                    <RingDataGrid
                        error={isError}
                        columns={COLUMNS}
                        rows={rows}
                        totalRowCount={rows.length}
                        loading={isFetching}
                        showRingToolbar={true}
                        autoRefresh={false}
                        refreshItems={refetch}
                        labels={{
                            refresh: 'Refresh',
                            results: 'Results',
                            enableAutoRefresh: 'Enable auto refresh',
                            disableAutoRefresh: 'Disable auto refresh'
                        }}
                        onRowClick={handleRowClick}
                        disableMultipleRowSelection={true}
                    />
                ),
                right: (
                    <StoryDetail
                        storyId={selectedStoryId}
                        onClose={(): void => setDetailOpen(false)}
                    />
                )
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (query: string): void => setPhrase(query),
                    openSlotsOnMobileLabels: {
                        leftSlot: 'Filters',
                        rightSlot: 'Detail'
                    }
                }
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
            leftSlotOpen={true}
        />
    );
};

export default StoryBrowser;
