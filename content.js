// Listen for bookmark button clicks
document.addEventListener('click', async (e) => {
  const bookmarkButton = e.target.closest('[data-testid="bookmark"]');
  console.log(bookmarkButton);
  if (bookmarkButton) {
    const tweetElement = bookmarkButton.closest('article');
    const tweetId = extractTweetIdFromElement(tweetElement);
    if (tweetId) {
      chrome.runtime.sendMessage({ 
        action: "saveBookmark", 
        tweetId 
      });
    }
  }
});

// Handle keyboard shortcut
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "saveTweetFromPage") {
    const tweetId = extractTweetIdFromUrl() || extractTweetIdFromPage();
    if (tweetId) {
      chrome.runtime.sendMessage({ 
        action: "saveBookmark", 
        tweetId 
      });
    }
  }
});

function extractTweetIdFromUrl() {
  const match = window.location.pathname.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

function extractTweetIdFromPage() {
  const article = document.querySelector('article[data-tweet-id]');
  return article ? article.dataset.tweetId : null;
}

function extractTweetIdFromElement(element) {
  return element?.dataset?.tweetId;
}