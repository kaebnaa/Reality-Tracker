document.addEventListener('mouseup', () => {
  try {
    const sel = window.getSelection().toString().trim();
    if (sel && sel.length > 30 && sel.length < 5000) {
      chrome.storage.local.set({
        selectedText: sel,
        currentUrl: window.location.href,
        pageTitle: document.title
      });
    }
  } catch(e) {}
});
