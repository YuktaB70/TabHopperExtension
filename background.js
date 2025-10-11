let tabScreenshots = {};
let lastActiveTabId = null;

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: showModal
  });
});



chrome.runtime.onStartup.addListener(()=> {
  chrome.storage.local.remove("tabScreenshots", () => {
  console.log("All tab data removed");
});
});



chrome.tabs.onRemoved.addListener((tabid, removedInfo) => {
  delete tabScreenshots[tabid];
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (lastActiveTabId !== null && lastActiveTabId !== activeInfo.tabId) {
    chrome.scripting.executeScript({
      target: {tabId: lastActiveTabId},
      func: removeModal
    });
  }
  lastActiveTabId = activeInfo.tabId;
 
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "get-tabs") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const openedTabs = tabs.map(tab => {
        return {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          image: null
        };

      });

      sendResponse(openedTabs);
    });
    return true;
  }
  if (message === "screenshot-tab") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0]; //retrieve the current tab
      if (!currentTab || currentTab.id === undefined) {
        sendResponse(null);
        return;
      }

      chrome.tabs.captureVisibleTab(currentTab.windowId, {format: "jpeg", quality: 60}, (res) => {
        if (chrome.runtime.lastError) { //error
          console.warn("Error: ", chrome.runtime.lastError.message);
          sendResponse(null);
          return;

        }
        const tabData = {
          id: currentTab.id,
          title: currentTab.title,
          url: currentTab.url,
          favIconUrl: currentTab.favIconUrl,
          image: res
        };
        lastActiveTabId = currentTab.id;
        sendResponse(tabData);
      });
    });
    return true;
  }
  if (message.action === "switch-tab" && message.tabId) {
      lastActiveTabId = message.tabId;
      chrome.tabs.update(message.tabId, { active: true });
    return true;
  }

  if (message.action === "close-tab" && message.tabId) {
    chrome.tabs.remove(message.tabId, () => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
      }
      chrome.tabs.update(message.source, { active: true });
      chrome.tabs.sendMessage(message.source, { action: "reopen-modal" });

      return true;

    });

}
});



function showModal() {
  // Trigger the modal from the content script
  window.dispatchEvent(new CustomEvent("open-modal-box"));
}

function removeModal() {
  window.dispatchEvent(new CustomEvent("close-modal"));
}