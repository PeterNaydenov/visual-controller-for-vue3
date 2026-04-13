"use strict"
/**
 *  Visual Controller for Vue 3
 *  Control multiple vue3 apps with a single controller.
 */

import askForPromise from 'ask-for-promise'
import { createApp, createSSRApp } from 'vue'


/**
 *  @function VisualController - Visual Controller for Vue 3
 *  @param {Object} [dependencies={}] - Optional external dependencies to inject into Vue apps
 *  @returns {Object} Controller instance with publish, destroy, getApp, and has methods
 */
function VisualController ( dependencies = {} ) {
    /** @type {Object.<string, any>} */
    const cache = {}  // collect vue-component update interfaces
    
    
    dependencies = { ...dependencies, createApp, createSSRApp }



    /**
     * Publish vue app in a container element.
     * @param {Object} component - Vue component to render
     * @param {Object} [data={}] - Configuration data
     * @param {boolean} [data.isCustomElement] - Whether to treat all tags as custom elements
     * @param {string} id - DOM element id where the app will be mounted
     * @returns {Promise<Object>} Promise resolving to an object with update interface methods (e.g., changeMessage)
     */
    function publish ( component, data={}, id ) {
                    
                    const 
                          hasKey = typeof id === 'string' 
                        , { isCustomElement } = data
                        , endTask = askForPromise ()
                        ;
                    
                    if ( !component ) {
                            console.error ( `Error: Component is undefined` )
                            endTask.done (false)
                            return endTask.promise
                    }
                    if ( hasKey )   destroy ( id )

                    let 
                          node = document.getElementById ( id )
                        , app 
                        ;
                    
                    /** @type {function(any):void} */
                    const setupUpdates = lib => { cache[id] = lib }
                    if ( !node ) {  
                                console.error ( `Can't find node with id: "${id}"`)
                                endTask.done ( false )
                                return endTask.promise
                        }
                        
                    if ( node.innerHTML.trim () === '' ) {   // Empty container -> create new app
                                app = createApp ( component, data )
                        }
                    else {   // Not empty container -> hydrate SSR app
                                app = createSSRApp ( component, data )
                        }

                    cache[id] = {}
                    app.provide ( 'dependencies', {...dependencies, setupUpdates})

                    if ( isCustomElement ) {
                            app.config.compilerOptions = app.config.compilerOptions || {}
                            app.config.compilerOptions.isCustomElement = tag => isCustomElement
                        }
                    app.mount (`#${id}`)
                    endTask.done ( cache[id] )
                    return endTask.promise
        } // publish func.



    /**
     * Destroy a published app by container id.
     * @param {string} id - Container id
     * @returns {boolean} True if app was destroyed, false otherwise.
     */
    function destroy  ( id ) {
                    if ( cache[id] ) {                    
                            /** @type {any} */
                            const node = document.getElementById ( id )
                            if ( !node )    return false
                            const unmount = node.__vue_app__.unmount
                            unmount ()
                            node.removeAttribute ( 'data-v-app' )
                            delete cache[id]
                            return true
                        }
                    else    return false
            } // destroy func.


            
    /**
     * Returns the update interface for a published app.
     * @param {string} id - Container id
     * @returns {Object|false} Update interface object if published, false otherwise
     */
    function getApp (id) {
                const item = cache[id];
                if ( !item ) {  
                        console.error ( `App with id: "${id}" was not found.`)
                        return false
                    }
                return item
        } // getApp func.



    /**
     * Check if an app with specific id has been published.
     * @param {string} id - Container id
     * @returns {boolean} True if app is published, false otherwise.
     */
    function has ( id ) {
            return cache[id] ? true : false
        } // has func.
 

    
    return {
              publish
            , destroy 
            , getApp  
            , has
        }
} // visualController



export default VisualController


