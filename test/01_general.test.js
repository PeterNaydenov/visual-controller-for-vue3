import VisualController from '../src/main.js'
import App from '../src/App.vue'
import { renderToString } from 'vue/server-renderer'
import { createApp, provide, createSSRApp } from 'vue'
import notice from '@peter.naydenov/notice'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>')
global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator

const root = document.querySelector('#root')
const eBus = notice()
const html = new VisualController({ eBus })

root.id = 'el'

describe('Visual controller for vue 3', () => {

  it('Method "publish" returns a promise', () => { 
    const result = html.publish(App, {}, 'el')
    expect(result.constructor.name).toBe('Promise')
  })

  it('Destroy', async () => {
    const node = document.getElementById('el')
    await html.publish(App, {}, 'el')
    expect(node.innerHTML).not.toBe('')

    html.destroy('el')
    expect(node.innerHTML).toBe('')
  })

  it('Dependencies', async () => {
    let a = 0
    eBus.on('check', () => a = 1)
    const app = await html.publish(App, {}, 'el')
    expect(typeof app.changeMessage).toBe('function')
    expect(a).toBe(1)
  })

  it('Method "has"', async () => {
    await html.publish(App, {}, 'el')
    const exists = html.has('el')
    html.destroy('el')
    const missing = html.has('el')
    expect(exists).toBe(true)
    expect(missing).toBe(false)
  })

  it('Hydrate, SSR support', async () => {
    const node = document.getElementById('el')
    const app = createSSRApp(App)
    app.provide('dependencies', { eBus, setupUpdates: () => {} })
    
    const snippet = await renderToString(app)
    node.innerHTML = snippet
    
    let button = document.querySelector('button')
    expect(button.innerHTML).toBe('count is 0')
    button.click()
    expect(button.innerHTML).toBe('count is 0')
    
    await html.publish(App, {}, 'el')
    button = document.querySelector('button')
    button.click()
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(button.innerHTML).toBe('count is 1')
  })
})