import { render, h } from '../src'
// import * as spritejs from 'spritejs';

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
    render(h('s-scene'), root)
    expect(root.innerHTML).toBe(
      `<div style="overflow: hidden; position: relative;"></div>`
    )
  })

  test('should create scene with layer', () => {
    const root = document.createElement('div')
    const children = [h('layer')]
    const vnode = h(
      'scene',
      { viewport: [512, 512], resolution: [512, 512] },
      children
    )
    render(vnode, root)
    expect(vnode.children).toBe(children)
  })
})
