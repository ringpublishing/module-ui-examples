import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePlugin as accDevTunnel } from '@ringpublishing/accelerator-dev-tunnel/vite';

// Local development goes through a Ring Accelerator dev tunnel: the dev server is
// registered as the upstream of a development variant of the module's vhost, so the
// module runs inside Ring Publishing with RingSDK injected and `/_api` resolving.
// See README.md (Running locally) and .agents/skills/ring-module-local-development. The
// three ACC_DEV_TUNNEL_* variables come from `.env.local` (gitignored) or the shell; without
// them Vite starts as a plain dev server.
export default defineConfig(({ mode }) => {
    const {
        ACC_DEV_TUNNEL_TOKEN: token,
        ACC_DEV_TUNNEL_VHOST: vhost,
        ACC_DEV_TUNNEL_VARIANT: variant
    } = loadEnv(mode, process.cwd(), 'ACC_DEV_TUNNEL_');
    const tunnelConfigured = Boolean(token && vhost && variant);

    return {
        plugins: [
            react(),
            // The plugin also adds the vhost to `server.allowedHosts`; Vite would otherwise
            // answer every tunnelled request (addressed to the vhost) with 403 Blocked request.
            ...(tunnelConfigured ? [accDevTunnel({ token, vhost, variant })] : [])
        ]
    };
});
