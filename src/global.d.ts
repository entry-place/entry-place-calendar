// Next's fetch extensions (`next: { revalidate }`) used by the server-side
// fetchers; the host app gets this from its own next-env.d.ts.
/// <reference types="next" />

// Static image imports (src/assets/*.png). The package ships its own icons
// and imports them through the bundler rather than expecting the host to
// serve them from public/, so it has no undeclared asset requirements.
/// <reference types="next/image-types/global" />
