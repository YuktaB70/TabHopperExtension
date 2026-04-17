import "../content.js";
import "../tests/mocks/chrome.js";

describe("Content Script Tests", () => {
    test("open modal when Ctrl+B is pressed", () => {
        //Create the event
        const event = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });

        //dispatch the event 
        document.dispatchEvent(event);

        const modal = document.getElementById("extension-modal");
        expect(modal).not.toBeNull();
        // expect(modal.style.display).toBe("block");
    });
    //test with incorrect combination
    test("open modal when Crtl+Shift+B", () => {
        const event = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true,
            shiftKey: true
            });

        document.dispatchEvent(event);



        const modal = document.getElementById("#extension-modal"); 
        expect(modal).toBeNull();  
    })
    test("pressing Ctrl + B twice", () => {
        const event1 = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });
        const event2 = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });
        document.dispatchEvent(event1);
        document.dispatchEvent(event2);

        const modals = document.querySelectorAll("#extension-modal");
        expect(modals.length).toBe(1);

    });
    test("get number of tabs opened", () => {
        const event = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });

        //dispatch the event 
        document.dispatchEvent(event);
        const modal = document.getElementById("extension-modal");
        expect(modal).not.toBeNull();//we will always fail test if modal doesn't exist 
 
        const tabs = document.querySelectorAll(".tab-card");
        expect(tabs.length).toBe(2);

    });

    test("send get-tabs message", () => {
        const event = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });

        //dispatch the event 
        document.dispatchEvent(event);
        const modal = document.getElementById("extension-modal");
        expect(modal).not.toBeNull();//we will always fail test if modal doesn't exist
        
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith("get-tabs", expect.any(Function));

    })

    
    test("send screenshot-tab message", () => {
        const event = new KeyboardEvent("keydown", {
            key: "b",
            ctrlKey: true
        });

        //dispatch the event 
        document.dispatchEvent(event);
        const modal = document.getElementById("extension-modal");
        expect(modal).not.toBeNull();//we will always fail test if modal doesn't exist
        
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith("screenshot-tab", expect.any(Function));
        
    })

});



