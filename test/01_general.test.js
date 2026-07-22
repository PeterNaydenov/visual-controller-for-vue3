import VisualController from '../src/main.js'
import Hello from '../demo/hello.vue'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
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

const tick = () => new Promise(resolve => setTimeout(resolve, 0))
const resetEl = () => {
    if (html.has('el')) html.destroy('el')
    const node = document.getElementById('el')
    if (node) node.innerHTML = ''
}

describe('Visual controller for vue 3', () => {

  it('Method "publish" returns a promise', () => {
    const result = html.publish(Hello, {}, 'el')
    expect(result.constructor.name).toBe('Promise')
  })

  it('Destroy', async () => {
    const node = document.getElementById('el')
    await html.publish(Hello, {}, 'el')
    expect(node.innerHTML).not.toBe('')

    html.destroy('el')
    expect(node.innerHTML).toBe('')
  })

  it('Dependencies', async () => {
    const app = await html.publish(Hello, {}, 'el')
    expect(typeof app.changeMessage).toBe('function')
    expect(typeof app.increment).toBe('function')
    expect(typeof app.getCount).toBe('function')
    expect(app.getCount()).toBe(0)
    html.destroy('el')
  })

  it('Method "has"', async () => {
    await html.publish(Hello, {}, 'el')
    const exists = html.has('el')
    html.destroy('el')
    const missing = html.has('el')
    expect(exists).toBe(true)
    expect(missing).toBe(false)
  })

  it('Hydrate, SSR support', async () => {
    const node = document.getElementById('el')
    const app = createSSRApp(Hello)
    app.provide('dependencies', { eBus, setupUpdates: () => {} })

    const snippet = await renderToString(app)
    node.innerHTML = snippet

    let countDisplay = document.querySelector('p')
    expect(countDisplay.innerHTML).toBe('Count: 0')

    await html.publish(Hello, {}, 'el')
    const button = document.querySelector('button')
    button.click()

    await tick()
    countDisplay = document.querySelector('p')
    expect(countDisplay.innerHTML).toBe('Count: 1')
  })
})

describe('Error handling and edge cases', () => {

  beforeEach(resetEl)

  it('publish with no component resolves to false', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await html.publish(undefined, {}, 'el')
    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('Error: Component is undefined')
    errorSpy.mockRestore()
  })

  it('publish with missing node id resolves to false', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await html.publish(Hello, {}, 'nonexistent')
    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('Can\'t find node with id: "nonexistent"')
    errorSpy.mockRestore()
  })

  it('publish without an id skips the destroy check', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await html.publish(Hello, {}, undefined)
    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('Can\'t find node with id: "undefined"')
    errorSpy.mockRestore()
  })

  it('publish with isCustomElement flag sets compiler options', async () => {
    const app = await html.publish(Hello, { isCustomElement: true }, 'el')
    expect(app).toBeDefined()
    expect(app.changeMessage).toBeDefined()
    expect(html.has('el')).toBe(true)
    html.destroy('el')
  })

  it('destroy on non-existent app returns false', () => {
    expect(html.destroy('never-published')).toBe(false)
  })

  it('destroy returns false when cache exists but node is missing', async () => {
    const tempNode = document.createElement('div')
    tempNode.id = 'orphan'
    document.body.appendChild(tempNode)

    await html.publish(Hello, {}, 'orphan')
    expect(html.has('orphan')).toBe(true)

    tempNode.remove()
    expect(html.destroy('orphan')).toBe(false)
    expect(html.has('orphan')).toBe(true)

    document.body.appendChild(tempNode)
    expect(html.destroy('orphan')).toBe(true)
    expect(html.has('orphan')).toBe(false)
  })

  it('getApp on non-existent app returns false', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(html.getApp('never-published')).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('App with id: "never-published" was not found.')
    errorSpy.mockRestore()
  })

  it('getApp returns the published update interface', async () => {
    const app = await html.publish(Hello, {}, 'el')
    expect(html.getApp('el')).toBe(app)
    html.destroy('el')
  })

  it('changeMessage updates the rendered message', async () => {
    const app = await html.publish(Hello, {}, 'el')
    app.changeMessage('New message')
    await tick()
    expect(document.querySelector('h2').innerHTML).toBe('New message')
    html.destroy('el')
  })

  it('increment updates the counter via the update interface', async () => {
    const app = await html.publish(Hello, {}, 'el')
    expect(app.getCount()).toBe(0)
    app.increment()
    expect(app.getCount()).toBe(1)
    app.increment()
    app.increment()
    expect(app.getCount()).toBe(3)
    html.destroy('el')
  })

  it('click on the button updates the rendered count', async () => {
    await html.publish(Hello, {}, 'el')
    const button = document.querySelector('button')
    button.click()
    await tick()
    expect(document.querySelector('p').innerHTML).toBe('Count: 1')
    html.destroy('el')
  })
})
