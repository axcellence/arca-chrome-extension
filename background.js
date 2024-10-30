chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    if (details.method === "POST" && details.url.includes("/CreateBookmark")) {
      try {
        const requestBody = details.requestBody;
        if (!requestBody || !requestBody.raw) {
          throw new Error("No request body available");
        }

        const decoder = new TextDecoder();
        const rawData = requestBody.raw[0].bytes;
        const bodyString = decoder.decode(rawData);
        const bodyData = JSON.parse(bodyString);
        const tweetId = bodyData?.variables?.tweet_id;
        if (!tweetId) {
          throw new Error("No tweet ID found in the request body");
        }
        await saveTweet(tweetId);
      } catch (error) {
        console.error("Error saving bookmark:", error);
      }
    }
  },
  { urls: ["*://*.twitter.com/*", "*://*.x.com/*"] },
  ["requestBody"],
);

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "save-tweet") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, { action: "saveTweetFromPage" });
  }
});

async function saveTweet(tweetId) {
  console.log(`Saving tweet with ID to Arca: ${tweetId}`);
  const response = await fetch("http://localhost:3000/api/save-tweets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweetId }),
  });
  return response.json();
}
