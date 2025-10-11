let tabScreenshots = {};
let currentTabId = null;
let isOpen = false; 
const modal = document.createElement("div");

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLocaleLowerCase() == 'b') {
    createModal()
  }
})
function removeModal() {
  isOpen = false; 
  modal.remove();
}
function createModal() {
  isOpen = true; 
  if (document.getElementById("extension-modal")) return;

  
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
    isOpen = false;
    modal.remove();

  })

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
        isOpen = false; 

      });
      closebtn.addEventListener("click", () => {
          chrome.runtime.sendMessage({
            action: "close-tab", 
            tabId: tab.id,
            source: currentTabId
          });
          isOpen = false;

      })
      });
    });


    });


}


function takeScreenshot() {
  if (isOpen === false) {
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
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "reopen-modal") {
    createModal(); 
  }
});



/**
 * Call on background to take a screenshot of the current tab user is on
 */
takeScreenshot();

  window.setInterval(() => {
    if (isOpen == false) {
      takeScreenshot();
    }
  },  200);



// Listen for custom event
window.addEventListener("open-modal-box", createModal);
window.addEventListener("close-modal", removeModal);