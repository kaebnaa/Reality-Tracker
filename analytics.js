const RT_URL = 'https://egmfkfkwmrzxtbtpleht.supabase.co';
const RT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbWZrZmt3bXJ6eHRidHBsZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTkzMjAsImV4cCI6MjA5NTMzNTMyMH0.cxHMc-6t7OgEEpsSSbG8T6bWudJNZzelbHDBju-_8Dc';
const RT_VERSION = '1.2.0';

const RT_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': RT_KEY,
  'Authorization': 'Bearer ' + RT_KEY,
  'Prefer': 'return=minimal'
};

// ---------- helpers ----------

async function rtGetUserId() {
  return new Promise(resolve => {
    chrome.storage.local.get('rt_uid', r => {
      if (r.rt_uid) { resolve(r.rt_uid); return; }
      const uid = crypto.randomUUID();
      chrome.storage.local.set({ rt_uid: uid }, () => resolve(uid));
    });
  });
}

function chromeGet(key) {
  return new Promise(resolve => chrome.storage.local.get(key, r => resolve(r[key])));
}

function chromeSet(obj) {
  return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}

// ---------- retry fetch ----------

async function rtFetch(url, options, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      // 4xx клиент алдаа — retry хийхгүй
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text().catch(() => '');
        console.error('[RT] HTTP ' + res.status, url, body);
        return null;
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, i))); // 500ms, 1s, 2s
      }
    }
  }
  console.error('[RT] fetch failed after ' + retries + ' retries:', url, lastErr);
  return null;
}

// ---------- offline queue ----------

async function rtEnqueue(item) {
  try {
    const existing = (await chromeGet('rt_queue')) || [];
    existing.push(item);
    // Queue-г 100-аас хэтрүүлэхгүй
    const trimmed = existing.slice(-100);
    await chromeSet({ rt_queue: trimmed });
  } catch (e) {
    console.error('[RT] enqueue error:', e);
  }
}

async function rtFlushQueue() {
  try {
    const queue = (await chromeGet('rt_queue')) || [];
    if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      const ok = await rtSendQueued(item);
      if (!ok) remaining.push(item);
    }
    await chromeSet({ rt_queue: remaining });
  } catch (e) {
    console.error('[RT] flush error:', e);
  }
}

async function rtSendQueued(item) {
  // Queue poisoning хамгаалалт: зөвхөн өөрийн Supabase URL-г зөвшөөрнө
  if (!item.url || !item.url.startsWith(RT_URL + '/')) {
    console.error('[RT] queue: blocked untrusted URL', item.url);
    return true; // drop — retry хийхгүй
  }
  try {
    const res = await rtFetch(item.url, item.options, 1);
    return res !== null;
  } catch (e) {
    return false;
  }
}

// ---------- core API calls ----------

async function rtUpsertUser(uid, version, isInstall = false) {
  const url = RT_URL + '/rest/v1/users';
  const options = {
    method: 'POST',
    headers: { ...RT_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: uid,
      last_seen: new Date().toISOString(),
      version,
      ...(isInstall ? { install_count: 1 } : {})
    })
  };
  const res = await rtFetch(url, options);
  if (!res) await rtEnqueue({ url, options });
}

async function rtIncrementCheckCount(uid) {
  const url = RT_URL + '/rest/v1/rpc/increment_check_count';
  const options = {
    method: 'POST',
    headers: RT_HEADERS,
    body: JSON.stringify({ uid })
  };
  const res = await rtFetch(url, options);
  if (!res) await rtEnqueue({ url, options });
}

async function rtInsertCheck(uid, version, payload) {
  const sc = payload.scores || {};
  const sa = payload.scamAnalysis || {};
  const domainVerdicts = (payload.domainAnalysis || []).map(d => ({
    domain: d.domain,
    verdict: d.verdict,
    confidence: d.confidence
  }));

  const url = RT_URL + '/rest/v1/checks';
  const options = {
    method: 'POST',
    headers: { ...RT_HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      user_id:             uid,
      version,
      source:              'extension',
      platform:            payload.source || 'other',
      model:               payload.model || '',
      text_snippet:        (payload.textSnippet || '').slice(0, 200),
      full_text:           payload.textSnippet || null,
      verdict:             payload.verdict || 'unknown',
      overall_credibility: Math.round(parseFloat(sc.overallCredibility) || 0),
      factual_accuracy:    Math.round(parseFloat(sc.factualAccuracy) || 0),
      source_reliability:  Math.round(parseFloat(sc.sourceReliability) || 0),
      emotional_manip:     Math.round(parseFloat(sc.emotionalManipulation) || 0),
      scam_risk:           Math.min(100, Math.max(0, parseInt(sa.riskScore) || 0)),
      scam_type:           sa.scamType || null,
      red_flags:           sa.redFlags || [],
      domain_verdicts:     domainVerdicts,
      claim_count:         (payload.claims || []).length,
      raw_result:          payload.rawResult || null,
      source_url:          payload.sourceUrl ? (() => { try { return new URL(payload.sourceUrl).hostname; } catch(e) { return null; } })() : null,
      page_title:          payload.pageTitle || null,
      language:            payload.language || 'mn'
    })
  };
  const res = await rtFetch(url, options);
  if (!res) { await rtEnqueue({ url, options: { ...options, headers: RT_HEADERS } }); return null; }
  try {
    const rows = await res.json();
    return Array.isArray(rows) && rows[0] ? rows[0].id : null;
  } catch (e) {
    return null;
  }
}

// ---------- public API ----------

/**
 * Шалгалтын дүнг бүрэн бүртгэнэ:
 * 1. users upsert (last_seen)
 * 2. increment_check_count RPC
 * 3. checks insert
 */
async function rtSaveCheck(uid, version, payload) {
  try {
    await rtFlushQueue();
    await rtUpsertUser(uid, version, false);
    await rtIncrementCheckCount(uid);
    const checkId = await rtInsertCheck(uid, version, payload);
    return checkId;
  } catch (e) {
    console.error('[RT] rtSaveCheck error:', e);
    return null;
  }
}

/**
 * install / update / ping зэрэг event бүртгэнэ
 */
async function rtTrack(event, extra = {}) {
  try {
    await rtFlushQueue();
    const uid = await rtGetUserId();
    const version = chrome.runtime?.getManifest?.()?.version || RT_VERSION;
    const isInstall = event === 'install';
    await rtUpsertUser(uid, version, isInstall);

    const url = RT_URL + '/rest/v1/events';
    const options = {
      method: 'POST',
      headers: RT_HEADERS,
      body: JSON.stringify({ user_id: uid, event, version, ...extra })
    };
    const res = await rtFetch(url, options);
    if (!res) await rtEnqueue({ url, options });
  } catch (e) {
    console.error('[RT] rtTrack error:', e);
  }
}
