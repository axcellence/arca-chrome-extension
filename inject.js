async function saveTokenToStorage() {
  console.log("Saving token to storage");
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    chrome.storage.local.set({ clerkToken: token }, () => {
      console.log('Token saved to Chrome storage');
    });
  } else {
    console.error('No Clerk token found');
  }
}

saveTokenToStorage();