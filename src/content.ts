const BLUR_FILTER = "blur(6px)"
let textToBlur = ""

// Search this DOM node for text to blur and blur the parent element if found.
function processNode(node: Node) {
  if (node.childNodes.length > 0) {
    node.childNodes.forEach(processNode)
  }
  if (
    node.nodeType === Node.TEXT_NODE &&
    node.textContent !== null &&
    node.textContent.trim().length > 0
  ) {
    const parent = node.parentElement
    if (parent == null) {
      return
    }
    if (parent.tagName === "SCRIPT" || parent.style.filter === BLUR_FILTER) {
      // Already blurred
      return
    }
    if (node.textContent.includes(textToBlur)) {
      blurElement(parent)
    }
  }
}

function blurElement(elem: HTMLElement) {
  elem.style.filter = BLUR_FILTER
  console.debug(
    `blurred id: ${elem.id} class: ${elem.className} tag: ${elem.tagName} text: ${elem.textContent}`,
  )
}

// Create a MutationObserver to watch for changes to the DOM.
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        processNode(node)
      }
    } else {
      processNode(mutation.target)
    }
  }
})

// Enable the content script by default.
let enabled = true
const storageKeys = ["enabled", "item"]

function observe() {
  // Only start observing the DOM if the extension is enabled and there is text to blur.
  if (enabled && textToBlur.trim().length > 0) {
    observer.observe(document, {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
    })
    // Loop through all elements on the page for initial processing.
    processNode(document)
  }
}

chrome.storage.sync.get(storageKeys, ({ enabled, item }) => {
  if (enabled === false) {
    enabled = false
  }
  if (item) {
    textToBlur = item
  }
  observe()
})

// Listen for messages from popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.enabled !== undefined) {
    console.log("Received message from sender %s", sender.id, request)
    enabled = request.isEnabled
    if (enabled) {
      observe()
    } else {
      observer.disconnect()
    }
    sendResponse({ title: document.title, url: window.location.href })
  }
})
