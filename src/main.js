"use strict"
/**
 *  Visual Controller for Vue 3
 *  Control multiple vue3 apps with a single controller.
 */

import askForPromise from 'ask-for-promise'
import { createApp, createSSRApp } from 'vue'

class VisualController {

    constructor ( dependencies = {} ) {
              const cache = {}  // collect vue-component update interfaces
              this.dependencies = { ...dependencies, createApp, createSSRApp }
              return {
                          publish : this.publish ( this.dependencies, cache )
                        , destroy : this.destroy ( cache )
                        , getApp  : this.getApp  ( cache )
                        , has     : id => cache[id] ? true : false
                    }
        }



    publish ( dependencies, cache ) {
        return function (component, data, id) {
                    const 
                          hasKey = this.has ( id )
                        , { createApp, createSSRApp } = dependencies
                        , { isCustomElement } = data
                        , endTask = askForPromise ()
                        ;
                    if ( !component ) {
                            console.error ( `Error: Component is undefined` )
                            endTask.done (false)
                            return endTask.promise
                    }
                    if ( hasKey )   this.destroy ( id )

                    let 
                          node = document.getElementById ( id )
                        , app 
                        , setupUpdates = lib => cache[id] = lib
                        ;
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

                    if ( isCustomElement )   app.config.isCustomElement = isCustomElement   // Autonomous Custom Elements. Docs: https://v3.vuejs.org/guide/migration/custom-elements-interop.html#autonomous-custom-elements
                    app.mount (`#${id}`)
                    endTask.done ( cache[id] )
                    return endTask.promise
            }} // publish func.



    destroy ( cache ) {
        return function (id) {
                    if ( cache[id] ) {                    
                            let 
                                  node = document.getElementById ( id )
                                , unmount = node.__vue_app__.unmount
                                ;
                            unmount ()
                            node.removeAttribute ( 'data-v-app' )
                            delete cache[id]
                            return true
                        }
                    else    return false
            }} // destroy func.


            
    getApp ( cache ) {
        return function (id) {
                const item = cache[id];
                if ( !item ) {  
                        console.error ( `App with id: "${id}" was not found.`)
                        return false
                    }
                return item
        }} // getApp func.
} // visualController



export default VisualController


