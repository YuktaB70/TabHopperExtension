const { TestEnvironment } = require("jest-environment-jsdom");


module.exports = {
    testEnvironment: "jsdom", //simulates browser environment
    setupFiles: [
        "<rootDir>/tests/mocks/chrome.js" //mocks the chrome API for testing purposes
    ], 
    transform: {
            "^.+\\.js$": "babel-jest"
    }

};