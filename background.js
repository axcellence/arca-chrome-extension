const appUrl = "http://localhost:3000";

/**
 * Get the type of artifact based on the URL
 * @param {string} url - The URL of the artifact
 * @returns {'youtube' | 'tweet' | 'tiktok' | 'link'} - The type of artifact
 */
function getArtifactLinkType(url) {
  switch (true) {
    case url.includes("youtube.com") || url.includes("youtu.be"):
      return "youtube";
    case url.includes("twitter.com") || url.includes("x.com"):
      return "tweet";
    case url.includes("tiktok.com"):
      return "tiktok";
    default:
      return "link";
  }
}

/**
 * Save an artifact to Arca
 * @param {string} artifact - The artifact to save
 * @param {'link' | 'tweet' | 'image' | 'text' | 'youtube'} type - The type of artifact to save
 * @param {string} source - The source URL of the artifact
 * @returns {Promise<Object>} - The response from the Arca API
 */
async function saveArtifact(artifact, type, source) {
  console.log(`Saving ${type} artifact to Arca: ${artifact}`);
  try {
    const token = await getToken();

    if (!token) {
      console.error("No token found.");
      signIn();
    }
    const response = await fetch(`${appUrl}/api/save-artifacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-arca-extension": "true",
      },
      body: JSON.stringify({ artifact, type, source }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await chrome.cookies.remove({ url: appUrl, name: "__session" });
        signIn();
      }
      const { error } = await response.json();
      throw new Error(error || response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error saving artifact:", error);
  }
}

// add context menu

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-link-artifact",
    title: "Add link to Arca",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "save-page-artifact",
    title: "Add page to Arca",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "save-image-artifact",
    title: "Add image to Arca",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "save-text-artifact",
    title: "Add text to Arca",
    contexts: ["selection"],
  });
});

// Update context menu based on page URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || tab.url) {
    const url = changeInfo.url || tab.url;
    if (url.includes('twitter.com') || url.includes('x.com')) {
      chrome.contextMenus.update('save-page-artifact', {
        title: 'Add tweet to Arca'
      });
    } else {
      chrome.contextMenus.update('save-page-artifact', {
        title: 'Add page to Arca'
      });
    }
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log(info);
  if (
    info.menuItemId === "save-link-artifact" ||
    info.menuItemId === "save-page-artifact"
  ) {
    try {
      const artifact = info.linkUrl || info.frameUrl || info.pageUrl;
      await saveArtifact(artifact, getArtifactLinkType(artifact), artifact);
    } catch (error) {
      console.error("Error saving artifact:", error);
    }
  }
  if (info.menuItemId === "save-text-artifact") {
    try {
      await saveArtifact(
        info.selectionText,
        "text",
        info.frameUrl || info.pageUrl,
      );
    } catch (error) {
      console.error("Error extracting artifact:", error);
    }
  }
  if (info.menuItemId === "save-image-artifact") {
    try {
      await saveArtifact(info.srcUrl, "image", info.frameUrl || info.pageUrl);
    } catch (error) {
      console.error("Error extracting artifact:", error);
    }
  }
});

const getToken = async () => {
  const cookie = await chrome.cookies.get({ url: appUrl, name: "__session" });
  if (cookie) {
    return cookie.value;
  } else {
    console.error("No token found.");
  }
};

function signIn() {
  // open a new tab with the sign in page
  chrome.tabs.create({ url: `${appUrl}/sign-in` });
}
