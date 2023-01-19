import {elementNodeType, singleColumnSettingsType, textNodeType, DataTableOptions} from "./types"

/**
 * Check is item is object
 */
export const isObject = (val: (string | number | boolean | object | null | undefined )) => Object.prototype.toString.call(val) === "[object Object]"

/**
 * Check for valid JSON string
 */
export const isJson = (str: string) => {
    let t = !1
    try {
        t = JSON.parse(str)
    } catch (e) {
        return !1
    }
    return !(null === t || (!Array.isArray(t) && !isObject(t))) && t
}

/**
 * Create DOM element node
 */
export const createElement = (nodeName: string, attrs?: { [key: string]: string}) => {
    const dom = document.createElement(nodeName)
    if (attrs && "object" == typeof attrs) {
        for (const attr in attrs) {
            if ("html" === attr) {
                dom.innerHTML = attrs[attr]
            } else {
                dom.setAttribute(attr, attrs[attr])
            }
        }
    }
    return dom
}

export const flush = (el: HTMLElement | HTMLElement[]) => {
    if (Array.isArray(el)) {
        el.forEach(e => flush(e))
    } else {
        el.innerHTML = ""
    }
}

/**
 * Create button helper
 */
export const paginationListItem = (className: string, linkClassName, page: number, text: string) => createElement(
    "li",
    {
        class: className,
        html: `<a href="#" class="${linkClassName}" data-page="${String(page)}">${text}</a>`
    }
)

/**
 * Pager truncation algorithm
 */
export const truncate = (paginationListItems: HTMLElement[], currentPage: number, pagesLength: number, options: DataTableOptions) => {
    const pagerDelta = options.pagerDelta || 2
    const classes = options.classes || {ellipsis: "datatable-ellipsis",
        active: "datatable-active"}
    const ellipsisText = options.ellipsisText || "&hellip;"

    const doublePagerDelta = 2 * pagerDelta
    let previousPage = currentPage - pagerDelta
    let nextPage = currentPage + pagerDelta

    if (currentPage < 4 - pagerDelta + doublePagerDelta) {
        nextPage = 3 + doublePagerDelta
    } else if (currentPage > pagesLength - (3 - pagerDelta + doublePagerDelta)) {
        previousPage = pagesLength - (2 + doublePagerDelta)
    }
    const paginationListItemsToModify: HTMLElement[] = []
    for (let k = 1; k <= pagesLength; k++) {
        if (1 == k || k == pagesLength || (k >= previousPage && k <= nextPage)) {
            const link = paginationListItems[k - 1]
            link.classList.remove(classes.active)
            paginationListItemsToModify.push(link)
        }
    }
    let previousLink: HTMLElement
    const modifiedLinks: HTMLElement[] = []
    paginationListItemsToModify.forEach(link => {
        const pageNumber = parseInt(link.children[0].getAttribute("data-page"), 10)
        if (previousLink) {
            const previousPageNumber = parseInt(previousLink.children[0].getAttribute("data-page"), 10)
            if (pageNumber - previousPageNumber == 2) {
                modifiedLinks.push(paginationListItems[previousPageNumber])
            } else if (pageNumber - previousPageNumber != 1) {
                const newLink = createElement("li", {
                    class: `${classes.paginationListItem} ${classes.ellipsis} ${classes.disabled}`,
                    html: `<a class="${classes.paginationListItemLink}">${ellipsisText}</a>`
                })
                modifiedLinks.push(newLink)
            }
        }
        modifiedLinks.push(link)
        previousLink = link
    })

    return modifiedLinks
}


export const objToText = (obj: (elementNodeType| textNodeType)) => {
    if (["#text", "#comment"].includes(obj.nodeName)) {
        return (obj as textNodeType).data
    }
    if (obj.childNodes) {
        return obj.childNodes.map((childNode: (elementNodeType | textNodeType)) => objToText(childNode)).join("")
    }
    return ""
}


export const escapeText = function(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}


export const visibleToColumnIndex = function(visibleIndex: number, columns: singleColumnSettingsType[]) {
    let counter = 0
    let columnIndex = 0
    while (counter < (visibleIndex+1)) {
        const columnSettings = columns[columnIndex] || {}
        if (!columnSettings.hidden) {
            counter += 1
        }
        columnIndex += 1
    }
    return columnIndex-1
}
