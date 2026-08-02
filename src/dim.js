"use strict"
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
function dim () {
    /** @type {Object.<string, any>} */
    const ranges = {}          // numeric indexes
    /** @type {Object.<string, any>} */
    const aliasMap = {}        // user-named aliases


    /**
     *  Register a new range. The callback receives `{ start, end }` text-node
     *  markers and must attach both to the DOM. Whatever string the callback
     *  returns becomes the alias for `get` / `aliases`.
     *  @param {(markers: { start: Text, end: Text }, ...args: any[]) => string | void} fn
     *  @param {...*} args
     *  @returns {void}
     */
    function set ( fn, ...args ) {
                const start = document.createTextNode ( '' )
                const end   = document.createTextNode ( '' )
                const name  = fn ( { start, end }, ...args )
                if ( !start.parentNode || !end.parentNode ) {
                    throw new Error ( 'dim.set: callback must attach both "start" and "end" markers to the DOM' )
                }
                const range = document.createRange ()
                range.setStartAfter ( start )
                range.setEndBefore ( end )
                const api = {
                    isEmpty () {
                                if ( !start.isConnected || !end.isConnected )   return true
                                range.setStartAfter ( start )
                                range.setEndBefore  ( end )
                                return range.collapsed
                            },
                    getContext () {
                                return ( start.isConnected && end.isConnected )
                                        ? range.commonAncestorContainer
                                        : null
                            },
                    destroy () {
                                if ( start.isConnected )   start.parentNode.removeChild ( start )
                                if ( end.isConnected )     end.parentNode.removeChild ( end )
                            }
                }
                if ( name )   aliasMap[name] = api
                ranges[Object.keys(ranges).length] = api
        }


    /**
     *  Look up ranges by alias, numeric index, comma-separated string, or array.
     *  Returns `undefined` for any non-string non-array argument.
     *  @param {string | number | (string | number)[]} name
     *  @returns {any | any[] | undefined}
     */
    function get ( name ) {
                if ( typeof name !== 'string' && !Array.isArray ( name ) )   return undefined
                if ( typeof name === 'string' && name.includes ( ',' ) )   name = name.split ( ',' ).map ( s => s.trim() )
                return Array.isArray ( name )
                        ? name.map ( n => aliasMap[n] || ranges[n] )
                        : ( aliasMap[name] || ranges[name] )
        }


    /**
     *  Removes every range and alias. Each range's markers are detached from
     *  the DOM (if still attached). Mirrors dim 1.0's behavior.
     *  @returns {void}
     */
    function reset () {
                const seen = new Set ()
                for ( const r of Object.values ( ranges ) )   seen.add ( r )
                for ( const r of Object.values ( aliasMap ) ) seen.add ( r )
                for ( const r of seen )                       r.destroy ()
                for ( const k of Object.keys ( ranges ) )     delete ranges[k]
                for ( const k of Object.keys ( aliasMap ) )   delete aliasMap[k]
        }


    /**
     *  Returns user-named aliases in registration order. Numeric indexes are
     *  excluded.
     *  @returns {string[]}
     */
    function aliases () {
                return Object.keys ( aliasMap )
        }


    return { set, get, reset, aliases }
}


export default dim
