importScripts('analytics.js');

chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "factcheck-selection",
    title: "RealityTracker: \"%s\" шалгах",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "factcheck-page",
    title: "RealityTracker: Энэ хуудсын мэдээг шалгах",
    contexts: ["page"]
  });
  if (details.reason === 'install') rtTrack('install');
  else if (details.reason === 'update') rtTrack('update', { prev: details.previousVersion });

  chrome.alarms.create('daily_ping', { periodInMinutes: 1440 });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'daily_ping') rtTrack('ping');
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "factcheck-selection" && info.selectionText) {
    chrome.storage.local.set({ pendingText: info.selectionText, pendingSource: "selection" }, () => {
      chrome.action.openPopup();
    });
  } else if (info.menuItemId === "factcheck-page") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = window.getSelection().toString();
        if (sel && sel.length > 20) return sel;
        const article = document.querySelector('article, [role="article"], .post-content, .news-content, main p');
        if (article) return article.innerText.slice(0, 800);
        return document.body.innerText.slice(0, 800);
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        chrome.storage.local.set({ pendingText: results[0].result, pendingSource: detectSource(tab.url) });
      }
    });
  }
});

function detectSource(url) {
  if (!url) return "other";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("instagram.com")) return "instagram";
  return "news";
}
