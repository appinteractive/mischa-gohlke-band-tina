export type NormalizedNavItem =
  | {
      title: string
      url?: string
      page?: string
      disabled?: boolean
      showInMainNavigation?: boolean
      children?: NormalizedNavItem[]
      siblings?: NormalizedNavItem[]
    }
  | undefined

// get url from page path
export const urlByPath = (path: string) => {
  return path.replace(/content\/pages(.+)\.mdx/, '$1')
}

/**
 * normalize navigation tree
 */
export function normalizeUrls(items: NormalizedNavItem[]): NormalizedNavItem[] {
  const output = [...items.filter((item) => !item.disabled)]

  output.forEach((item) => {
    if (item.disabled === true) {
      item.disabled = true // add disabled if true
    } else {
      delete item.disabled // remove disabled if not true
    }
    if (item.disabled || item.showInMainNavigation === false) {
      item.showInMainNavigation = false // add showInMainNavigation if false or disabled
    } else {
      delete item.showInMainNavigation // remove showInMainNavigation if not true
    }
    /* if (!item.page && item.children) {
      item.page = item.children[0].page // add page from first child
    } */
    if (item.page) {
      item.url = urlByPath(item.page) // add url from page
    }
    if (item.children && item.children.length > 0) {
      const children = normalizeUrls([...item.children])
      // put url before children
      delete item.children
      item.children = children
    } else {
      delete item.children
    }
  })

  return output.filter((item) => !item.disabled)
}

export type SubNavigationType = {
  items?: NavNode[]
  parent?: NavNode
}

/**
 * get sub navigation for a given url form a normalized navigation tree
 */
export function getSubNavigation(
  nav: NormalizedNavItem[],
  url: string,
  keepChildren = false
): SubNavigationType | null {
  for (const item of nav) {
    const foundNode = findNodeByUrl(item as any, url, null, keepChildren)
    if (foundNode?.nodes) {
      return {
        items: foundNode.nodes,
        parent: foundNode.parent,
      }
    }
  }
  return null
}

type ObjectType = {
  [key: string]: any
}

export function deleteUndefinedValues<T extends ObjectType | any[]>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return
  }

  if (Array.isArray(obj)) {
    obj.forEach((val, i) => {
      if (typeof val === 'undefined') {
        obj.splice(i, 1)
      } else {
        deleteUndefinedValues(val)
      }
    })
  } else {
    Object.entries(obj).forEach(([key, val]) => {
      if (typeof val === 'undefined') {
        delete obj[key]
      } else {
        deleteUndefinedValues(val)
      }
    })
  }

  return obj
}

export interface NavNodeParent {
  title: string
  url: string
  parent?: NavNodeParent
}
export interface NavNode {
  title: string
  url: string
  active?: boolean
  parentActive?: boolean
  children?: NavNode[]
  parent?: NavNodeParent
}

/**
 * ony keep title, url, active and children (if not empty or removeChildren is not true)
 */
export function cleanNode(node: NavNode, removeChildren = false): NavNode {
  return {
    title: node.title,
    url: node.url ?? node.children?.[0]?.url,
    active: node.active ?? undefined,
    children:
      removeChildren || !node.children?.length
        ? undefined
        : node.children.map((x) => cleanNode(x)),
  }
}

export type NavNodesWithParent = {
  nodes: NavNode[]
  parent?: NavNode
}
/**
 * find navigation tree node by url
 *
 * TODO: return node and parent
 */
export function findNodeByUrl(
  root: NavNode,
  url: string,
  parent?: NavNode,
  keepChildren?: boolean
): NavNodesWithParent | null {
  if (root.url === url) {
    root.active = true
    if (parent?.children) {
      return {
        nodes: [
          {
            ...cleanNode(root),
            active: true,
            children: root.children?.map((x) => {
              return { ...cleanNode(x), active: x.url === url ?? undefined }
            }),
          },
        ],
        parent: {
          title: parent.title,
          url: parent.url ?? parent.children?.[0]?.url,
        },
      }
    } else {
      return {
        nodes: [{ ...root, active: true }],
      }
    }
  }

  if (!root.children) return null

  for (const child of root.children) {
    const foundNode = findNodeByUrl(child, url, { ...root }, keepChildren)
    if (foundNode?.nodes) {
      root.active = true
      return {
        nodes: (child.children ?? root.children ?? []).map((x) => {
          if (x.url === url) {
            return cleanNode({
              ...x,
              active: true,
              /* cleanEmptyNodes( */
              children: x.children?.map(
                (y) => {
                  return { ...cleanNode(y), active: y.url === url ?? undefined }
                } /* ) */
              ),
            })
          }
          const item = cleanNode(x)
          return {
            ...item,
            children: cleanEmptyNodes(item.children, keepChildren),
          }
        }),
        parent: {
          title: foundNode.parent.title,
          url: foundNode.parent.url,
        },
      }
    }
  }

  return null
}

/**
 * removes nodes without active children
 */
export function cleanEmptyNodes(nodes: NavNode[], keep = false): NavNode[] {
  const hasActive = nodes?.some((x) => x.active)
  return nodes?.filter((node) => {
    if (node.children) {
      node.children = cleanEmptyNodes(node.children, keep || node.active)
    }
    return hasActive || keep
  })
}
