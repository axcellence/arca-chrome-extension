chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message", message);
  if (message.type === 'SET_ARCA_TOKEN') {
    // Handle the storage operation
    try {
      chrome.storage.local.set({ arcatoken: message.token }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          console.log('Token saved in extension storage');
          sendResponse({ success: true });
        }
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }
  return false; // Don't keep message channel open for other message types
});

// Listen for bookmark button clicks
document.addEventListener("click", async (e) => {
  const bookmarkButton = e.target.closest('[data-testid="bookmark"]');
  console.log(bookmarkButton);
  if (bookmarkButton) {
    const tweetElement = bookmarkButton.closest("article");
    const tweetId = extractTweetIdFromElement(tweetElement);
    if (tweetId) {
      chrome.runtime.sendMessage({
        action: "saveBookmark",
        tweetId,
      });
    }
  }
});

// Handle keyboard shortcut
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "saveTweetFromPage") {
    const tweetId = extractTweetIdFromUrl() || extractTweetIdFromPage() || "0000";
    console.log("tweetId", tweetId);
    if (tweetId) {
      chrome.runtime.sendMessage({
        action: "saveBookmark",
        tweetId,
      });
    }
  }
});

// Listen for postMessage from the webpage
window.addEventListener("message", function (event) {
  // In production, verify event.origin
  if (event.data.type === "AUTH_TOKEN") {
    console.log("event", event.data);
    // Relay the message to the background script
    chrome.runtime.sendMessage({
      type: "PAGE_MESSAGE",
      data: event.data,
    });
  }
});

function extractTweetIdFromUrl() {
  const match = window.location.pathname.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

function extractTweetIdFromPage() {
  const article = document.querySelector("article[data-tweet-id]");
  return article ? article.dataset.tweetId : null;
}

function extractTweetIdFromElement(element) {
  return element?.dataset?.tweetId;
}
