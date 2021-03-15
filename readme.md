# Visual Controller for Vue 3



Install visual controller:
```
npm i @peter.naydenov/visual-controller-for-vue3
```

Initialization process:
```js
import { createApp } from 'vue'
import mitt from 'mitt'
import VisualController from '@peter.naydenov/visual-controller-for-vue3'

let 
      eBus = mitt ()
    , html = new VisualController ({eBus,createApp})
    ;
// Ready for use...
```

Let's show something on the screen:
```js
// Let's have vue component 'Hello' with prop 'greeting'

html.publish ( Hello, {greeting:'Hi'}, 'app' )
//arguments are: ( component, props, containerID )
```


## Visual Controller Methods
```js
  publish : 'Render vue app in container. Associate app instance with the container.'
, getApp  : 'Returns app instance by container name'
, destroy : 'Destroy app by using container name '
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
 import mitt from 'mitt
 import { createApp } from 'vue'

 let 
      eBus = mitt ()
    , html = new VisualController ({eBus, createApp})
    ;

 html.publish ( Hi, { greeting: 'hi'}, 'app' )
```

Render component 'Hi' with prop 'greeting' and render it in html element with id "app".





### VisualController.getApp ()
Returns vue-app associated with a container. Provides access to the methods of parent vue-app component.

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
if ( controls )   controls.pushPlay () // use methods of the component
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

- Every component receive at least one props: [ 'eBus' ].  Use `eBus` to provide screen-events back to the software.


Release History

1.0.2 (2021-03-15)
 [ ] Fix: Only one load per component;