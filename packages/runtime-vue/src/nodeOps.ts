import { RendererOptions } from '@vue/runtime-core'
import * as spritejs from 'spritejs'

export const svgNS = 'http://www.w3.org/2000/svg'

const doc = (typeof document !== 'undefined' ? document : null) as Document

let tempContainer: HTMLElement
let tempSVGContainer: SVGElement

const isValidNodeType = spritejs.isValidNodeType || spritejs.isSpriteNode
const createElement = spritejs.createNode || spritejs.createElement
const Scene = spritejs.Scene
const Label = spritejs.Label
const BaseNode = spritejs.BaseNode || spritejs.Node
const isNewVersion = !!spritejs.isSpriteNode

type BaseNode = spritejs.BaseNode | spritejs.Node

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  insert: (child, parent, anchor) => {
    if (parent instanceof BaseNode) {
      if (child.nodeType === document.TEXT_NODE) {
        if (parent instanceof Label) {
          parent.text = child.textContent as string
        } else if (parent.appendChild) {
          parent.appendChild(child)
        }
      } else if (
        child instanceof BaseNode ||
        child.nodeType === document.COMMENT_NODE ||
        child instanceof BaseNode
      ) {
        parent.insertBefore(child, anchor || null)
      }
    } else {
      if (child instanceof Scene) child = (child as spritejs.Scene).container
      if (anchor instanceof Scene) anchor = (anchor as spritejs.Scene).container
      parent.insertBefore(child, anchor || null)
    }
  },

  remove: child => {
    if (child instanceof Scene) {
      child = child.container
    }
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (tag, isSVG, is): Element => {
    let hasPrefix = false
    let tagName = tag
    // TODO: isReservedTag?
    let isValidSpriteNode = isValidNodeType(tagName)

    if (tag.startsWith('s-')) {
      hasPrefix = true
      tagName = tag.slice(2)
      isValidSpriteNode = isValidNodeType(tagName)
    }

    if (isValidSpriteNode) {
      // TODO: extend actions and states from parent vnode
      // TODO: scene perload
      if (tagName === 'scene') {
        const elm = doc.createElement('div')
        if (isNewVersion) {
          return createElement(tagName, { container: elm }) as any
        } else {
          return createElement(tagName, elm) as any
        }
      }

      const node = createElement(tagName)
      if (hasPrefix) {
        const _tagName = `S-${tagName}`
        Object.defineProperty(node, 'tagName', {
          get() {
            return _tagName
          }
        })
      }

      // TODO: when tagName is `echart`, should setOption for echart node
      return node as any
    }

    return isSVG
      ? doc.createElementNS(svgNS, tag)
      : doc.createElement(tag, is ? { is } : undefined)
  },

  createText: text => doc.createTextNode(text),

  createComment: text => doc.createComment(text),

  setText: (node, text) => {
    if (node instanceof Label) {
      node.text = text
    } else {
      node.nodeValue = text
    }
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  parentNode: node => node.parentNode as Element | null | any,

  nextSibling: node => {
    if (node instanceof spritejs.BaseNode) {
      if (node.parent) {
        const parent = node.parent as spritejs.Block
        const idx = parent.childNodes.indexOf(node)
        return parent.childNodes[idx + 1]
      }
      return null
    }
    // spritejs 3.x has nextSibling getter on Node
    return node.nextSibling
  },

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
