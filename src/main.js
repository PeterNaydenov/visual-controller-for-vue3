"use strict"
/**
 *  Visual Controller for Vue 3
 *  Control multiple vue3 apps with a single controller.
 */

import askForPromise from 'ask-for-promise'
import { createApp, createSSRApp } from 'vue'



function VisualController ( dependencies = {} ) {
    /** @type {Object.<string, any>} */
    const cache = {}  // collect vue-component update interfaces
    
    
    dependencies = { ...dependencies, createApp, createSSRApp }



    /**
     * Publish vue app in container.
     * @param {Object} component Vue component
     * @param {Object} data Data object
     * @param {boolean} [data.isCustomElement] Whether it is a custom element
     * @param {string} id Id of the container where vue-app will live.
     * @returns {Promise<Object>} Promise with an object containing update interface methods
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
     * Destroy app by using container name
     * @param {string} id Id of the container where vue-app lives.
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
     * Returns app instance by container name
     * @param {string} id Id of the container where vue-app lives.
     * @returns {object|false} App instance if found, false otherwise.
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
     * Check if app with specific "id" was published
     * @param {string} id Id of the container where vue-app lives.
     * @returns {boolean} True if app with "id" was published, false otherwise.
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


