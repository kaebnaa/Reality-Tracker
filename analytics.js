const RT_URL = 'https://egmfkfkwmrzxtbtpleht.supabase.co';
const RT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbWZrZmt3bXJ6eHRidHBsZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTkzMjAsImV4cCI6MjA5NTMzNTMyMH0.cxHMc-6t7OgEEpsSSbG8T6bWudJNZzelbHDBju-_8Dc';

async function rtGetUserId() {
  return new Promise(resolve => {
    chrome.storage.local.get('rt_uid', r => {
      if (r.rt_uid) { resolve(r.rt_uid); return; }
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      arr[6] = (arr[6] & 0x0f) | 0x40;
      arr[8] = (arr[8] & 0x3f) | 0x80;
      const hex = [...arr].map(b => b.toString(16).padStart(2, '0')).join('');
      const uid = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
      chrome.storage.local.set({ rt_uid: uid }, () => resolve(uid));
    });
  });
}

async function rtTrack(event, extra = {}) {
  try {
    const uid = await rtGetUserId();
    const version = chrome.runtime?.getManifest?.()?.version || '1.2.0';
    await fetch(RT_URL + '/rest/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': RT_KEY,
        'Authorization': 'Bearer ' + RT_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ user_id: uid, event, version, ...extra })
    });
  } catch(e) {}
}
