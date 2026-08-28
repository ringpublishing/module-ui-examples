import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { Accordion, FiltersWrapper } from '@ringpublishing/mui-components';
import type { ReactElement } from 'react';
import type { PublicationStatus } from '../../shared/types.js';

interface StoryFiltersProps {
    publicationFilter: PublicationStatus | '';
    publicationStatuses: PublicationStatus[];
    onPublicationFilterChange: (value: PublicationStatus | '') => void;
    onClear: () => void;
}

const StoryFilters = ({
    publicationFilter,
    publicationStatuses,
    onPublicationFilterChange,
    onClear
}: StoryFiltersProps): ReactElement => {
    const handleChange = (event: SelectChangeEvent<PublicationStatus | ''>): void => {
        onPublicationFilterChange(event.target.value);
    };

    return (
        <FiltersWrapper
            label="Filters"
            withClearButton={true}
            clearButtonLabel="Clear"
            onClear={onClear}
        >
            <Accordion label="Publication status" defaultExpanded={true}>
                <Select
                    fullWidth={true}
                    value={publicationFilter}
                    onChange={handleChange}
                    size="small"
                    displayEmpty={true}
                >
                    <MenuItem value="">All statuses</MenuItem>
                    {publicationStatuses.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                </Select>
            </Accordion>
        </FiltersWrapper>
    );
};

export default StoryFilters;
