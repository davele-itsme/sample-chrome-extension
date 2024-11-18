import { Message, setBadgeText, StoredConfig, TabInfo } from "./common"

console.log("Hello, world from popup!")

// Handle the ON/OFF switch
const checkbox = document.getElementById("enabled") as HTMLInputElement
chrome.storage.sync.get("enabled", (data) => {
  const config = data as StoredConfig
  checkbox.checked = !!config.enabled
  void setBadgeText(!!config.enabled)
})
checkbox.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    void chrome.storage.sync.set({ enabled: event.target.checked })
    void setBadgeText(event.target.checked)
    const message: Message = { enabled: event.target.checked }
    chrome.tabs
      .query({})
      .then((tabs) => {
        for (const tab of tabs) {
          chrome.tabs
            .sendMessage(tab.id!, message)
            .then((response) => {
              const tabInfo = response as TabInfo
              console.info(
                "Popup received response from tab with title '%s' and url %s",
                tabInfo.title,
                tabInfo.url,
              )
            })
            .catch((error) => {
              console.warn(
                "Popup could not send message to tab %d",
                tab.id,
                error,
              )
            })
        }
      })
      .catch((error) => {
        console.error("Popup could not query the tabs", error)
      })
  }
})

// Handle the input field
const input = document.getElementById("item") as HTMLInputElement
chrome.storage.sync.get("item", (data) => {
  const config = data as StoredConfig
  input.value = config.item ?? ""
})
input.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    void chrome.storage.sync.set({ item: event.target.value })
  }
})
