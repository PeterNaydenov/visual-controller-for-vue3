import VisualController from '/src/main.js'
import HeaderApp from '/demo/header.vue'
import SidebarApp from '/demo/sidebar.vue'

const
      html              = new VisualController({})
    , main             = document.getElementById ( 'main' )
    , updateHeaderBtn  = document.getElementById ( 'updateHeader' )
    , incrementBtn     = document.getElementById ( 'incrementHeader' )
    , swapBtn          = document.getElementById ( 'swapApps' )
    , destroyHeaderBtn = document.getElementById ( 'destroyHeader' )
    , destroySidebarBtn = document.getElementById ( 'destroySidebar' )
    , resetBtn         = document.getElementById ( 'resetAll' )
    , resultText       = document.getElementById ( 'resultText' )
    , aliasesList      = document.getElementById ( 'aliasesList' )
    ;

function refreshAliases () {
        aliasesList.textContent = html.list ().join ( ', ' ) || '-'
    }


// 1. Define two regions inside one parent. No <div id="..."> wrappers.
html.set ( ( { start, end } ) => {
        main.append ( start, end )
        return 'header'
    })

html.set ( ( { start, end } ) => {
        main.append ( start, end )
        return 'sidebar'
    })

refreshAliases ()


// 2. Publish apps into the regions.
html.publish ( 'header', HeaderApp )
    .then ( updates => {
            resultText.textContent = 'Header published: ' + JSON.stringify ( Object.keys ( updates ) )
            refreshAliases ()
        })

html.publish ( 'sidebar', SidebarApp, { title: 'Items' } )
    .then ( updates => {
            console.log ( 'Sidebar published:', updates )
            refreshAliases ()
        })



updateHeaderBtn.addEventListener ( 'click', () => {
        const app = html.getApp ( 'header' )
        if ( app )   app.changeMessage ( `Header updated at ${new Date().toLocaleTimeString()}` )
    })

incrementBtn.addEventListener ( 'click', () => {
        const app = html.getApp ( 'header' )
        if ( app )   app.increment ()
    })


let swapped = false
swapBtn.addEventListener ( 'click', () => {
        swapped = !swapped
        // Exchange the apps between the two regions. Initial state:
        // header hosts HeaderApp, sidebar hosts SidebarApp. After swap,
        // header hosts SidebarApp and sidebar hosts HeaderApp. Toggle again
        // to restore.
        const [ headerApp, sidebarApp ] = swapped
                ? [ SidebarApp, HeaderApp ]
                : [ HeaderApp, SidebarApp ]
        html.publish ( 'header', headerApp )
        html.publish ( 'sidebar', sidebarApp )
        resultText.textContent = swapped
                ? 'Swapped: header and sidebar exchanged apps'
                : 'Restored: header and sidebar back to initial apps'
    })


destroyHeaderBtn.addEventListener ( 'click', () => {
        const ok = html.destroy ( 'header' )
        resultText.textContent = 'Destroy header: ' + ok
        refreshAliases ()
    })


destroySidebarBtn.addEventListener ( 'click', () => {
        const ok = html.destroy ( 'sidebar' )
        resultText.textContent = 'Destroy sidebar: ' + ok
        refreshAliases ()
    })


resetBtn.addEventListener ( 'click', () => {
        html.reset ()
        resultText.textContent = 'Reset all'
        refreshAliases ()
    })
