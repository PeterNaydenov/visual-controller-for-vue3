# Migration Guide

Migration records for breaking changes in
`@peter.naydenov/visual-controller-for-vue3`. Each record covers one version
transition: what changed, step-by-step migration, and code comparisons.

---

## From version 2.x.x to 3.x.x

v3.0.0 is a breaking change. The `id`-based API (`document.getElementById(id)` and `<div id="app">` wrappers) is gone. v3 is region-based: invisible dim markers define regions, and an alias returned from `set` selects them.

### Summary

- **Region-based API.** `<div id="...">` placeholders replaced by `set(callback)` + alias.
- **`publish` arg order reshuffled.** Alias first, component second.
- **New methods:** `isEmpty`, `list`, `reset`.
- **Removed:** `containerID` parameter on `publish`/`destroy`/`has`/`getApp`.
- **No `dim` dependency at install time.** The controller doesn't pull in the official `@peter.naydenov/dim` package — instead, a slim inlined subset of dim lives in `src/dim.js`. Consumers don't install anything extra, and the bundle is smaller. The dim marker model is the same one used by the official package; if the upstream API changes, sync `src/dim.js` against the [reference implementation](https://github.com/PeterNaydenov/dim) (see the file header).

This guide walks through every v2 pattern and shows the v3 equivalent.

## TL;DR

```js
// v2
html.publish(MyComponent, { greeting: 'Hi' }, 'app')

// v3
html.set(({ start, end }) => {
    document.body.append(start, end)
    return 'app'
})
html.publish('app', MyComponent, { greeting: 'Hi' })
```

Three things changed in this single line:

1. A new `set(...)` call defines the region before any `publish`.
2. The containerID `'app'` is now an alias returned from `set` (`return 'app'`).
3. The `publish` argument order swapped: alias first, then component.


## 1. The shape change

| v2                                          | v3                                                  |
| ------------------------------------------- | --------------------------------------------------- |
| `publish(component, props, containerID)`    | `publish(alias, component, props)`                  |
| `destroy(containerID)`                      | `destroy(alias)`                                    |
| `has(containerID)`                          | `has(alias)`                                        |
| `getApp(containerID)`                       | `getApp(alias)`                                     |
| `<div id="app">` in your HTML               | `html.set((markers) => { ... return 'app' })`       |
| —                                            | `isEmpty(alias)` *(new)*                            |
| —                                            | `list()` *(new)*                                    |
| —                                            | `reset()` *(new)*                                   |
| —                                            | `extraParams` slot on `publish` *(new, reserved)*   |

Most method names are unchanged. Only `publish` had its argument order reshuffled.


## 2. Step-by-step migration

### Step 1 — Wrap each `<div id="...">` with a `set()` call

For every placeholder you had in your HTML:

```html
<!-- v2 -->
<div id="header"></div>
<div id="sidebar"></div>
```

Remove the `id` and replace it with a `set` call that places invisible markers in the same spot:

```js
// v3
html.set(({ start, end }) => {
    const headerEl = document.querySelector('header')
    headerEl.append(start, end)
    return 'header'
})

html.set(({ start, end }) => {
    const sidebarEl = document.querySelector('aside')
    sidebarEl.append(start, end)
    return 'sidebar'
})
```

You can place multiple regions in one parent — that's the whole point of v3:

```html
<main id="main">
  <!-- two regions, no wrappers -->
</main>
```

```js
html.set(({ start, end }) => { main.append(start, end); return 'header' })
html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
```


### Step 2 — Swap `publish` arg order

```js
// v2
html.publish(MyComponent, { greeting: 'Hi' }, 'header')

// v3
html.publish('header', MyComponent, { greeting: 'Hi' })
```

Destination first, content second. Easy to miss — search for every `publish(` call in your codebase and check the argument positions.


### Step 3 — Update `destroy` / `has` / `getApp` calls

Same names, just keyed by alias now. Most call sites need no change because they were already using string identifiers.

```js
html.destroy('header')
html.has('header')
html.getApp('header')
```

If you were passing the same string both as the DOM `id` and to these methods, you're done. If you were constructing the id dynamically (e.g. `template-${name}`), use the same expression for the alias.


### Step 4 — Nothing else changes inside components

```vue
<script setup>
import { inject } from 'vue'

const { eBus, setupUpdates } = inject('dependencies')

function changeMessage(msg) { /* ... */ }
setupUpdates({ changeMessage })
</script>
```

This block is identical between v2 and v3. `dependencies`, `setupUpdates`, and the component-side injection all work the same.


## 3. Common patterns

### Pattern A — One placeholder

```js
// v2
const html = new VisualController({ eBus })
html.publish(MyComponent, { greeting: 'Hi' }, 'app')
```

```js
// v3
const html = new VisualController({ eBus })

html.set(({ start, end }) => {
    document.body.append(start, end)
    return 'app'
})

html.publish('app', MyComponent, { greeting: 'Hi' })
```


### Pattern B — Multiple placeholders in one parent (now native)

```html
<!-- v2: required a unique id per placeholder -->
<div id="header"></div>
<div id="sidebar"></div>
```

```html
<!-- v3: both regions live inside <main>, no wrappers needed -->
<main id="main"></main>
```

```js
// v3 — same parent, no id collisions
html.set(({ start, end }) => { main.append(start, end); return 'header' })
html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
html.publish('header', HeaderApp)
html.publish('sidebar', SidebarApp)
```


### Pattern C — Swap the component in a placeholder

Identical behavior in v2 and v3: calling `publish` for the same alias/key again destroys the old app and mounts the new one.

```js
// v2
html.publish(HeaderApp, {}, 'header')
html.publish(SidebarApp, {}, 'header')   // replaces HeaderApp with SidebarApp

// v3
html.publish('header', HeaderApp)
html.publish('header', SidebarApp)        // replaces HeaderApp with SidebarApp
```


### Pattern D — SSR hydration

```js
// v2: render the component, drop the HTML in the container, then publish
const snippet = await renderToString(app)
node.innerHTML = snippet
html.publish(MyComponent, {}, 'header')   // detects non-empty → createSSRApp

// v3: render the component, drop the HTML between the markers, then publish
const snippet = await renderToString(app)
html.set(({ start, end }) => {
    document.body.append(start, end)
    return 'header'
})
// (insert snippet between the markers — see demo or README)
html.publish('header', MyComponent)
```

The auto-detection (empty range → `createApp`, non-empty → `createSSRApp`) is preserved.


### Pattern E — `isCustomElement`

Pass `isCustomElement` inside `data`, same as v2:

```js
// v2 and v3 — identical
html.publish('header', MyComponent, {
    isCustomElement: tag => tag.startsWith('amplify-')
})
```


### Pattern F — Destroy every app at once (new in v3)

```js
// v3 only — no v2 equivalent
html.destroy()                          // → count of apps destroyed across all aliases
html.destroy(['header', 'sidebar'])     // → count of those actually destroyed
```

v3 adds two new forms for `destroy`. With no argument it destroys every
published app across all aliases and returns the count. With an array of
alias strings it destroys each — missing aliases are silently skipped, the
rest are destroyed.

**What `destroy()` cleans:**

- Unmounts the Vue app.
- Removes the mount span from the DOM.
- Clears the cache entry (so `has(alias)` returns `false`).

**What `destroy()` does NOT touch:**

- The dim markers — they stay in the DOM.
- The alias registration — it stays in `list()` and can be re-published.
- The dim registry — no `set()` is required again.

Use `reset()` if you also want markers removed and the alias registration
cleared.


### Pattern G — External control via `setupUpdates`

```js
// v2
html.getApp('header').changeMessage('New value')

// v3 — same
html.getApp('header').changeMessage('New value')
```


## 4. What was removed (and isn't coming back)

- **`<div id="containerID">` wrappers** — replaced by markers placed via `set`.
- **`document.getElementById(containerID)`** — the controller no longer looks up mount points via DOM id. Selection is by alias.
- **The `containerID` parameter** on `publish`/`destroy`/`has`/`getApp`.

If your v2 code constructed IDs dynamically (e.g. to mount many similar apps), the v3 equivalent is to call `set` once per alias and publish by alias. No DOM-lookup mechanism is exposed.


## 5. New in v3 — methods that have no v2 equivalent

These are additions, not replacements. Existing v2 code that doesn't use them doesn't need changes.

### `isEmpty(alias)`

Returns `true` if the region has no content between its markers or the markers are orphaned. Returns `undefined` for an unknown alias.

```js
if (html.isEmpty('header')) await html.publish('header', App)
```

### `list()`

Returns every alias registered via `set`, regardless of publish state.

```js
html.list()   // → ['header', 'sidebar', 'footer']
```

### `reset()`

Unmounts every published app, clears internal state, calls `dim.reset()`. Every marker is also removed from the DOM (the inlined `dim.reset()` calls each range's `destroy()`). Use this when you want to fully tear down all regions; if you want to keep the markers for republishing, use `destroy(alias)` instead.

```js
html.reset()   // tear everything down (useful for SPA route changes)
```

### `extraParams` slot

Reserved fourth argument to `publish`. Currently accepted and ignored — added so we can extend behavior without breaking call sites.

```js
html.publish('header', MyComponent, props, { /* future options */ })
```


## 6. Checklist

- [ ] Find every `<div id="...">` placeholder in your HTML.
- [ ] Replace each with a `set((markers) => { ... return alias })` call.
- [ ] Find every `publish(` call. Swap argument order: `publish(component, data, id)` → `publish(id, component, data)`.
- [ ] Verify `destroy`/`has`/`getApp` arguments are still strings (they are — just aliases now).
- [ ] Remove any DOM-id bookkeeping — no more looking up elements yourself.
- [ ] Optional: leverage the new `isEmpty`/`list`/`reset` for cleaner SPA-style flows.
- [ ] Run your tests. The Vue component code itself should not need changes.


## 7. Why we broke compatibility

v2's `<div id="...">` model forces a one-to-one mapping between DOM elements and apps. Multi-app layouts need unique ids per app, and you can't put two apps in the same `<section>` without `<div>` wrappers cluttering the DOM. v3 regions (invisible markers) solve both: define many regions anywhere in the DOM, and switch apps in a region without touching the surrounding markup.
