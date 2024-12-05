document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');
  const { token } = await chrome.storage.local.get('token');
  
  status.textContent = token ? 'Signed in' : 'Not signed in';
  
  document.getElementById('login').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://your-app.com/login?redirect=/extension-auth'
    });
  });
  
  document.getElementById('logout').addEventListener('click', async () => {
    await chrome.storage.local.remove('token');
    status.textContent = 'Not signed in';
  });
});