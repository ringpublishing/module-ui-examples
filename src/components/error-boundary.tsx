import { Refresh } from '@mui/icons-material';
import { Placeholder, PlaceholderVariant } from '@ringpublishing/mui-components';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    public render(): ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <Placeholder
                variant={PlaceholderVariant.ERROR}
                labels={{
                    header: 'Something went wrong',
                    description: 'An unexpected error occurred. Please try refreshing the page.',
                    footer: `Error details: ${this.state.error?.message ?? 'Unknown error'}`
                }}
                buttons={[
                    {
                        children: (
                            <>
                                <Refresh sx={{ mr: 1 }} />
                                Refresh
                            </>
                        ),
                        color: 'primary',
                        variant: 'contained',
                        onClick: (): void => window.location.reload()
                    }
                ]}
            />
        );
    }
}
