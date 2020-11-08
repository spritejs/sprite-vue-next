import { render, h } from '../src'
import * as spritejs from 'spritejs'

describe('renderer spritejs node', () => {
  test('should created scene', () => {
    const root = document.createElement('div')
    render(h('scene'), root)
    expect(root.innerHTML).toBe(
      `<div style="overflow: hidden; position: relative;"></div>`
    )
  })

  test('should create s-scene', () => {
    const root = document.createElement('div')
    const scene = h('scene')
    render(scene, root)
    expect(root.innerHTML).toBe(
      `<div style="overflow: hidden; position: relative;"></div>`
    )
  })

  test('should create scene with layer', () => {
    const root = document.createElement('div')
    const children = [h('layer', { id: 'fglayer' })]
    const scene = h('scene', { width: 512, height: 512 }, children)
    render(scene, root)
    expect(scene.children).toBe(children)
    expect((root.firstChild as HTMLDivElement).innerHTML).toBe(
      `<canvas width="512" height="512" style="position: absolute; top: 0px; left: 0px; width: 0px; height: 0px;" data-layer-id="fglayer"></canvas>`
    )
  })

  test('create sprite with x and y', () => {
    const root = document.createElement('div')
    const sprite = h('sprite', { x: 10, y: 10 })
    const children = [h('layer', { id: 'fglayer' }, [sprite])]
    const scene = h('scene', { width: 512, height: 512 }, children)
    render(scene, root)
    expect(sprite.el).toBeInstanceOf(spritejs.Sprite)
    if (sprite.el) {
      expect(sprite.el.attr('y')).toBe(10)
      expect(sprite.el.attr('x')).toBe(10)
    }
  })

  test('create sprite with attr', () => {
    const root = document.createElement('div')
    const sprite = h('sprite', { attrs: { x: 10, y: 10 } })
    const children = [h('layer', { id: 'fglayer' }, [sprite])]
    const scene = h('scene', { width: 512, height: 512 }, children)
    render(scene, root)
    expect(sprite.el).toBeInstanceOf(spritejs.Sprite)
    if (sprite.el) {
      expect(sprite.el.attr('x')).toBe(10)
      expect(sprite.el.attr('y')).toBe(10)
    }
  })
})
