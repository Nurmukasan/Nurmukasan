// Separate config so probe tests never run as part of `npm test`.
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['docs/practice-10/probes/**/*.probe.ts'] } });
