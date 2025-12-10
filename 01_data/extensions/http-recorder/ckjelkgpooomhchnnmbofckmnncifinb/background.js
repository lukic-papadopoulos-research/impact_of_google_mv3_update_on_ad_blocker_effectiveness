var recordedData = [];
var lastVisitedPages = [];

// Record HTTP requests 
chrome.webRequest.onCompleted.addListener(
  function(details) {
    recordedData.push(details);
  }, 
  { urls: ["<all_urls>"] }
);

// Listen for tab URL updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    if (!changeInfo.url.startsWith("chrome://") && 
        !changeInfo.url.startsWith("chrome-extension://") && 
        !changeInfo.url.startsWith("https://welcome.adguard.com/")) {
      lastVisitedPages.push(changeInfo.url);
    }
  }
});

// Message listener to send recorded data and last visited page.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.cmd === "getData") {
      sendResponse(recordedData);
    } 
    else if (request.cmd === "getLastVisitedPage") {
      sendResponse(lastVisitedPages[lastVisitedPages.length - 1]);
    }
  }
);

// Listen for message events from the webpage
window.addEventListener('message', function(event) {
  // Check the origin of the message
  if (event.source !== window)
    return;

  // Check the message content
  if (event.data.type && (event.data.type == 'FETCH_HTTP_DATA')) {
    // Send back recorded HTTP data to the webpage
    window.postMessage({type: 'HTTP_DATA', trafficData: recordedData}, '*');
  }
}, false);
