let tabScreenshots = {};
let currentTabId = null;
function createModal() {
  if (document.getElementById("extension-modal")) return;

  const modal = document.createElement("div");
  
  modal.id = "extension-modal";
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <ul class="active-tab-container">
        
        </ul>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", () => {
    modal.remove();
  })

  // chrome.storage.local.get("tabScreenshots", (data) => {
  //    const container = modal.querySelector(".active-tab-container");
  //    const tabData = data.tabScreenshots;

  //    if (!tabData) {
  //     return;
  //    }
  //    for (const tabid in tabData) {
  //     const tab = tabData[tabid];
  //     const li = document.createElement("li");
  //     li.className = "tab-container"
  //     const image = document.createElement("img");
  //     if (tab.image) {
  //     image.src = tab.image;
  //     }
  //     else {
  //       image.alt = "loading preview...";
  //     }
      


  //     li.append(image);
  //     container.append(li);

  //    }

  // });
  chrome.runtime.sendMessage("get-tabs", (tabs) => {
    const container = modal.querySelector(".active-tab-container");
    
    if (!tabs || !Array.isArray(tabs)) {
      container.innerHTML = `<li>Failed to load tabs </li>`;
      return;
    }
    chrome.storage.local.get("tabScreenshots", (data)=>{
      const tabData = data.tabScreenshots;
      tabs.forEach((tab) => {
      const li = document.createElement("li");
      const image = document.createElement("img");
      const urlcontainer = document.createElement("div");
      const url = document.createElement("div");
      const closebtn = document.createElement("span");
      const preview = document.createElement("div");
      closebtn.className = "close-btn";
      url.className = "url";
      preview.className = "no-preview";
      preview.innerHTML = `<h1>No Preview Loaded</h1>`
      li.className = "tab-container";
      urlcontainer.className = "tab-url-container";
      url.textContent = tab.url;
      closebtn.innerHTML = `&times`;
      urlcontainer.appendChild(url);
      urlcontainer.appendChild(closebtn);
      li.appendChild(urlcontainer);

      if (tabData[tab.id]) {
        if (tabData[tab.id].image) {
            image.src = tabData[tab.id].image;
            li.appendChild(image);

        }
      

      }
      else {
           li.appendChild(preview);
      }
      container.appendChild(li);


      li.addEventListener("click", () => {
        chrome.runtime.sendMessage({action: "switch-tab", tabId: tab.id});
        modal.remove();
      });
      closebtn.addEventListener("click", () => {
          chrome.runtime.sendMessage({
            action: "close-tab", 
            tabId: tab.id,
            source: currentTabId
          });
      })
      });
    });


    });


}


function takeScreenshot() {
 chrome.runtime.sendMessage("screenshot-tab", (tabData) => {
 if (!tabData) {
      console.warn("Failed to capture tab data");
      return;
  }

  chrome.storage.local.get("tabScreenshots", (data) => {
    const existingImg = data.tabScreenshots || {};
    currentTabId = tabData.id;
    existingImg[tabData.id] = {
      id: tabData.id,
      image: tabData.image,
      title: tabData.title,
      url: tabData.url,
      favIconUrl: tabData.favIconUrl 
    }
      chrome.storage.local.set({ tabScreenshots: existingImg }, () => {
      console.log("Stored tab screenshot for ID:", tabData.id);
  });

  });
});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "reopen-modal") {
    createModal(); // Now it reopens
  }
});



/**
 * Call on background to take a screenshot of the current tab user is on
 */

takeScreenshot();


window.setInterval(takeScreenshot, 30);

// Listen for custom event
window.addEventListener("open-modal-box", createModal);
