#!/usr/bin/env bun

import { $ } from "bun";
import { rm } from "fs/promises";

// Clean dist
await rm("dist", { recursive: true, force: true });

// Build CJS
await $`bun build ./src/index.ts --outdir ./dist --target node --format cjs --sourcemap`;
await $`mv dist/index.js dist/index.cjs`;
await $`mv dist/index.js.map dist/index.cjs.map`;

// Build ESM
await $`bun build ./src/index.ts --outdir ./dist --target node --format esm --sourcemap`;
await $`mv dist/index.js dist/index.mjs`;
await $`mv dist/index.js.map dist/index.mjs.map`;

// Rename CJS back to index.js (for require)
await $`mv dist/index.cjs dist/index.js`;
await $`mv dist/index.cjs.map dist/index.js.map`;

// Generate type declarations
await $`tsc --project tsconfig.build.json`;

console.log("✓ Build complete!");
