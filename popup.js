let currentSrc = 'facebook';

const srcLabels = {
  facebook: 'Facebook постын текст оруулна уу',
  twitter: 'X/Twitter твит оруулна уу',
  instagram: 'Instagram caption оруулна уу',
  news: 'Мэдээний нийтлэлийн текст оруулна уу',
  other: 'Шалгах текстийг оруулна уу'
};

const loadSteps = [
  'Вэб хайлт хийж холбогдох мэдээлэл цуглуулж байна...',
  'Луйварын шинж тэмдэг шалгаж байна...',
  'Claim-үүдийг ялгаж байна...',
  'Шинжлэх ухааны мэдлэгтэй харьцуулж байна...',
  'Эрх зүй, эдийн засгийн өнцгөөс шинжилж байна...',
  'Хуурамч мэдээллийн арга техникийг илрүүлж байна...',
  'Бодит болон худал хэсгийг ялгаж байна...',
  'Нэгдсэн дүгнэлт гаргаж байна...'
];

let stepTimer, apiKey = '', selectedModel = 'gemini-3.5-flash';

const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b'
];

const CONTEXT_SYS = `Та вэб хайлтаар мэдээлэл цуглуулах туслах AI. Дараах текстэд дурдагдсан хүн, байгууллага, URL, утасны дугаар, санал болгосон бизнесийн талаар вэб хайлт хийж байна.

Дараахыг олж мэд:
- Энэ байгууллага эсвэл хүний талаар луйвар, залилан гэсэн мэдэгдэл байгаа эсэх
- URL эсвэл домэйн хуурамч эсэх
- Утасны дугаар луйварт бүртгэлтэй эсэх
- Ижил схемийн луйвар өмнө мэдэгдсэн эсэх
- Монгол болон олон улсын мэдээнд дурдагдсан эсэх

Олсон мэдээллээ товч монголоор бич. Хэрэв мэдээлэл олдоогүй бол "Холбогдох мэдээлэл олдсонгүй" гэж бич.`;

const SYS = `Та бол RealityTracker — олон салбарын мэдлэг бүхий факт-чекер болон луйвар илрүүлэгч AI систем. Дараах 9 салбарын гүн мэдлэгтэй:
1. ШИНЖЛЭХ УХААН — физик, хими, биологи, одон орон, цаг уур
2. ЭРХ ЗҮЙ — Монгол хууль, олон улсын гэрээ, хүний эрх
3. ЭДИЙН ЗАСАГ — макро/микро эдийн засаг, санхүү, статистик
4. ЭРҮҮЛ МЭНД — анагаах ухаан, эм тарилга, эрүүл мэндийн судалгаа
5. БАЙГАЛЬ ОРЧИН — экологи, цаг уур, газрын хэвлий
6. НИЙГЭМ, СЭТГЭЛ ЗҮЙ — нийгмийн зан үйл, сэтгэл зүй
7. УЛСТӨР, ТҮҮХ — Монгол болон дэлхийн түүх, улс төрийн систем
8. ТЕХНОЛОГИ — IT, кибер аюулгүй байдал, phishing
9. ЛУЙВАР & ЗАЛИЛАН — санхүүгийн луйвар, pyramid scheme, romance scam, phishing, хуурамч бараа/ажил, crypto луйвар

## ШИНЖИЛГЭЭНИЙ ҮНДСЭН ЗАРЧИМ
1. ЗӨВХӨН тогтсон, баталгаажсан мэдлэгт тулгуурла. Шинэ мэдлэг, онол, тайлбар бий болгохгүй.
2. Шинжлэх ухааны нийтлэг зөвшил (scientific consensus), засгийн газрын баталсан стандарт, peer-reviewed судалгааг үндэс болго.
3. Маргаантай эсвэл шинжлэх ухааны нотлогдоогүй асуудалд: "маргаантай" гэж тодорхойлж, хоёр талын байр суурийг тайлбарла.
4. Мэдэхгүй бол шууд хэл: "батлах боломжгүй", "мэдээлэл хангалтгүй", "шалгах боломжгүй".
5. Хугацааны хязгаарлалт: мэдлэгийн огтлолоос (training cutoff) хойших үйл явдлыг "шинэ мэдээ шаардлагатай" гэж тэмдэглэ.
6. Дүгнэлт бүрд ямар эх сурвалжид тулгуурлаж байгааг тодорхойлох: "тогтсон зөвшил", "нэгдсэн судалгаа", "маргаантай", "мэдээлэл дутуу".

## ЛУЙВАРЫН ШИН ТЭМДЭГ
Яаралтай шахалт ("өнөөдөр л", "хязгаарлагдмал"), хэт сайн санал ("100% ашиг", "эрсдэлгүй"), мөнгө шилжүүлэх хүсэлт, хувийн мэдээлэл хүсэх, хуурамч амжилтын гэрчилгээ, хилийн чанад ажлын санал, crypto буцаан авах луйвар, хожлоо мэдэгдэх.

## ОНОО ТООЦОХ RUBRIC (0-100)
factualAccuracy: 95-100 тогтсон эх сурвалжаар баталгаажсан | 80-94 үндсэн баримт зөв | 60-79 хагас зөв | 40-59 гуйвуулсан | 20-39 голдуу худал | 0-19 бүрэн худал
sourceReliability: 90-100 засгийн газар/peer-reviewed | 70-89 томоохон мэдиа | 50-69 тогтмол мэдээ | 30-49 нэрээ нууцалсан | 10-29 социал медиа | 0-9 эх сурвалжгүй
contextCompleteness: 90-100 бүрэн | 70-89 үндсэн бий | 50-69 дутуу | 30-49 санаатай орхигдуулсан | 10-29 бараг байхгүй | 0-9 бүрэн гуйвуулсан
emotionalManipulation (өндөр=аюултай): 0-10 тайван | 11-30 бага зэрэг | 31-50 илт | 51-70 давамгайлна | 71-90 системтэй | 91-100 пропаганда
statisticalValidity: 90-100 зөв эх сурвалжтай | 70-89 зөв боловч дутуу | 50-69 cherry-picking | 30-49 гуйвуулсан | 10-29 худал | 0-9 байхгүй
overallCredibility = (factualAccuracy x 0.35)+(sourceReliability x 0.20)+(contextCompleteness x 0.20)+((100-emotionalManipulation) x 0.15)+(statisticalValidity x 0.10)

## VERDICT ШАЛГУУР
"true": overallCredibility >= 80 БА factualAccuracy >= 75
"partial": overallCredibility 45-79 ЭСВЭЛ factualAccuracy 40-74
"false": overallCredibility < 45 ЭСВЭЛ factualAccuracy < 40
"unknown": мэдээлэл хангалтгүй, огтлолоос хойш, эсвэл sourceReliability < 20

## ХУУРАМЧ МЭДЭЭЛЛИЙН ТЕХНИК
Cherry-picking, False equivalence, Strawman, Ad hominem, Appeal to authority, Bandwagon, Fear-mongering, Selective statistics, Out-of-context quote, Fabricated source

ЧУХАЛ ДҮРЭМ: Зөвхөн доорх JSON форматаар хариулна. Markdown код блок, тайлбар, нэмэлт текст огт бичихгүй. Хариу нь яг { тэмдэгтээс эхэлж } тэмдэгтээр дуусна.

JSON ФОРМАТ:
{"verdict":"true|partial|false|unknown","verdictLabel":"Үнэн|Хагас үнэн|Худал|Шалгах боломжгүй","verdictIcon":"true|partial|false|unknown","summary":"2-3 өгүүлбэрт дүгнэлт","limitations":["батлах боломжгүй зүйл 1","шинэ мэдээ шаардлагатай зүйл 2"],"scamAnalysis":{"riskScore":0,"scamType":"луйвар биш|санхүүгийн|romantic|phishing|бараа|ажил|pyramid|crypto|тодорхойгүй","redFlags":[],"webFindings":"вэб хайлтын дүн"},"scores":{"factualAccuracy":0,"sourceReliability":0,"contextCompleteness":0,"emotionalManipulation":0,"statisticalValidity":0,"overallCredibility":0},"domainAnalysis":[{"domain":"салбар нэр","icon":"emoji","verdict":"true|partial|false|na","verdictLabel":"Үнэн|Хагас үнэн|Худал|Хамаарахгүй","basis":"тогтсон зөвшил|нэгдсэн судалгаа|маргаантай|мэдээлэл дутуу|шалгах боломжгүй","confidence":0,"analysis":"2 өгүүлбэр — ямар эх сурвалжид тулгуурласан тайлбар"}],"claims":[{"text":"claim","verdict":"true|partial|false|unknown","confidence":0,"explanation":"тайлбар"}],"misinformationTechniques":[{"type":"ТЕХНИКИЙН НЭР","severity":"high|medium","description":"тайлбар"}],"realVsFake":{"realParts":["жагсаалт"],"fakeParts":["жагсаалт"],"missingContext":["жагсаалт"]},"sources":[{"name":"нэр","relevance":"тайлбар","type":"official|news|research|web"}]}
domainAnalysis-д зөвхөн 3-5 хамааралтай салбарыг оруулна. Шинэ мэдлэг бий болгохгүй — зөвхөн тогтсон эх сурвалжид тулгуурла.`;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  // Event listener-уудыг эхэлж синхрон байдлаар залгана
  document.getElementById('save-api-btn').addEventListener('click', saveApiKey);
  document.getElementById('check-btn').addEventListener('click', doCheck);
  document.getElementById('selected-banner').addEventListener('click', useSelected);
  document.getElementById('settings-toggle').addEventListener('click', () => {
    const isSettings = document.getElementById('view-settings').classList.contains('active');
    if (isSettings && apiKey) showView('main');
    else showView('settings');
  });
  document.querySelectorAll('.stab').forEach(btn => {
    btn.addEventListener('click', () => setSrc(btn, btn.dataset.src));
  });

  // Async өгөгдөл уншилт тусдаа функцад
  initStorage();
});

async function initStorage() {
  try {
    const [stored, storedModel, pending, selected] = await Promise.all([
      chromeGet('gemini_api_key'),
      chromeGet('gemini_model'),
      chromeGet('pendingText'),
      chromeGet('selectedText')
    ]);

    if (storedModel) {
      selectedModel = storedModel;
      document.getElementById('model-select').value = storedModel;
    }

    if (stored) {
      apiKey = stored;
      document.getElementById('api-key-input').value = stored;
      showView('main');
    } else {
      showView('settings');
    }

    if (pending) {
      document.getElementById('text-input').value = pending;
      const src = (await chromeGet('pendingSource')) || 'other';
      const tab = document.querySelector(`.stab[data-src="${src}"]`);
      if (tab) setSrc(tab, src);
      chrome.storage.local.remove(['pendingText', 'pendingSource']);
    }

    if (selected && selected.length > 30) {
      document.getElementById('selected-banner').style.display = 'block';
    }
  } catch (e) {
    showView('settings');
  }
}

function chromeGet(key) {
  return new Promise(resolve => chrome.storage.local.get(key, r => resolve(r[key])));
}

function showView(name) {
  ['settings', 'main', 'result'].forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.toggle('active', v === name);
  });
  document.getElementById('view-loading').style.display = 'none';
}

function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  const model = document.getElementById('model-select').value;
  if (!key) return;
  chrome.storage.local.set({ gemini_api_key: key, gemini_model: model }, () => {
    apiKey = key;
    selectedModel = model;
    const msg = document.getElementById('saved-msg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; showView('main'); }, 1200);
  });
}

function setSrc(el, src) {
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentSrc = src;
  document.getElementById('inp-label').textContent = srcLabels[src];
}

async function useSelected() {
  const sel = await chromeGet('selectedText');
  if (sel) {
    document.getElementById('text-input').value = sel;
    document.getElementById('selected-banner').style.display = 'none';
    chrome.storage.local.remove('selectedText');
  }
}

function showErr(msg) {
  const b = document.getElementById('error-box');
  b.textContent = '⚠ ' + msg;
  b.style.display = 'block';
}

async function doCheck() {
  const text = document.getElementById('text-input').value.trim();
  document.getElementById('error-box').style.display = 'none';
  if (!apiKey) { showView('settings'); return; }
  if (!text) { showErr('Шалгах текстийг оруулна уу.'); return; }

  document.getElementById('check-btn').disabled = true;
  ['settings', 'main', 'result'].forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.remove('active');
  });
  document.getElementById('view-loading').style.display = 'block';

  let si = 0;
  document.getElementById('load-step').textContent = loadSteps[0];
  stepTimer = setInterval(() => {
    si = (si + 1) % loadSteps.length;
    document.getElementById('load-step').textContent = loadSteps[si];
  }, 1400);

  const srcMap = { facebook:'Facebook', twitter:'X/Twitter', instagram:'Instagram', news:'Мэдээний сайт', other:'Интернет' };
  const userMsg = `${srcMap[currentSrc]}-с авсан дараах мэдээллийг бүх салбарын мэдлэгээр гүнзгий шинжилж шалгана уу:\n\n"${text}"\n\nОлон салбарын өнцгөөс, хуурамч мэдээллийн арга техник болон бодит/худал хэсгийг тусад нь ялгана уу.`;

  try {
    const result = await callGeminiWithFallback(userMsg, text);
    clearInterval(stepTimer);
    if (!result) { finishLoading(); showErr('Бүх загвар квот дууссан байна. Тохиргооноос өөр загвар сонгоно уу.'); showView('main'); return; }
    const { data, urlCheckResults } = result;
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map(p => p.text || '').join('');
    if (!raw) { finishLoading(); showErr('Загвараас хариу ирсэнгүй. Дахин оролдоно уу.'); showView('main'); return; }
    const r = sanitizeAndParseJSON(raw);
    if (!r) {
      finishLoading();
      showErr('Хариу задлах амжилтгүй. Өөр загвар сонгож дахин оролдоно уу.');
      showView('main');
      return;
    }
    renderResult(r, urlCheckResults);
    const scamRisk = r?.scamAnalysis?.riskScore || 0;
    rtTrack('check', { model: selectedModel, scam_detected: scamRisk > 50, scam_risk: scamRisk });
  } catch(e) {
    clearInterval(stepTimer);
    finishLoading();
    showErr('Алдаа: ' + e.message);
    showView('main');
  }
}

function extractURLs(text) {
  const m = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]{4,}/gi);
  return [...new Set(m || [])].slice(0, 5);
}

async function checkURLSafety(urls) {
  const results = [];
  for (const url of urls) {
    try {
      const res = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'url=' + encodeURIComponent(url)
      });
      const data = await res.json();
      if (data.query_status === 'is_threat') {
        results.push({ url, threat: data.threat || 'malware', status: 'danger' });
      } else if (data.query_status === 'no_results') {
        results.push({ url, status: 'clean' });
      }
    } catch(e) {
      results.push({ url, status: 'unknown' });
    }
  }
  return results;
}

async function gatherWebContext(text, model) {
  const urls = extractURLs(text);
  const urlNote = urls.length ? '\n\nИлэрсэн URL: ' + urls.join(', ') : '';
  const searchMsg = 'Дараах текстэд дурдагдсан нэр, байгууллага, URL-уудын луйвар болон найдвартай байдлын мэдээлэл хай:\n\n"' + text.slice(0, 600) + '"' + urlNote;
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: CONTEXT_SYS }] },
          contents: [{ role: 'user', parts: [{ text: searchMsg }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
        })
      }
    );
    const data = await res.json();
    if (data.error) return 'Вэб хайлт амжилтгүй.';
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || 'Холбогдох мэдээлэл олдсонгүй.';
  } catch(e) {
    return 'Вэб хайлт амжилтгүй.';
  }
}

async function callGeminiWithFallback(userMsg, text) {
  const startIdx = FALLBACK_MODELS.indexOf(selectedModel);
  const tryOrder = startIdx >= 0
    ? [selectedModel, ...FALLBACK_MODELS.filter(m => m !== selectedModel)]
    : FALLBACK_MODELS;

  // URL safety check — загвараас хамааралгүй нэг удаа хийнэ
  const urls = extractURLs(text);
  let urlCheckResults = [];
  if (urls.length) {
    const stepEl = document.getElementById('load-step');
    if (stepEl) stepEl.textContent = 'URL аюулгүй байдал шалгаж байна...';
    urlCheckResults = await checkURLSafety(urls);
  }

  for (const model of tryOrder) {
    const stepEl = document.getElementById('load-step');
    try {
      // Алхам 1: вэб хайлтаар контекст цуглуул
      if (stepEl) stepEl.textContent = 'Вэб хайлт хийж байна...';
      const webContext = await gatherWebContext(text, model);

      // Алхам 2: контексттой хамт JSON шинжилгээ хий
      if (stepEl) stepEl.textContent = model + ' шинжилж байна...';
      const fullMsg = userMsg + '\n\n## ВЭБ ХАЙЛТЫН ДҮН:\n' + webContext;

      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYS }] },
            contents: [{ role: 'user', parts: [{ text: fullMsg }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
          })
        }
      );
      const data = await res.json();
      if (data.error) {
        const code = data.error.code;
        if (code === 429 || (data.error.message && data.error.message.includes('quota'))) continue;
        throw new Error('API алдаа: ' + data.error.message);
      }
      return { data, urlCheckResults };
    } catch(e) {
      if (e.message.startsWith('API алдаа:')) throw e;
    }
  }
  return null;
}

function sanitizeAndParseJSON(raw) {
  // Markdown fence устгах: ```json ... ``` эсвэл ``` ... ```
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/,'').trim();
  const cleaned = stripped || raw;

  // Step 1: extract balanced JSON object (handles truncation correctly)
  const jsonStr = extractBalancedJSON(cleaned);
  if (!jsonStr) return null;

  // Step 2: sanitize control characters inside string values
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    const code = jsonStr.charCodeAt(i);

    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }

    if (inString && code < 0x20) {
      if (code === 0x09) result += '\\t';
      else if (code === 0x0A) result += '\\n';
      else if (code === 0x0D) result += '\\r';
      continue;
    }
    result += ch;
  }

  try { return JSON.parse(result); } catch(e) { return null; }
}

function extractBalancedJSON(raw) {
  const start = raw.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return raw.slice(start, i + 1); }
  }
  return null;
}

function finishLoading() {
  document.getElementById('view-loading').style.display = 'none';
  document.getElementById('check-btn').disabled = false;
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function scColor(v, inv) {
  const c = inv ? (v > 60 ? 'red' : v > 30 ? 'amber' : 'green') : (v >= 70 ? 'green' : v >= 40 ? 'amber' : 'red');
  return c;
}
function scHex(c) { return c === 'green' ? '#2dd98f' : c === 'amber' ? '#f5a623' : '#f55858'; }

function renderURLChecks(urlCheckResults) {
  if (!urlCheckResults.length) return '';
  const icons = { danger: '🔴', clean: '🟢', unknown: '⚪' };
  const labels = { danger: 'АЮУЛТАЙ', clean: 'Аюулгүй', unknown: 'Шалгаагүй' };
  let html = '<div class="section"><div class="sec-title">URL АЮУЛГҮЙ БАЙДАЛ (URLhaus)</div>';
  urlCheckResults.forEach(u => {
    const short = u.url.length > 45 ? u.url.slice(0, 45) + '...' : u.url;
    html += '<div class="src-item">'
      + '<div class="src-icon">' + icons[u.status] + '</div>'
      + '<div><div class="src-name" style="color:' + (u.status === 'danger' ? '#f55858' : u.status === 'clean' ? '#2dd98f' : '#6b6880') + '">'
      + labels[u.status] + (u.threat ? ' — ' + esc(u.threat) : '') + '</div>'
      + '<div class="src-rel">' + esc(short) + '</div></div>'
      + '</div>';
  });
  return html + '</div>';
}

function renderResult(r, urlCheckResults = []) {
  finishLoading();
  const sc = r.scores || {};
  const vt = { true:'Үнэн байна', partial:'Хэсэгчлэн үнэн', false:'Худал байна', unknown:'Шалгах боломжгүй' };
  const iconMap = { true:'✓', partial:'~', false:'✗', unknown:'?' };
  r.verdictIcon = iconMap[r.verdictIcon] || iconMap[r.verdict] || '?';

  const sa = r.scamAnalysis || {};
  const scamRisk = sa.riskScore || 0;
  const scamLevel = scamRisk >= 70 ? 'high' : scamRisk >= 35 ? 'medium' : scamRisk >= 10 ? 'low' : '';
  const scamIcons = { high:'🚨', medium:'⚠️', low:'⚡' };
  const scamTitles = { high:'ЛУЙВАРЫН ЭРСДЭЛ ӨНДӨР — ' + scamRisk + '%', medium:'ЛУЙВАРЫН ЭРСДЭЛ ДУНД — ' + scamRisk + '%', low:'БАГА ЭРСДЭЛ — ' + scamRisk + '%' };

  let html = '<div style="padding:14px;">';

  if (scamLevel) {
    const flags = (sa.redFlags || []).map(f => '<span class="scam-flag">' + esc(f) + '</span>').join('');
    html += '<div class="scam-card ' + scamLevel + '">'
      + '<div class="scam-header"><span class="scam-icon">' + scamIcons[scamLevel] + '</span>'
      + '<span class="scam-title">' + scamTitles[scamLevel] + '</span></div>'
      + (sa.scamType && sa.scamType !== 'луйвар биш' ? '<div class="scam-type">Төрөл: ' + esc(sa.scamType) + '</div>' : '')
      + (flags ? '<div class="scam-flags">' + flags + '</div>' : '')
      + (sa.webFindings ? '<div class="scam-findings">' + esc(sa.webFindings) + '</div>' : '')
      + renderURLChecks(urlCheckResults)
      + '</div>';
  }

  if (!scamLevel && urlCheckResults.length) {
    html += renderURLChecks(urlCheckResults);
  }

  html += `<div class="verdict-card ${r.verdict}">
    <div class="v-top">
      <div class="v-icon">${r.verdictIcon}</div>
      <div><span class="v-badge ${r.verdict}">${esc(r.verdictLabel)}</span>
      <div class="v-title" style="margin-top:4px">${vt[r.verdict]||''}</div></div>
    </div>
    <div class="v-summary">${esc(r.summary)}</div>
    <div class="scores-grid">`;

  const scoreItems = [
    {k:'factualAccuracy',l:'БАРИМТ (35%)',inv:false},
    {k:'sourceReliability',l:'ЭХ СУРВАЛЖ (20%)',inv:false},
    {k:'contextCompleteness',l:'КОНТЕКСТ (20%)',inv:false},
    {k:'emotionalManipulation',l:'ХӨТЛӨЛТ (15%)',inv:true},
    {k:'statisticalValidity',l:'СТАТИСТИК (10%)',inv:false},
    {k:'overallCredibility',l:'НИЙТ ОНОО',inv:false}
  ];
  scoreItems.forEach(si => {
    const v = sc[si.k] || 0, col = scColor(v, si.inv);
    const isTotal = si.k === 'overallCredibility';
    html += `<div class="sc-item" style="${isTotal ? 'grid-column:1/-1;background:rgba(124,106,245,0.08);border:0.5px solid rgba(124,106,245,0.2)' : ''}">
      <div class="sc-name">${si.l}</div>
      <div class="sc-bar"><div class="sc-fill ${col}" style="width:${v}%"></div></div>
      <div class="sc-val" style="color:${scHex(col)};${isTotal ? 'font-size:14px' : ''}">${v}%</div>
    </div>`;
  });
  html += `</div></div>`;

  // Domain analysis
  if (r.limitations && r.limitations.length) {
    html += `<div class="section"><div class="sec-title">ШАЛГАХ БОЛОМЖГҮЙ / ХЯЗГААРЛАЛТ</div>`;
    r.limitations.forEach(l => { html += `<div class="rvf-row" style="color:#f5a623">~ ${esc(l)}</div>`; });
    html += `</div>`;
  }

  if (r.domainAnalysis && r.domainAnalysis.length) {
    html += `<div class="section"><div class="sec-title">Салбар тус бүрийн шинжилгээ</div>`;
    r.domainAnalysis.forEach(d => {
      const basisColor = d.basis === 'тогтсон зөвшил' || d.basis === 'нэгдсэн судалгаа' ? '#2dd98f' : d.basis === 'маргаантай' ? '#f5a623' : '#6b6880';
      const conf = typeof d.confidence === 'number' ? d.confidence : null;
      html += `<div class="domain-item"><div class="d-icon">${d.icon}</div><div class="d-body">
        <div class="d-top"><span class="d-name">${esc(d.domain)}</span><span class="d-badge ${d.verdict}">${esc(d.verdictLabel)}</span>${conf !== null ? '<span style="font-size:9px;font-family:monospace;color:#6b6880;margin-left:4px">' + conf + '%</span>' : ''}</div>
        ${d.basis ? '<div style="font-size:9px;font-family:monospace;color:' + basisColor + ';margin-bottom:3px">' + esc(d.basis) + '</div>' : ''}
        <div class="d-note">${esc(d.analysis)}</div>
      </div></div>`;
    });
    html += `</div>`;
  }

  // Claims
  if (r.claims && r.claims.length) {
    html += `<div class="section"><div class="sec-title">Claim-үүдийн задаргаа</div>`;
    r.claims.forEach(c => {
      html += `<div class="claim-item"><span class="c-tag ${c.verdict}">${c.verdict==='true'?'Үнэн':c.verdict==='partial'?'Хагас үнэн':'Худал'}</span><div class="c-text">"${esc(c.text)}"</div><div class="c-exp">${esc(c.explanation)}</div></div>`;
    });
    html += `</div>`;
  }

  // Real vs Fake
  const rvf = r.realVsFake;
  if (rvf && ((rvf.realParts && rvf.realParts.length) || (rvf.fakeParts && rvf.fakeParts.length))) {
    html += `<div class="section"><div class="sec-title">Бодит болон худал хэсэг</div>`;
    if (rvf.realParts && rvf.realParts.length) {
      html += `<div class="rvf-label real">✓ ҮНЭН ХЭСГҮҮД</div>`;
      rvf.realParts.forEach(p => { html += `<div class="rvf-row">${esc(p)}</div>`; });
    }
    if (rvf.fakeParts && rvf.fakeParts.length) {
      html += `<div class="rvf-label fake">✗ ХУДАЛ / ГУЙВУУЛСАН</div>`;
      rvf.fakeParts.forEach(p => { html += `<div class="rvf-row">${esc(p)}</div>`; });
    }
    if (rvf.missingContext && rvf.missingContext.length) {
      html += `<div class="rvf-label ctx">~ ДУТУУ КОНТЕКСТ</div>`;
      rvf.missingContext.forEach(p => { html += `<div class="rvf-row">${esc(p)}</div>`; });
    }
    html += `</div>`;
  }

  // Misinformation techniques
  if (r.misinformationTechniques && r.misinformationTechniques.length) {
    html += `<div class="section"><div class="sec-title">Хуурамч мэдээллийн арга техник</div>`;
    r.misinformationTechniques.forEach(m => {
      html += `<div class="tech-item ${m.severity==='medium'?'warning':''}"><div class="tech-type">${esc(m.type)}</div><div class="tech-desc">${esc(m.description)}</div></div>`;
    });
    html += `</div>`;
  }

  // Sources
  const icons = { official:'🏛', news:'📰', research:'🔬', web:'🌐' };
  if (r.sources && r.sources.length) {
    html += `<div class="section"><div class="sec-title">Шалгасан эх сурвалжууд</div>`;
    r.sources.forEach(s => {
      html += `<div class="src-item"><div class="src-icon">${icons[s.type]||'🌐'}</div><div><div class="src-name">${esc(s.name)}</div><div class="src-rel">${esc(s.relevance)}</div></div></div>`;
    });
    html += `</div>`;
  }

  html += `<button class="back-btn" id="back-btn">← Буцаж шалгах</button></div>`;

  const resultEl = document.getElementById('view-result');
  resultEl.innerHTML = html;
  resultEl.classList.add('active');
  document.getElementById('back-btn').addEventListener('click', goBack);
}

function goBack() {
  document.getElementById('view-result').classList.remove('active');
  document.getElementById('error-box').style.display = 'none';
  showView('main');
  document.getElementById('check-btn').disabled = false;
}
