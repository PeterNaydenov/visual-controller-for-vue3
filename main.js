"use strict"
/**
 *  Visual Controller for Vue 3
 *  Control multiple vue3 apps with a single controller.
 */
class VisualController {
    constructor ( dependencies ) {
              const { eBus } = dependencies;
              const cache = {}  // collect vue components
              this.dependencies = { ...dependencies }
              if ( !eBus )   console.error ( 'eBus is required' )
              return {
                          publish : this.publish ( dependencies, cache )
                        , destroy : this.destroy ( cache )
                        , getApp  : this.getApp  ( cache )
                    }
        }
    publish ( dependencies, cache ) {
        return function (component, data, id) {
                const 
                        hasKey = this.destroy ( id )
                    , { eBus, createApp } = dependencies
                    ;
                let node;
                if ( !component ) {
                        console.error ( `Error: Component is undefined` )
                        return false
                   }
                if ( !hasKey ) {   // if container is not registered before 
                        node = document.getElementById ( id )
                        if ( !node ) {  
                                    console.error ( `Can't find node with id: "${id}"`)
                                    return false
                            }
                    }
                cache[id] = createApp (component, {eBus, ...data}).mount (`#${id}`)
                return true
            }} // publish func.
    destroy ( cache ) {
        return function (id) {
                const htmlKeys = Object.keys(cache);
                if ( htmlKeys.includes(id) ) {                    
                        let 
                              node = document.getElementById ( id )
                            , item = cache[id]
                            , { onUnmounted } = item
                            ;

                        node.innerHTML = ''
                        node.removeAttribute ( 'data-v-app' )
                        if ( onUnmounted )   onUnmounted ()
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


