"use strict"
/**
 *  Visual Controller for Vue 3 — v3.0.0
 *  A thin lifecycle bridge between the inlined dim subset (see `./dim.js`)
 *  and Vue 3. Define regions with invisible markers via `set`, then mount
 *  Vue apps into those regions via `publish`. `destroy` empties a region
 *  without removing the markers, so the same alias can host a different
 *  app later.
 *
 *  @packageDocumentation
 */

import askForPromise from 'ask-for-promise'
import dim from './dim.js'
import { createApp, createSSRApp } from 'vue'


/**
 *  Callback that places dim markers into the DOM.
 *  @callback SetCallback
 *  @param {{ start: Text, end: Text }} markers - invisible text nodes; must be attached to the DOM
 *  @param {...*} args - extra args forwarded by `set`
 *  @returns {string | void} - return a string to register an alias
 */

/**
 *  Object passed to `setupUpdates` from inside a published component.
 *  @typedef {Object} SetupUpdates
 */

/**
 *  Controller instance returned by `VisualController`.
 *  @typedef {Object} VisualControllerInstance
 *  @property {SetCallback & ((fn: SetCallback, ...args: any[]) => void)} set
 *  @property {(alias: string, component: any, data?: object, extraParams?: object) => Promise<SetupUpdates | false>} publish
 *  @property {(target?: string | string[]) => boolean | number} destroy
 *  @property {(alias: string) => boolean} has
 *  @property {(alias: string) => SetupUpdates | false} getApp
 *  @property {(alias: string) => boolean | undefined} isEmpty
 *  @property {() => string[]} list
 *  @property {() => void} reset
 */


/**
 *  @function VisualController - Visual Controller for Vue 3
 *  @param {Object} [dependencies={}] - Optional external dependencies to inject into Vue apps
 *  @returns {VisualControllerInstance} Controller instance
 */
function VisualController ( dependencies = {} ) {
    /** @type {Object.<string, { app: any, mountSpan: HTMLElement, setupUpdates: SetupUpdates }>} */
    const cache = {}
    /** @type {Object.<string, { start: Text, end: Text }>} */
    const markersMap = {}
    /** @type {ReturnType<typeof dim>} */
    const d = dim()
    const deps = { ...dependencies, createApp }


    /**
     *  Define a region by placing dim markers in the DOM. Mirrors dim.set
     *  verbatim — the callback receives { start, end } text-node markers and
     *  must attach both to the DOM. The string the callback returns becomes
     *  the alias used by publish/destroy/has/getApp/list.
     *  @param {SetCallback} fn
     *  @param {...*} args
     *  @returns {void}
     */
    function set ( fn, ...args ) {
                let capturedAlias = null
                let capturedMarkers = null
                d.set ( ( markers, ...rest ) => {
                            capturedMarkers = markers
                            const ret = fn ( markers, ...rest )
                            if ( typeof ret === 'string' )   capturedAlias = ret
                            return ret
                        }, ...args )
                if ( capturedAlias )   markersMap[capturedAlias] = capturedMarkers
        }


    /**
     *  Publish a Vue app into a region. Mounts into a <span style="display:contents">
     *  inserted directly between the markers. If the range already has content,
     *  it's used as the SSR mount target and `createSSRApp` is used for hydration.
     *  @param {string} alias
     *  @param {any} component
     *  @param {Object} [data={}]
     *  @param {Object} [extraParams={}] - reserved for future use
     *  @returns {Promise<SetupUpdates | false>}
     */
    function publish ( alias, component, data = {}, extraParams = {} ) {
                const endTask = askForPromise ()
                void extraParams

                if ( !component ) {
                        console.error ( `Error: Component is undefined` )
                        endTask.done ( false )
                        return endTask.promise
                }
                if ( !alias || typeof alias !== 'string' ) {
                        console.error ( `Error: Alias is missing or invalid` )
                        endTask.done ( false )
                        return endTask.promise
                }

                const markers = markersMap[alias]
                if ( !markers || !markers.start.isConnected || !markers.end.isConnected ) {
                        console.error ( `Error: Region "${alias}" was not defined or its markers are orphaned. Call html.set(...) first.` )
                        endTask.done ( false )
                        return endTask.promise
                }

                if ( cache[alias] )   destroy ( alias )

                const { isCustomElement } = data

                // Inspect existing range content to decide SSR vs fresh mount
                const between = []
                let n = markers.start.nextSibling
                while ( n && n !== markers.end ) { between.push ( n ); n = n.nextSibling }

                /** @type {HTMLElement} */
                let mountTarget
                let useSSR = false

                if ( between.length === 0 ) {
                        // Empty range → fresh mount
                        mountTarget = document.createElement ( 'span' )
                        mountTarget.style.display = 'contents'
                        markers.end.parentNode.insertBefore ( mountTarget, markers.end )
                        useSSR = false
                    }
                else if ( between.length === 1 && between[0].nodeType === 1 ) {
                        // Single element → mount directly, hydrate in place
                        mountTarget = /** @type {HTMLElement} */ (between[0])
                        useSSR = true
                    }
                else {
                        // Multiple siblings (fragment template) → wrap, hydrate wrapper
                        const wrapper = document.createElement ( 'span' )
                        wrapper.style.display = 'contents'
                        markers.end.parentNode.insertBefore ( wrapper, markers.end )
                        between.forEach ( node => wrapper.appendChild ( node ) )
                        mountTarget = wrapper
                        useSSR = true
                    }

                const app = useSSR
                        ? createSSRApp ( component, data )
                        : createApp ( component, data )

                /** @type {{ app: any, mountSpan: HTMLElement, setupUpdates: SetupUpdates }} */
                const entry = { app, mountSpan: mountTarget, setupUpdates: {} }
                cache[alias] = entry

                /** @type {(lib: SetupUpdates) => void} */
                const setupUpdates = lib => { entry.setupUpdates = lib }
                app.provide ( 'dependencies', { ...deps, setupUpdates } )

                if ( isCustomElement ) {
                        app.config.compilerOptions = app.config.compilerOptions || {}
                        app.config.compilerOptions.isCustomElement = tag => isCustomElement
                }

                app.mount ( mountTarget )

                endTask.done ( entry.setupUpdates )
                return endTask.promise
        }


    /**
     *  Destroy the app published in a region. Empties the range but leaves
     *  the markers in place so the alias can be published again.
     *
     *  Three forms:
     *  - `destroy(alias)` — single alias string. Returns `true` on success,
     *    `false` if the alias has no published app.
     *  - `destroy()` — no args. Destroys every published app across all
     *    aliases. Returns the count of apps destroyed.
     *  - `destroy(aliases)` — array of alias strings. Destroys each; missing
     *    aliases are silently skipped. Returns the count of apps destroyed.
     *
     *  In every form, markers stay in the DOM. For a full cleanup that
     *  also removes markers, use `reset()` instead.
     *  @param {string | string[]} [target]
     *  @returns {boolean | number}
     */
    function destroy ( target ) {
                if ( target === undefined ) {
                        let count = 0
                        for ( const a of Object.keys ( cache ) ) {
                            destroy ( a )
                            count++
                        }
                        return count
                    }
                if ( Array.isArray ( target ) ) {
                        let count = 0
                        for ( const a of target ) {
                            if ( typeof a === 'string' && cache[a] ) {
                                destroy ( a )
                                count++
                            }
                        }
                        return count
                    }
                if ( typeof target !== 'string' ) {
                        console.error ( `Error: destroy() expects a string alias or an array of strings` )
                        return false
                    }
                const entry = cache[target]
                if ( !entry )   return false
                entry.app.unmount ()
                if ( entry.mountSpan.parentNode ) {
                        entry.mountSpan.parentNode.removeChild ( entry.mountSpan )
                    }
                delete cache[target]
                return true
        }


    /**
     *  Is an app currently published in this region?
     *  @param {string} alias
     *  @returns {boolean}
     */
    function has ( alias ) {
                return Boolean ( cache[alias] )
        }


    /**
     *  Returns the setupUpdates interface for a published app.
     *  @param {string} alias
     *  @returns {SetupUpdates | false}
     */
    function getApp ( alias ) {
                const entry = cache[alias]
                if ( !entry ) {
                        console.error ( `App with alias: "${alias}" was not found.` )
                        return false
                }
                return entry.setupUpdates
        }


    /**
     *  Returns every alias registered via set, regardless of publish state.
     *  Delegates to dim's `aliases()`, which returns user-named aliases in
     *  registration order (numeric indexes excluded).
     *  @returns {string[]}
     */
    function list () {
                return d.aliases ()
        }


    /**
     *  Is the region empty (no content between its markers)?
     *  Delegates to dim's range.isEmpty(): returns `true` if the range is
     *  collapsed OR if the markers are orphaned.
     *  @param {string} alias
     *  @returns {boolean | undefined} - true/false for known aliases, undefined for unknown
     */
    function isEmpty ( alias ) {
                if ( !alias || typeof alias !== 'string' ) {
                        console.error ( `Error: Alias is missing or invalid` )
                        return undefined
                }
                const range = d.get ( alias )
                if ( !range ) {
                        console.error ( `Region "${alias}" was not defined. Call html.set(...) first.` )
                        return undefined
                }
                return range.isEmpty ()
        }


    /**
     *  Unmount every published app, clear internal state, call dim.reset().
     *  In dim 1.0+ this also removes every marker from the DOM (dim's reset
     *  iterates and calls each range's destroy()).
     *  @returns {void}
     */
    function reset () {
                for ( const alias of Object.keys ( cache ) )   destroy ( alias )
                for ( const alias of Object.keys ( markersMap ) )   delete markersMap[alias]
                d.reset ()
        }


    return {
              set
            , publish
            , destroy
            , has
            , getApp
            , isEmpty
            , list
            , reset
        }
} // visualController



export default VisualController
