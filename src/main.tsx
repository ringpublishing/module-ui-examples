import { PaletteMode, useMediaQuery } from '@mui/material';
import { LicenseInfo } from '@mui/x-license';
import { ThemeConfig } from '@ringpublishing/mui-components';
import { type ReactElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.js';
import { ErrorBoundary } from './components/error-boundary.js';
import { store } from './store.js';

LicenseInfo.setLicenseKey(RingSDK.api.config.getComponentsLicenseKey());

const App = (): ReactElement => {
    const prefersDarkMode: boolean = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode: PaletteMode = prefersDarkMode ? 'dark' : 'light';

    return (
        <ThemeConfig mode={themeMode}>
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </ThemeConfig>
    );
};

const root = document.getElementById('root');

if (!root) {
    throw new Error('Root element not found');
}

createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>
);
