import { RendererOptions } from '@vue/runtime-core'
import * as spritejs from 'spritejs'

export const svgNS = 'http://www.w3.org/2000/svg'

const doc = (typeof document !== 'undefined' ? document : null) as Document

let tempContainer: HTMLElement
let tempSVGContainer: SVGElement

declare module 'spritejs' {
  class EChart extends spritejs.Node {
    createContext(): void
    setOption(option: Record<string, any>): void
    render(): void
  }

  interface Node {
    dispatchEvent(event: string, data?: Record<string, any>): void
  }
}

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  insert: (child, parent, anchor) => {
    if (parent instanceof spritejs.Node) {
      if (child.nodeType === document.TEXT_NODE) {
        if (parent instanceof spritejs.Label) {
          parent.text = child.textContent as string
        } else if (parent.appendChild) {
          parent.appendChild(child)
        }
      } else if (
        child instanceof spritejs.Node ||
        child.nodeType === document.COMMENT_NODE ||
        child instanceof spritejs.Node
      ) {
        parent.insertBefore(child, anchor || null)
      }
    } else {
      if (child instanceof spritejs.Scene)
        child = (child as spritejs.Scene).container
      if (anchor instanceof spritejs.Scene)
        anchor = (anchor as spritejs.Scene).container
      parent.insertBefore(child, anchor || null)
    }
  },

  remove: child => {
    if (child instanceof spritejs.Scene) {
      child = child.container
    }
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (vnode, tag, isSVG, is): Element => {
    let hasPrefix = false
    let tagName = tag
    let isValidSpriteNode = spritejs.isSpriteNode(tagName)

    if (tag.startsWith('s-')) {
      hasPrefix = true
      tagName = tag.slice(2)
      isValidSpriteNode = spritejs.isSpriteNode(tagName)
    }

    // TODO: extend actions and states from parent vnode
    if (isValidSpriteNode) {
      const props = vnode.props as Record<string, any>

      if (tagName === 'scene') {
        const elm = doc.createElement('div')
        const scene = spritejs.createElement(tagName, {
          container: elm
        }) as spritejs.Scene

        const resources = props.resources || props.attrs.resources
        scene.preload(...resources).then(() => {
          scene.dispatchEvent('load', { resources })
        })

        return scene as any
      }

      const node = spritejs.createElement(tagName, props) as spritejs.Node
      if (hasPrefix) {
        const _tagName = `S-${tagName}`
        Object.defineProperty(node, 'tagName', {
          get() {
            return _tagName
          }
        })
      }

      if (tagName === 'echart' && props.option) {
        ;(node as spritejs.EChart).setOption(props.option)
      }

      return node as any
    }

    return isSVG
      ? doc.createElementNS(svgNS, tag)
      : doc.createElement(tag, is ? { is } : undefined)
  },

  createText: text => doc.createTextNode(text),

  createComment: text => doc.createComment(text),

  setText: (node, text) => {
    if (node instanceof spritejs.Label) {
      node.text = text
    } else {
      node.nodeValue = text
    }
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  parentNode: node => node.parentNode as Element | null | any,

  nextSibling: node => node.nextSibling,

  querySelector: selector => doc.querySelector(selector),

  setScopeId(el, id) {
    el.setAttribute(id, '')
  },

  cloneNode(el) {
    return el.cloneNode(true)
  },

  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, isSVG) {
    const temp = isSVG
      ? tempSVGContainer ||
        (tempSVGContainer = doc.createElementNS(svgNS, 'svg'))
      : tempContainer || (tempContainer = doc.createElement('div'))
    temp.innerHTML = content
    const first = temp.firstChild as Element
    let node: Element | null = first
    let last: Element = node
    while (node) {
      last = node
      nodeOps.insert(node, parent, anchor)
      node = temp.firstChild as Element
    }
    return [first, last]
  }
}
