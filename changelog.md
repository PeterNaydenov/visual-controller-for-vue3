## Release History



### 3.0.0 (2026-08-01)
- [x] **Breaking change.** v3 is region-only. The `id`-based API (`publish(component, data, containerID)` etc.) is removed. Regions are defined via the new `set` method, which mirrors `dim.set` exactly.
- [x] New API: `set`, `publish(alias, component, data?, extraParams?)`, `destroy`, `has`, `getApp`, `isEmpty`, `list`, `reset`.
- [x] `destroy()` is now polymorphic — accepts no argument (destroys every published app across all aliases, returns the count), an alias string (existing behavior), or an array of alias strings (destroys each, silently skips missing ones, returns the count). Markers stay in the DOM in every form.
- [x] Multiple placeholders can coexist inside a single parent without DOM `id` collisions — selection is by alias returned from the `set` callback.
- [x] Destroying an app empties the region but keeps the markers, so the same alias can host a different app later.
- [x] Mount container is a bare `<span style="display:contents">` — invisible to layout, no DOM wrapper authored by the user.
- [x] Added `peerDependencies.vue: ^3.0.0` to `package.json`.
- [x] **`@peter.naydenov/dim` dependency removed.** The minimal subset of dim the controller actually uses (`set` / `get` / `reset` / `aliases` on the dim instance, plus `isEmpty` on the range API) is now inlined as `src/dim.js`. The file header documents the relationship to the official `@peter.naydenov/dim` package and points at the source of truth for syncing if the upstream API changes.
- [x] SSR hydration preserved: when the range already contains content at publish time, the controller picks it as the mount target (single element → direct mount, multiple siblings → wrapped in a mount span) and uses `createSSRApp`. Vue hydrates the existing DOM in place.
- [x] `isEmpty(alias)` delegates to dim's `range.isEmpty()` — returns `true` for collapsed or orphaned ranges, `undefined` for unknown aliases.
- [x] `isCustomElement` behavior preserved verbatim from v2 (still inside `data`, same `tag => isCustomElement` wrap).
- [x] `extraParams` slot accepted but ignored — reserved for future use.



### 2.3.3 (2026-07-29)
- [x] Dev dependencies update. Remove the @vue/test-utils;



### 2.3.2 (2026-07-22)
- [x] Dependencies update. Ask-for-Promise - v.3.2.0;
- [x] Dev dependencies update. @peter.naydenov/notice - v.2.5.0;
- [x] Dev dependencies update. TypeScript - v.7.0.2;



### 2.3.1 (2026-04-23)
- [x] Dependencies update. Ask-for-Promise - v.3.2.1;



### 2.3.0 (2026-04-14)
- [x] Demo assets are moved from /src to /demo folder;
- [x] Removing 'cypress' folder from repo;
- [x] Build script make also typescript types;
- [x] Moving from rollup to vite(internal rolldown);



### 2.2.1 (2026-04-13)
- [x] Extend types;



### 2.2.0 (2026-04-12)
- [x] Convert from 'class' to 'functional' approach;
- [x] Adding 'jsdoc' description to the library;
- [x] Updated Vue config to use compilerOptions.isCustomElement (non-deprecated API in Vue 3.3+);
- [x] Fix: npm run dev;
- [x] Add test coverage;



### 2.1.7 (2025-10-30)
- [x] Dependencies update. Ask for Promise - v.3.1.0;



### 2.1.6 (2025-07-18)
- [x] Vue was moved to devDependencies. Update to v.3.5.18



### 2.1.5 (2025-07-18)
- [x] Dependencies update. Vue - v.3.5.17;



### 2.1.4 ( 2024-12-20)
- [x] Dependencies update. Ask for Promise - v.3.0.1;



### 2.1.1 ( 2024-06-06)
- [x] Dependencies update. Vue - v.3.4.27;
- [x] Dev dependencies update. Vite - v.5.2.12, Cypress - v.13.11.0, Rollup - v.4.18.0;



### 2.1.0 ( 2024-03-13)
- [x]  Folder 'dist' was added to the project. Includes commonjs, umd and esm versions of the library;
- [x] Package.json: "exports" section was added. Allows you to use package as commonjs or es6 module without additional configuration;
- [x] Rollup was added to the project. Used to build the library versions;



### 2.0.4 ( 2023-11-10)
- [x] Dependencies update. Vue - v.3.3.8;
- [x] Dev. dependencies update. Vite - v.4.5.0;
- [x] Dev. dependencies update. Cypress - v.13.5.0;
- [x] Dev. dependencies update. @vitejs/plugin-vue - 4.4.1;


### 2.0.3 ( 2023-11-06)
- [x] Dependencies update. Vue - v.3.3.7
- [x] Dependencies update. ask-for-promise - v.1.5.0



### 2.0.2 ( 2023-10-22)
- [x] Dependencies update. Vue - v.3.3.6



### 2.0.1 (2023-10-21)
- [x] Dependencies update. ask-for-css - v.1.4.0



### 2.0.0 ( 2022-11-21)
- [x] Full rewrite of the library;
- [x] Method 'has' was added;
- [x] Support for SSR hydration;



### 1.1.1 ( 2021-04-25)
 - [x] Support for Autonomous Custom Elements



### 1.0.2 (2021-03-15)
 - [x] Fix: Only one load per component;