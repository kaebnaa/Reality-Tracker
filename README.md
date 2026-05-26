<div align="center">

<img src="icons/icon128.png" width="80" alt="RealityTracker"/>

# RealityTracker

### Монгол хэлний AI Факт & Луйвар Шалгагч — Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Мэдээлэл болон луйварыг Gemini AI + 9 салбарын мэдлэг, вэб хайлтаар хэдхэн секундэд шинжилнэ*

</div>

---

## Яагаад RealityTracker?

Монголд хуурамч мэдээлэл болон луйварын пост социал медиагаар хурдан тархдаг. RealityTracker нь дурын текстийг **2 алхамаар** шинжилнэ:

1. **Вэб хайлт** — дурдагдсан нэр, байгууллага, URL-ийн талаар бодит цагийн мэдээлэл цуглуулна
2. **AI шинжилгээ** — цуглуулсан контекстийг 9 салбарын мэдлэгтэй хослуулж дүгнэлт гаргана

---

## Онцлогууд

| | Онцлог | Тайлбар |
|---|---|---|
| 🔍 | **Вэб хайлт + шинжилгээ** | Google Search-ээр контекст цуглуулаад AI-аар шинжилнэ |
| 🚨 | **Луйвар илрүүлэлт** | Pyramid scheme, phishing, romance scam, crypto луйвар гэх мэт |
| 🔬 | **9 салбарын шинжилгээ** | Шинжлэх ухаан, Эрх зүй, Эдийн засаг, Эрүүл мэнд, Байгаль орчин, Нийгэм, Улстөр, Технологи, **Луйвар & Залилан** |
| 📊 | **Жинлэсэн оноо** | Баримт 35% + Эх сурвалж 20% + Контекст 20% + Хөтлөлт 15% + Статистик 10% |
| ⚡ | **Red flag илрүүлэлт** | Яаралтай шахалт, хэт сайн санал, мөнгө хүсэх зэрэг шинж тэмдэг |
| 🎯 | **Claim задаргаа** | Мэдэгдэл бүрийг тусад нь Үнэн / Хагас үнэн / Худал гэж шалгана |
| 🕵️ | **Хуурамч арга техник** | Cherry-picking, Fear-mongering гэх мэт 10+ техник илрүүлнэ |
| 🔄 | **Auto fallback** | Нэг загвар квот дуусвал дараагийнх руу автоматаар шилжинэ |
| 🖱️ | **Контекст цэс** | Хуудсан дээр текст сонгоод баруун товч → RealityTracker |

---

## Луйвар илрүүлэлт

```
🚨 ЛУЙВАРЫН ЭРСДЭЛ ӨНДӨР — 85%
Төрөл: санхүүгийн / pyramid scheme
⚡ Red flags: яаралтай шахалт · мөнгө шилжүүлэх хүсэлт · баталгаагүй ашгийн амлалт
Вэб хайлт: "X компани" нэртэй луйварын мэдэгдэл 2025 онд гарсан...
```

| Эрсдэл | Хэмжүүр |
|--------|---------|
| 🚨 Өндөр | 70–100% |
| ⚠️ Дунд | 35–69% |
| ⚡ Бага | 10–34% |
| ✓ Аюулгүй | 0–9% |

---

## Оноо тооцоолол

```
Нийт оноо = Баримт × 0.35 + Эх сурвалж × 0.20
           + Контекст × 0.20 + (100 − Хөтлөлт) × 0.15
           + Статистик × 0.10
```

| Нийт оноо | Дүгнэлт |
|:---------:|:-------:|
| ≥ 80% | ✅ Үнэн |
| 45 – 79% | ⚠️ Хагас үнэн |
| < 45% | ❌ Худал |
| Эх сурвалж < 20% | ❓ Шалгах боломжгүй |

---

## Суулгах

**1. Репо татах**
```bash
git clone https://github.com/YOUR_USERNAME/realitytracker.git
```

**2. Chrome-д нэмэх**
```
chrome://extensions → Developer mode ON → Load unpacked → хавтас сонгох
```

**3. API түлхүүр авах**

[Google AI Studio](https://aistudio.google.com/app/apikey) → үнэгүй API key → Extension тохиргоонд оруулах

---

## Дэмжигдэх Gemini загварууд

```
gemini-3.5-flash   ← 2026, хамгийн хүчтэй (default)
gemini-2.5-flash   ← 2025
gemini-2.0-flash
gemini-2.0-flash-lite
gemini-1.5-flash   ← хамгийн найдвартай
gemini-1.5-flash-8b
```

---

## Файлын бүтэц

```
realitytracker/
├── manifest.json      ← Chrome MV3 тохиргоо (v1.1.0)
├── popup.html         ← UI + scam card CSS
├── popup.js           ← 2-алхамт Gemini API + луйвар шинжилгээ
├── background.js      ← Service worker, контекст цэс
├── content.js         ← Хуудсан дээрх текст сонголт
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Хувь нэмэр оруулах

```bash
git checkout -b feature/нэр
git commit -m "feat: тайлбар"
git push origin feature/нэр
# → Pull Request үүсгэнэ
```

---

<div align="center">

**MIT License** · Монгол мэдээллийн орчинд хуурамч мэдээлэл болон луйвартай тэмцэхэд зориулагдсан

</div>
