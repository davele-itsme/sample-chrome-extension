import { setBadgeText } from "./common"

console.log("Hello, world from popup!")

// Handle the ON/OFF switch
const checkbox = document.getElementById("enabled") as HTMLInputElement
chrome.storage.sync.get("enabled", (data) => {
  checkbox.checked = !!data.enabled
  void setBadgeText(data.enabled)
})
checkbox.addEventListener("change", async (event) => {
  if (event.target instanceof HTMLInputElement) {
    void chrome.storage.sync.set({ enabled: event.target.checked })
    void setBadgeText(event.target.checked)
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id!, { enabled: event.target.checked })
        .then((response) => {
          console.info(
            "Popup received response from tab with title '%s' and url %s",
            response.title,
            response.url,
          )
        })
        .catch((error) => {
          console.warn("Popup could not send message to tab %d", tab.id, error)
        })
    }
  }
})

// Handle the input field
const input = document.getElementById("item") as HTMLInputElement
chrome.storage.sync.get("item", (data) => {
  input.value = data.item || ""
})
input.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    void chrome.storage.sync.set({ item: event.target.value })
  }
})
