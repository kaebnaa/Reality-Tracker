const RT_URL = 'https://egmfkfkwmrzxtbtpleht.supabase.co';
const RT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbWZrZmt3bXJ6eHRidHBsZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTkzMjAsImV4cCI6MjA5NTMzNTMyMH0.cxHMc-6t7OgEEpsSSbG8T6bWudJNZzelbHDBju-_8Dc';

const RT_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': RT_KEY,
  'Authorization': 'Bearer ' + RT_KEY,
  'Prefer': 'return=minimal'
};

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

// Unique хэрэглэгчийг upsert хийж last_seen шинэчилнэ
async function rtUpsertUser(uid, version, isInstall = false) {
  try {
    await fetch(RT_URL + '/rest/v1/users', {
      method: 'POST',
      headers: { ...RT_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: uid,
        last_seen: new Date().toISOString(),
        version,
        ...(isInstall ? { install_count: 1 } : {})
      })
    });
  } catch(e) {}
}

// Шалгалтын дүнг checks хүснэгтэд хадгална
async function rtSaveCheck(uid, version, payload) {
  try {
    const sc = payload.scores || {};
    const sa = payload.scamAnalysis || {};
    const domainVerdicts = (payload.domainAnalysis || []).map(d => ({
      domain: d.domain,
      verdict: d.verdict,
      confidence: d.confidence
    }));
    await fetch(RT_URL + '/rest/v1/checks', {
      method: 'POST',
      headers: RT_HEADERS,
      body: JSON.stringify({
        user_id: uid,
        version,
        source:              payload.source || 'other',
        model:               payload.model || '',
        text_snippet:        (payload.textSnippet || '').slice(0, 200),
        verdict:             payload.verdict || 'unknown',
        overall_credibility: Math.round(parseFloat(sc.overallCredibility) || 0),
        factual_accuracy:    Math.round(parseFloat(sc.factualAccuracy) || 0),
        source_reliability:  Math.round(parseFloat(sc.sourceReliability) || 0),
        emotional_manip:     Math.round(parseFloat(sc.emotionalManipulation) || 0),
        scam_risk:           Math.min(100, Math.max(0, parseInt(sa.riskScore) || 0)),
        scam_type:           sa.scamType || null,
        red_flags:           sa.redFlags || [],
        domain_verdicts:     domainVerdicts,
        claim_count:         (payload.claims || []).length
      })
    });
    // check_count нэмэх
    await fetch(RT_URL + '/rest/v1/rpc/increment_check_count', {
      method: 'POST',
      headers: RT_HEADERS,
      body: JSON.stringify({ uid })
    });
  } catch(e) {}
}

async function rtTrack(event, extra = {}) {
  try {
    const uid = await rtGetUserId();
    const version = chrome.runtime?.getManifest?.()?.version || '1.2.0';
    const isInstall = event === 'install';
    await rtUpsertUser(uid, version, isInstall);
    await fetch(RT_URL + '/rest/v1/events', {
      method: 'POST',
      headers: RT_HEADERS,
      body: JSON.stringify({ user_id: uid, event, version, ...extra })
    });
  } catch(e) {}
}
