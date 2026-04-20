import VisualController from '/src/main.js'
import Hello from '/demo/hello.vue'

const 
  html = new VisualController({})
  , hasTextBlock = document.getElementById ( 'hasText' )
  , updateMsgBtn = document.getElementById ( 'updateMsg' )
  , incrementBtn = document.getElementById ( 'increment' )
  , getCountBtn = document.getElementById ( 'getCount' )
  , destroyBtn = document.getElementById ( 'destroy' )
  , resultTextBlock = document.getElementById ( 'resultText' )
  ;


html.publish ( Hello, { greeting: 'Hi from Vue3!' }, 'app')
    .then ( updates => {
            console.log ( 'App loaded with updates:', updates )
            hasTextBlock.textContent = html.has('app')
        })



 updateMsgBtn.addEventListener ( 'click', () => {
            const app = html.getApp ( 'app' )
            if (app)   app.changeMessage ( `Updated at ${new Date().toLocaleTimeString()}` )
      })



 incrementBtn.addEventListener ( 'click', () => {
            const app = html.getApp('app')
            if (app) app.increment()
      })



getCountBtn.addEventListener ( 'click', () => {
            const app = html.getApp ( 'app' )
            if ( app ) {
                resultTextBlock.textContent = app.getCount ()
              }
      })


destroyBtn.addEventListener ( 'click', () => {
            const result = html.destroy ( 'app' )
            resultTextBlock.textContent = 'Destroyed: ' + result
            hasTextBlock.textContent = html.has ( 'app' )
      })