import VisualController from '../src/main.js'
import App from '../src/App.vue'
import { renderToString } from 'vue/server-renderer'
import { createApp, provide, createSSRApp } from 'vue'
import notice from '@peter.naydenov/notice'
import { assert } from '@vue/compiler-core'



const cid = id =>`[data-cy-${id}]`;

const
     root = document.querySelector ( cid`root` )
   , eBus = notice ()
   , html = new VisualController ({ eBus })
   ;

root.id = 'el'



describe ( 'Visual controller for vue 3', () => {



    it ( 'Method "publish" returns a promise', done => { 
                const result = html.publish ( App, {}, 'el' );
                expect (  result.constructor.name ).to.be.equal ( 'Promise' )
                done ()
        }) // it Method publish return a promise

    it ( 'Destroy', () => {
                const node = document.getElementById ( 'el' );
                html.publish ( App, {}, 'el' );
                expect ( node.innerHTML ).not.equal ( '' )
                expect ( node.dataset.vApp ).not.be.equal ( undefined )

                html.destroy ( 'el' )
                expect ( node.innerHTML ).to.be.equal ( '' )
                expect ( node.dataset.vApp ).to.be.equal ( undefined )
        }) // it destroy

    it ( 'Dependencies', done => {
                let a = 0;
                eBus.on ( 'check', () => a = 1 )
                html.publish ( App, {}, 'el' )
                        .then ( app => {
                                    expect ( typeof app.changeMessage ).to.be.equal ( 'function' )
                                    expect ( a ).to.be.equal ( 1 )
                                    done ()
                            })
        }) // it Dependencies



    it ( 'Method "has"', () => {
                html.publish ( App, {}, 'el' )
                const exists = html.has ( 'el' );
                html.destroy ( 'el' )
                const missing = html.has ( 'el' );
                expect ( exists ).to.be.equal ( true )
                expect ( missing ).to.be.equal ( false )
        }) // it Has



    it ( 'Hydrate, SSR support', done => {
                const 
                      node = document.getElementById ( 'el' )
                    , app = createSSRApp ( App )
                    , setupUpdates = () => {}
                    ;
                app.provide ('dependencies', { eBus, setupUpdates })
                renderToString ( app )
                      .then ( snippet => {  // Server side render and attach
                                    node.innerHTML = snippet
                                    let button = document.querySelector ( 'button' );
                                    expect ( button.innerHTML ).to.be.equal ( 'count is 0' )
                                    button.click ()
                                    expect ( button.innerHTML ).to.be.equal ( 'count is 0' )
                                    return ''
                            })
                        .then ( () => {  // Hydration moment
                                    let btn = document.querySelector ( 'button' );
                                    expect ( btn.innerHTML ).to.be.equal ( 'count is 0' )
                                    html.publish ( App, {}, 'el' )
                                        .then ( () => {
                                                        btn = document.querySelector ( 'button' );
                                                        btn = document.querySelector ( 'button' );
                                                        btn.click ()
                                                        setTimeout ( () => { // Waiting for next DOM call and then test
                                                                expect ( btn.innerHTML ).to.be.equal ( 'count is 1' )
                                                                done ()
                                                            }, 0 )
                                            })
                            })
        }) // it Hydrate
}) // describe