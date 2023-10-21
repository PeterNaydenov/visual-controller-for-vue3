# Visual Controller for Vue 3

Tool for building a micro-frontends(MFE) based on Vue 3 components - Start multiple Vue 3 applications on the same HTML page and control them.

Install visual controller:
```
npm i @peter.naydenov/visual-controller-for-vue3
```

Initialization process:
```js
import notice from '@peter.naydenov/notice'
import VisualController from '@peter.naydenov/visual-controller-for-vue3'

let 
      eBus = notice ()        // Notice docs:  https://github.com/PeterNaydenov/notice
    , dependencies = { eBus } // Provide to dependency object everything that should be exposed to components 
    , html = new VisualController ( dependencies )   
    ;
// Ready for use...
```

Let's show something on the screen:
```js
// Let's have vue component 'Hello' with prop 'greeting'

html.publish ( Hello, {greeting:'Hi'}, 'app' )
//arguments are: ( component, props, containerID )
```

## Inside of the Components
*Note: If your component should be displayed only, that section can be skipped.*

If access to your external libraries needed, please inject `dependecies` object. All provided libraries during visualController initialization are available plus one special method `setupUpdates`. The method could set an interface for external component manipulation.

```vue
<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { inject, ref } from 'vue'

const { eBus, setupUpdates } = inject ( 'dependencies' );   // Here you can get your dependency object.
//            ^^^^^^^^^^^^
//              This method is coming as an extra dependency content. You can define here functions that can 
//              manipulate your component from outside of vue-app. 
let message = ref('Vite + Vue');

eBus.emit ( 'check' )

setupUpdates ({   // Provides to visualContoller method 'changeMessage' 
      changeMessage:  msg => message.value = msg
    })    
</script>
```
The external call will look like this:

```js
html.getApp ( 'app' ).changeMessage ( 'New message content' ) 
```



## Visual Controller Methods
```js
  publish : 'Render vue app in container. Associate app instance with the container.'
, getApp  : 'Returns app instance by container name'
, destroy : 'Destroy app by using container name '
, has     : 'Checks if app with specific "id" was published'
```



### VisualController.publish ()
Publish vue app.
```js
html.publish ( component, props, containerID )
```
- **component**: *object*. Vue component
- **props**: *object*. Vue components props
- **containerID**: *string*. Id of the container where vue-app will live.

Example:
```js
 let html = new VisualController ();
 html.publish ( Hi, { greeting: 'hi'}, 'app' )
```

Render component 'Hi' with prop 'greeting' and render it in html element with id "app".





### VisualController.getApp ()
Returns the library of functions provided from method `setupUpdates`. If setupUpdates was not called from the vue-app, result will be an empty object.

```js
 let controls = html.getApp ( containerID )
```
- **containerID**: *string*. Id of the container.

Example:
```js
let 
      id = 'videoControls'
    , controls = html.getApp ( id ) 
    ;
    // if app with 'id' doesn't exist -> returns false, 
    // if app exists and 'setupUpdates' was not used -> returns {}
    // in our case -> returns { changeMessage:f }
if ( controls )   controls.changeMessage ( 'Hello from outside' )
else { // component is not available
       console.error ( `App for id:"${id}" is not available` )
   }
```

If visual controller(html) has a vue app associated with this name will return it. Otherwise will return **false**.





### VisualController.destroy ()
Will destroy vue app associated with this container name and container will become empty. Function will return 'true' on success
and 'false' on failure. 
Function will not delete content of provided container if there is no vue app associated with it.

```js
html.destroy ( containerID )
```
- **containerID**: *string*. Id name.

## Other details and requirements

- Support for Autonomous Custom Elements ( after v.1.1.0 ). Add a prop named `isCustomElement`. Should be a function.

```js
let isCustomElement = tag => tag === 'plastic-button';   // Will ignore tags 'plastic-button' during vue- render process. 

html.publish ( Hi, { greeting: 'hi', isCustomElement}, 'app' )

//custom elements for AWS Amplify service will look like
let amplfiyCustom = tag => tag.startsWith ( 'amplify-' )
html.publish ( Hi, {greeting:'hi', isCustomElement: amplifyCustom}, 'app' )
```
 




## Extra

Visual Controller has versions for few other front-end frameworks:
- [React](https://github.com/PeterNaydenov/visual-controller-for-react) 
- [Vue 2](https://github.com/PeterNaydenov/visual-controller-for-vue)
- [Svelte](https://github.com/PeterNaydenov/visual-controller-for-svelte3)





## Release History



### 2.0.2 ( 2023-10-22)
- [x] Dependencies update. Vue - v.3.3.6


### 2.0.1 (2023-10-21)
- [x] Dependencies update. ask-for-css - v.1.4.0




### 2.0.0 ( 2022-11-21)
- [x] Full rewrite of the library;
- [x] Method 'has' was added;
- [x] Support for SSR hydration;

### 1.1.1 ( 2021-04-25)
 - [x] Support for Autonomous Custom Elements

### 1.0.2 (2021-03-15)
 - [x] Fix: Only one load per component;