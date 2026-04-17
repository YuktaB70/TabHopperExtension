

//Create a global chrome obj to mock real chrome environment and APIs 
global.chrome = {

    //When we call chrome apis at runtime, send back callback
    runtime: {
        sendMessage: jest.fn((message, callback) => {
            if (message === "get-tabs") {
                callback([
                    {id: 1, title: "Google", url: "https://google.com"},
                    {id: 2, title: "GitHub", url: "https://github.com"}
                ])
            }
            
            if (message === "screenshot-tab") {
                callback({
                    id: 1,
                    image: "fake-image-data",
                    title: "Google",
                    url: "https://google.com",
                    favIconUrl: ""
                });
            }

        }),
        //Mock background message listener
        onMessage: {
            addListener: jest.fn()
        },

    }, 


    //create fake storage 
    storage: {
        local: {
            //chrome.storage.local.get 
            get: jest.fn((key, callback) => {
                callback({ tabScreenshots: {} });
            }),
            //chrome.storage.local.set
            set: jest.fn((data, callback) => {
                callback();
            }),
    
        }
    }
}