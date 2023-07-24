async function updateTabIcon(tab: chrome.tabs.Tab) : Promise<void> {
  if (tab && 'url' in tab && tab.url) {    
    if (/^https:\/\/learn\.umgc\.edu\/d2l\//.test(tab.url)) {
      await chrome.action.setBadgeBackgroundColor({color: [0, 80, 0, 255]});
      await chrome.action.setBadgeText({
        text: 'ON',
        tabId: tab.id
      });
    }
  } else {
    await chrome.action.setBadgeBackgroundColor({color: [80, 0, 0, 255]});
    await chrome.action.setBadgeText({
      text: 'OFF',
      tabId: tab.id
    });
  }
}

chrome.tabs.onActivated.addListener(async info => {
  var tab = await chrome.tabs.get(info.tabId);
  await updateTabIcon(tab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await updateTabIcon(tab);
});

chrome.action.onClicked.addListener(tab => {
  chrome.runtime.openOptionsPage();
});