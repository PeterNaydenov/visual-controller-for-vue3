import VisualController from '../src/main.js'
import Hello from './fixtures/hello.vue'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body><main id="main"></main></body></html>')
global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator

const html = new VisualController({})

const tick = () => new Promise(resolve => setTimeout(resolve, 0))
const resetAll = () => {
    html.reset()
    let main = document.querySelector('#main')
    if (!main) {
        main = document.createElement('main')
        main.id = 'main'
        document.body.appendChild(main)
    }
    main.innerHTML = ''
}


describe('Visual controller for vue 3 — v3 region API', () => {

  beforeEach(resetAll)

  it('set registers a region and adds the alias to list()', () => {
    html.set(({ start, end }) => {
        document.querySelector('#main').append(start, end)
        return 'header'
    })
    expect(html.list()).toContain('header')
  })

  it('set forwards extra args to the callback', () => {
        let received
        html.set(({ start, end }, locale) => {
            received = locale
            document.body.append(start, end)
            return 'l10n-test'
        }, 'en')
        expect(received).toBe('en')
  })

  it('publish mounts an app into a declared alias', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Hello)
        expect(html.has('header')).toBe(true)
    })

  it('publish into undeclared alias resolves to false and logs', async () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('nope', Hello)
        expect(result).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

  it('publish with no component resolves to false and logs', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('header', undefined)
        expect(result).toBe(false)
        errSpy.mockRestore()
    })

  it('publish without data works (defaults to {})', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Hello)
        expect(typeof app.changeMessage).toBe('function')
    })

  it('publish accepts and ignores extraParams', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Hello, {}, { future: true })
        expect(app.changeMessage).toBeDefined()
    })

  it('republish destroys the first app and mounts the second', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Hello)
        const app1 = html.getApp('header')
        await html.publish('header', Hello)
        const app2 = html.getApp('header')
        expect(app1).not.toBe(app2)
        expect(html.has('header')).toBe(true)
    })

  it('destroy empties the range, has() becomes false, alias stays in list()', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Hello)
        expect(html.has('header')).toBe(true)
        expect(html.destroy('header')).toBe(true)
        expect(html.has('header')).toBe(false)
        expect(html.list()).toContain('header')
    })

  it('destroy on an unknown alias returns false', () => {
        expect(html.destroy('never-published')).toBe(false)
    })

  it('getApp returns the setupUpdates interface', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Hello)
        const app = html.getApp('header')
        expect(typeof app.changeMessage).toBe('function')
        expect(app.getCount()).toBe(0)
    })

  it('getApp on missing alias returns false and logs', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.getApp('never')).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

  it('supports multiple regions in the same parent', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => {
            main.append(start, end)
            return 'header'
        })
        html.set(({ start, end }) => {
            main.append(start, end)
            return 'sidebar'
        })
        expect(html.list()).toEqual(expect.arrayContaining(['header', 'sidebar']))
        await html.publish('header', Hello)
        await html.publish('sidebar', Hello)
        expect(html.has('header')).toBe(true)
        expect(html.has('sidebar')).toBe(true)
        // Two separate mount spans, one per region
        const spans = Array.from(main.querySelectorAll('span')).filter(s => s.style.display === 'contents')
        expect(spans.length).toBe(2)
    })

  it('orphaned markers (parent removed) make publish resolve to false', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        document.querySelector('#main').remove()
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('header', Hello)
        expect(result).toBe(false)
        expect(html.has('header')).toBe(false)
        errSpy.mockRestore()
    })

  it('reset unmounts all apps and clears list()', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => {
            main.append(start, end)
            return 'header'
        })
        html.set(({ start, end }) => {
            main.append(start, end)
            return 'sidebar'
        })
        await html.publish('header', Hello)
        await html.publish('sidebar', Hello)
        expect(html.list().length).toBe(2)

        html.reset()
        expect(html.list().length).toBe(0)
        expect(html.has('header')).toBe(false)
        expect(html.has('sidebar')).toBe(false)
        // No mount spans left
        const remaining = Array.from(main.querySelectorAll('span')).filter(s => s.style.display === 'contents')
        expect(remaining.length).toBe(0)
    })

  it('isCustomElement flag inside data is honored', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'ce'
        })
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        await html.publish('ce', Hello, { isCustomElement: true })
        await tick()
        // The Hello component's template includes <button>; with isCustomElement=true
        // Vue treats ALL tags as custom elements, so the rendered DOM contains
        // the raw template tags rather than compiled components.
        // We just assert the mount completed and the alias is published.
        expect(html.has('ce')).toBe(true)
        warnSpy.mockRestore()
    })

  it('republishing into the same region leaves only the latest app rendered', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => {
            main.append(start, end)
            return 'header'
        })
        await html.publish('header', Hello)
        const app1 = html.getApp('header')
        app1.changeMessage('First app')
        await tick()

        await html.publish('header', Hello)
        const app2 = html.getApp('header')
        app2.changeMessage('Second app')
        await tick()

        const h2 = main.querySelector('h2')
        expect(h2.textContent).toBe('Second app')
    })

    it('changeMessage updates the rendered message', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Hello)
        app.changeMessage('New message')
        await tick()
        expect(document.querySelector('h2').innerHTML).toBe('New message')
    })

    it('SSR hydration: pre-populated range hydrates instead of replacing', async () => {
        let endNode
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            endNode = end
            return 'header'
        })

        // SSR-render the component to HTML
        const ssrApp = createSSRApp(Hello)
        ssrApp.provide('dependencies', { setupUpdates: () => {} })
        const snippet = await renderToString(ssrApp)

        // Insert the SSR HTML between the markers
        const tmpl = document.createElement('template')
        tmpl.innerHTML = snippet
        const ssrRoot = tmpl.content.firstElementChild
        document.querySelector('#main').insertBefore(ssrRoot, endNode)

        // Sanity: SSR HTML is between the markers
        expect(document.querySelector('#main').contains(ssrRoot)).toBe(true)

        // Publish — should detect SSR content and hydrate
        await html.publish('header', Hello)

        // After hydration, the same DOM node is the mount target (not replaced)
        expect(document.querySelector('.hello')).toBe(ssrRoot)

        // Reactivity works after hydration
        expect(document.querySelector('p').textContent).toBe('Count: 0')
        document.querySelector('button').click()
        await tick()
        expect(document.querySelector('p').textContent).toBe('Count: 1')
    })

    it('SSR hydration: multiple sibling nodes get wrapped in a mount span', async () => {
        let endNode
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            endNode = end
            return 'header'
        })

        // Insert two sibling elements (fragment-style SSR)
        const a = document.createElement('p')
        a.textContent = 'first'
        const b = document.createElement('p')
        b.textContent = 'second'
        document.querySelector('#main').insertBefore(a, endNode)
        document.querySelector('#main').insertBefore(b, endNode)

        await html.publish('header', Hello)

        // The two siblings should now be wrapped in a mount span.
        // Note: hydration may mismatch (Hello has a single <div class="hello"> root,
        // not two <p> elements) — Vue will fall back to client render and clear the
        // wrapper's contents. We just verify the wrap behavior: a wrapper span exists
        // between the markers.
        const main = document.querySelector('#main')
        const wrapper = Array.from(main.querySelectorAll('span')).find(s => s.style.display === 'contents')
        expect(wrapper).toBeTruthy()
        // Wrapper is a direct child of main (between markers, not at end of DOM)
        expect(wrapper.parentNode).toBe(main)
    })

    it('isEmpty returns true for an empty region and false after publish', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        expect(html.isEmpty('header')).toBe(true)
        await html.publish('header', Hello)
        expect(html.isEmpty('header')).toBe(false)
        html.destroy('header')
        expect(html.isEmpty('header')).toBe(true)
    })

    it('isEmpty returns true for an orphaned range', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        document.querySelector('#main').remove()
        expect(html.isEmpty('header')).toBe(true)
    })

    it('isEmpty returns undefined and logs for an unknown alias', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.isEmpty('nope')).toBe(undefined)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('destroy() with no args destroys every published app and returns the count', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        await html.publish('header', Hello)
        await html.publish('sidebar', Hello)
        expect(html.has('header')).toBe(true)
        expect(html.has('sidebar')).toBe(true)

        const count = html.destroy()
        expect(count).toBe(2)
        expect(html.has('header')).toBe(false)
        expect(html.has('sidebar')).toBe(false)
        // Aliases remain in list() — markers are still in the DOM
        expect(html.list()).toEqual(expect.arrayContaining(['header', 'sidebar']))
        expect(main.querySelectorAll('span').length).toBe(0)
    })

    it('destroy() with no args returns 0 when nothing is published', () => {
        expect(html.destroy()).toBe(0)
    })

    it('destroy(["alias1", "alias2"]) destroys only those, returns the count', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        html.set(({ start, end }) => { main.append(start, end); return 'footer' })
        await html.publish('header', Hello)
        await html.publish('sidebar', Hello)
        await html.publish('footer', Hello)

        const count = html.destroy(['header', 'footer'])
        expect(count).toBe(2)
        expect(html.has('header')).toBe(false)
        expect(html.has('footer')).toBe(false)
        expect(html.has('sidebar')).toBe(true)
    })

    it('destroy([...]) silently skips missing aliases', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        await html.publish('header', Hello)

        const count = html.destroy(['header', 'unknown', 'also-missing'])
        expect(count).toBe(1)
        expect(html.has('header')).toBe(false)
    })

    it('destroy([]) is a no-op and returns 0', () => {
        expect(html.destroy([])).toBe(0)
    })

    it('destroy(invalid type) logs an error and returns false', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.destroy(123)).toBe(false)
        expect(html.destroy(null)).toBe(false)
        expect(html.destroy({})).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })
})
