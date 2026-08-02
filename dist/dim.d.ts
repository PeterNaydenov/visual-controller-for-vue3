/**
 *  Minimal inlined subset of `@peter.naydenov/dim` v1.0 API.
 *
 *  The visual controller for Vue 3 only needs four operations from dim:
 *  `set` (register a region), `get` (look up a range by alias), `aliases`
 *  (list registered aliases), and `reset` (clear all). It also needs the
 *  range's `isEmpty()` for the `isEmpty(alias)` pass-through.
 *
 *  Everything else dim provides — `update`, `delete`, `prepend`, `append`,
 *  `back`, `clearCache`, `select`, `extract`, `isOrphan`, `toString`,
 *  `getContext`, `has`, `list` — is not used here. Keeping this file
 *  separate from `src/main.js` makes the subset explicit and easy to keep
 *  in sync with the official package if its shape changes.
 *
 *  Source of truth: https://github.com/PeterNaydenov/dim
 *  When updating this file, diff against the reference implementation
 *  (`node_modules/@peter.naydenov/dim/dist/dim.js` after a fresh install)
 *  and keep the API surface of the methods below identical to dim's.
 *
 *  @packageDocumentation
 */
/**
 *  Creates a dim instance with the minimal API surface used by the
 *  visual controller. See the package documentation at the top of this
 *  file for the relationship to the official `@peter.naydenov/dim` library.
 *  @returns {{ set: Function, get: Function, reset: Function, aliases: Function }}
 */
declare function dim(): {
    set: Function;
    get: Function;
    reset: Function;
    aliases: Function;
};
export default dim;
