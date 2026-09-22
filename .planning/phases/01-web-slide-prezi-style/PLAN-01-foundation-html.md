---
phase: "01-web-slide-prezi-style"
plan_id: "01-foundation-html"
title: "HTML Structure — 12 Reveal.js Slides"
wave: 1
depends_on: []
files_modified:
  - presentation/slides/index.html
requirements:
  - SLIDE-01
  - SLIDE-02
  - SLIDE-03
  - SLIDE-04
  - SLIDE-05
  - SLIDE-06
autonomous: true
estimated_effort: "large"
---

# Plan 01: HTML Structure — 12 Reveal.js Slides

## Goal
Tạo file `presentation/slides/index.html` chứa toàn bộ 12 slide reveal.js với nội dung bám sát giáo trình Triết học Mác-Lênin 2021 (§748-761), cấu trúc fragment animation, và placeholder cho spiral diagram SVG.

## must_haves
- 12 `<section>` elements bên trong `.reveal .slides`
- Nội dung tiếng Việt hoàn toàn, bám sát giáo trình §748-761
- CDN links: reveal.js v5.1.0, Google Fonts (Playfair Display + Be Vietnam Pro)
- Fragment attributes (`data-fragment-index`) trên các bullet theory slides
- `data-transition` attributes khác nhau cho từng slide theo camera choreography
- Prezi spatial canvas container `div.prezi-spatial-canvas`
- Mobile orientation tip element
- Overview mode `data-slide-num` attributes
- Speaker notes placeholder `<aside class="notes">` trên mỗi slide

---

## Tasks

<task id="T01-01" title="Create index.html with reveal.js boilerplate and CDN links">
<read_first>
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 1: CDN Asset URLs)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-13, D-14, D-15)
</read_first>
<action>
Create file `presentation/slides/index.html`. Set up HTML5 doctype with `lang="vi"`. Include in `<head>`:
- meta charset UTF-8, viewport meta for responsive
- `<title>Quy Luật Phủ Định Của Phủ Định — Triết Học Mác-Lênin</title>`
- CDN stylesheets: reveal.js v5.1.0 reset.min.css and reveal.min.css from cdnjs.cloudflare.com
- Google Fonts preconnect + link for Be Vietnam Pro (weights 300,400,500,600,700 + italic 400) and Playfair Display (weights 600,700,900 + italic 400,600)
- Local stylesheet link: `style.css`

In `<body>`:
- `<div class="prezi-spatial-canvas"></div>` — spatial parallax background container
- `<div class="mobile-orient-tip"><span>↺ Để có trải nghiệm tốt nhất, vui lòng xoay ngang màn hình</span></div>`
- `<div class="reveal">` → `<div class="slides">` — 12 empty `<section>` placeholders with `id` attributes: slide-01 through slide-12
- At bottom of body: CDN script reveal.min.js, plugin/notes/notes.min.js, local script.js
- Each `<section>` must have `data-slide-num` attribute (values "01" through "12") for overview mode badge
- Each `<section>` must have `data-transition` attribute per research table: S01=zoom, S02=slide, S03=zoom-in, S04=slide, S05=slide, S06=zoom-out, S07=zoom, S08=convex, S09=slide, S10=zoom-out, S11=zoom-in, S12=fade
</action>
<acceptance_criteria>
- File exists at `presentation/slides/index.html`
- Contains `<!DOCTYPE html>` and `<html lang="vi">`
- Contains exactly 2 CDN stylesheet links with URLs matching `cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0/`
- Contains Google Fonts link with families `Be+Vietnam+Pro` and `Playfair+Display`
- Contains `<link rel="stylesheet" href="style.css">`
- Contains `<div class="prezi-spatial-canvas"></div>` before `<div class="reveal">`
- Contains `<div class="mobile-orient-tip">`
- Contains exactly 12 `<section>` elements inside `.reveal .slides`
- Each section has `id` attribute from `slide-01` to `slide-12`
- Each section has `data-slide-num` attribute from "01" to "12"
- Section id="slide-01" has `data-transition="zoom"`
- Section id="slide-03" has `data-transition="zoom-in"`
- Section id="slide-07" has `data-transition="zoom"`
- Section id="slide-12" has `data-transition="fade"`
- Contains script tag with src matching `reveal.min.js` from cdnjs CDN
- Contains script tag with src matching `plugin/notes/notes.min.js` from cdnjs CDN
- Contains `<script src="script.js"></script>`
</acceptance_criteria>
</task>

<task id="T01-02" title="Populate Slide 01 — Title slide" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-01, D-02, D-04)
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S01)
</read_first>
<action>
Populate section#slide-01 with:
- `<h1 class="academic-title">Quy Luật Phủ Định Của Phủ Định</h1>`
- `<p class="academic-subtitle">Triết Học Mác-Lênin — Phép Biện Chứng Duy Vật</p>`
- `<div class="title-meta">` containing group name placeholder `<p class="group-name">Nhóm Thuyết Trình</p>` and `<p class="academic-year">Niên khóa 2026</p>`
- `<button class="start-btn fragment" data-fragment-index="1">Bắt đầu khám phá →</button>` — interactive start CTA
- `<aside class="notes">Slide bìa — giới thiệu tên đề tài và nhóm thuyết trình</aside>`
</action>
<acceptance_criteria>
- section#slide-01 contains `<h1` with text "Quy Luật Phủ Định Của Phủ Định"
- Contains class `academic-title` on h1
- Contains class `academic-subtitle` on subtitle paragraph
- Contains text "Triết Học Mác-Lênin"
- Contains text "Nhóm Thuyết Trình"
- Contains `<button class="start-btn fragment"`
- Contains `<aside class="notes">`
</acceptance_criteria>
</task>

<task id="T01-03" title="Populate Slide 02 — Introduction" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S02)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-02, D-03)
</read_first>
<action>
Populate section#slide-02 with:
- `<h2>Dẫn Nhập: Vì Sao Thế Giới Luôn Đổi Mới?</h2>`
- `<p class="academic-subtitle">§749 — Vị trí quy luật trong phép biện chứng duy vật</p>`
- `<div class="academic-card">` containing:
  - `<ul class="step-list">` with 3 fragment `<li>` items (data-fragment-index 1,2,3):
    1. "Sự phát triển diễn ra như thế nào? — Câu hỏi trung tâm của phép biện chứng"
    2. "3 quy luật cơ bản: Thống nhất và đấu tranh giữa các mặt đối lập — Lượng đổi chất đổi — Phủ định của phủ định"
    3. "Quy luật phủ định của phủ định chỉ ra khuynh hướng, hình thức, và kết quả của sự phát triển"
  - Each `<li>` has class `fragment`
- `<aside class="notes">Giới thiệu vấn đề — tại sao phải nghiên cứu quy luật này</aside>`
</action>
<acceptance_criteria>
- section#slide-02 contains `<h2>` with text "Dẫn Nhập"
- Contains `§749`
- Contains `<ul class="step-list">`
- Contains exactly 3 `<li class="fragment"` elements inside the step-list
- First li has `data-fragment-index="1"`
- Contains text "khuynh hướng, hình thức, và kết quả"
- Contains `<aside class="notes">`
</acceptance_criteria>
</task>

<task id="T01-04" title="Populate Slide 03 — Dialectical Negation Concept" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S03)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-02, D-03)
</read_first>
<action>
Populate section#slide-03 with:
- `<h2>Phủ Định Biện Chứng Là Gì?</h2>`
- `<p class="academic-subtitle">§750 — Khái niệm phủ định biện chứng</p>`
- `<div class="academic-card">` containing `<ul class="step-list">` with 3 fragment li items (index 1,2,3):
  1. `<strong>Khái niệm:</strong> Phủ định biện chứng là tiền đề, điều kiện cho sự phát triển — sự vật cũ mất đi, sự vật mới ra đời thay thế`
  2. `<strong>Tự phủ định:</strong> Sự vật tự phủ định, tự phát triển nhờ giải quyết mâu thuẫn bên trong — không phải do ngoại lực`
  3. `<strong>Mắt xích liên kết:</strong> Phủ định biện chứng là mắt xích trong sợi dây chuyền vô tận nối cái cũ với cái mới`
- `<aside class="notes">Slide lý thuyết cốt lõi — giải thích phủ định biện chứng</aside>`
</action>
<acceptance_criteria>
- section#slide-03 contains `<h2>` with "Phủ Định Biện Chứng Là Gì?"
- Contains `§750`
- Contains 3 `<li class="fragment"` items with data-fragment-index 1, 2, 3
- Contains text "tiền đề, điều kiện cho sự phát triển"
- Contains text "mâu thuẫn bên trong"
- Contains text "sợi dây chuyền vô tận"
</acceptance_criteria>
</task>

<task id="T01-05" title="Populate Slide 04 — Objectivity and Inheritance" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S04, Section 5)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-02)
</read_first>
<action>
Populate section#slide-04 with:
- `<h2>Tính Khách Quan & Tính Kế Thừa</h2>`
- `<p class="academic-subtitle">§751 — Hai đặc trưng cơ bản của phủ định biện chứng</p>`
- `<div class="two-column">` layout containing 2 `<div class="academic-card">`:
  Card 1:
  - `<h3 class="card-heading">Tính Khách Quan</h3>`
  - `<ul class="step-list">` with 2 fragment li items (index 1,2):
    1. "Xuất phát từ mâu thuẫn nội tại của bản thân sự vật"
    2. "Không phụ thuộc vào ý muốn, ý chí chủ quan của con người"
  Card 2:
  - `<h3 class="card-heading">Tính Kế Thừa</h3>`
  - `<ul class="step-list">` with 2 fragment li items (index 3,4):
    3. "Giữ lại hạt nhân hợp lý — loại bỏ yếu tố lỗi thời, tiêu cực"
    4. "Tính phổ biến và phong phú đa dạng trong mọi lĩnh vực"
- `<aside class="notes">Hai đặc trưng quan trọng nhất: khách quan và kế thừa</aside>`
</action>
<acceptance_criteria>
- section#slide-04 contains `<h2>` with "Tính Khách Quan & Tính Kế Thừa"
- Contains `§751`
- Contains `<div class="two-column">`
- Contains 2 elements with class `academic-card`
- Contains 4 fragment li items with data-fragment-index 1 through 4
- Contains text "mâu thuẫn nội tại"
- Contains text "hạt nhân hợp lý"
</acceptance_criteria>
</task>

<task id="T01-06" title="Populate Slide 05 — Dialectical vs Metaphysical Inheritance" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S05)
</read_first>
<action>
Populate section#slide-05 with:
- `<h2>Kế Thừa Biện Chứng vs. Kế Thừa Siêu Hình</h2>`
- `<p class="academic-subtitle">§752–753 — So sánh hai quan điểm đối lập</p>`
- `<div class="comparison-table">` containing a 2-column visual comparison:
  Left column `<div class="compare-col dialectical">`:
  - `<h3>Biện Chứng</h3>`
  - Fragment li items (index 1,2):
    1. "Chọn lọc, cải tạo, vượt bỏ (Aufheben)"
    2. "Khâu trung gian (cái trung giới) — bước chuyển quá độ liên kết quá khứ và tương lai"
  Right column `<div class="compare-col metaphysical">`:
  - `<h3>Siêu Hình</h3>`
  - Fragment li items (index 3,4):
    3. "Giữ nguyên si, không cải tạo"
    4. "Hoặc phủ định sạch trơn, xóa bỏ hoàn toàn"
- `<aside class="notes">So sánh đối lập — phân biệt biện chứng và siêu hình</aside>`
</action>
<acceptance_criteria>
- section#slide-05 contains `<h2>` with "Kế Thừa Biện Chứng vs. Kế Thừa Siêu Hình"
- Contains `§752–753`
- Contains `<div class="comparison-table">`
- Contains elements with classes `compare-col dialectical` and `compare-col metaphysical`
- Contains 4 fragment li items
- Contains text "Aufheben"
- Contains text "cái trung giới"
- Contains text "phủ định sạch trơn"
</acceptance_criteria>
</task>

<task id="T01-07" title="Populate Slide 06 — Negation of Negation Process" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, row S06)
</read_first>
<action>
Populate section#slide-06 with:
- `<h2>Quá Trình Phủ Định Của Phủ Định</h2>`
- `<p class="academic-subtitle">§755 — Chu kỳ phát triển qua hai lần phủ định</p>`
- `<div class="academic-card cycle-card">` containing:
  - `<div class="cycle-diagram">` — a visual flow showing the 3-step cycle:
    Step 1 fragment (index 1): `<div class="cycle-step step-affirm">` with "Khẳng Định (A)" and description "Sự vật ban đầu với đặc tính nguyên bản"
    Step 2 fragment (index 2): `<div class="cycle-step step-negate">` with "Phủ Định Lần 1 (B)" and description "Chuyển thành cái đối lập — sự vật mới ra đời"
    Step 3 fragment (index 3): `<div class="cycle-step step-synthesis">` with "Phủ Định Của Phủ Định (A')" and description "Dường như lặp lại cái ban đầu nhưng trên cơ sở cao hơn"
  - Arrow connectors between steps using `<div class="cycle-arrow">→</div>`
- `<p class="fragment key-insight" data-fragment-index="4">Mỗi chu kỳ hoàn thành tối thiểu trải qua 2 lần phủ định biện chứng</p>`
- `<aside class="notes">Slide trọng tâm — chu kỳ A → B → A'</aside>`
</action>
<acceptance_criteria>
- section#slide-06 contains `<h2>` with "Quá Trình Phủ Định Của Phủ Định"
- Contains `§755`
- Contains elements with classes `cycle-step step-affirm`, `cycle-step step-negate`, `cycle-step step-synthesis`
- Contains 4 fragment elements with data-fragment-index 1 through 4
- Contains text "Khẳng Định (A)"
- Contains text "Phủ Định Lần 1 (B)"
- Contains text "Phủ Định Của Phủ Định (A')"
- Contains text "trên cơ sở cao hơn"
</acceptance_criteria>
</task>

<task id="T01-08" title="Populate Slide 07 — Spiral Diagram (SVG structure)" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 3: Spiral Architecture, Implementation Blueprint)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-10, D-11, D-12)
</read_first>
<action>
Populate section#slide-07 (id="slide-spiral" additionally) with:
- `<h2 class="academic-title">Quy Luật Vận Động Theo Đường Xoáy Ốc</h2>`
- `<p class="academic-subtitle">§754: Sự phát triển dường như lặp lại, nhưng trên cơ sở cao hơn</p>`
- `<div class="spiral-stage">` containing:
  - `<svg class="spiral-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">` with:
    - `<defs>` block containing 3 linearGradient elements (id: grad-v1, grad-v2, grad-v3) and filter id="gold-glow" — exact gradient stops as in research doc
    - Center axis: `<line class="spiral-axis">` x1=400 y1=540 x2=400 y2=60 with dashed stroke and `<polygon>` arrowhead
    - 3 path placeholders: `<path id="spiral-path-1" class="spiral-turn turn-1">`, `<path id="spiral-path-2" class="spiral-turn turn-2">`, `<path id="spiral-path-3" class="spiral-turn turn-3">` — d attribute will be computed by script.js
    - Labels for each turn as `<text>` elements positioned at turn centers
  - `<div class="spiral-captions">` containing 3 fragment divs:
    Fragment 1 (data-fragment-index="1"): class `card-v1` with "VÒNG 1: KHẲNG ĐỊNH (A)" badge, heading "Điểm xuất phát ban đầu", description about hạt lúa/điện thoại sơ khai
    Fragment 2 (data-fragment-index="2"): class `card-v2` with "VÒNG 2: PHỦ ĐỊNH LẦN 1 (B)" badge, heading "Sự vật mới ra đời đối lập cái cũ"
    Fragment 3 (data-fragment-index="3"): class `card-v3` with "VÒNG 3: PHỦ ĐỊNH CỦA PHỦ ĐỊNH (A')" badge, heading "Hoàn thành chu kỳ ở trình độ cao hơn"
- `<aside class="notes">Slide trọng tâm visual — animation xoáy ốc 3 vòng tương tác</aside>`
</action>
<acceptance_criteria>
- section#slide-07 has additional id "slide-spiral" (or use just slide-spiral as id)
- Contains `<svg class="spiral-svg" viewBox="0 0 800 600"`
- SVG contains `<defs>` with gradient ids "grad-v1", "grad-v2", "grad-v3"
- SVG contains filter id="gold-glow"
- SVG contains `<line class="spiral-axis"`
- SVG contains 3 `<path>` elements with ids "spiral-path-1", "spiral-path-2", "spiral-path-3"
- Contains 3 fragment divs with data-fragment-index 1, 2, 3 inside spiral-captions
- Fragment 1 contains text "KHẲNG ĐỊNH (A)"
- Fragment 2 contains text "PHỦ ĐỊNH LẦN 1 (B)"
- Fragment 3 contains text "PHỦ ĐỊNH CỦA PHỦ ĐỊNH (A')"
</acceptance_criteria>
</task>

<task id="T01-09" title="Populate Slides 08-09 — Practical Examples" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, rows S08, S09)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-05)
</read_first>
<action>
Populate section#slide-08 with:
- `<h2>Ví Dụ Thực Tiễn: Trong Tự Nhiên</h2>`
- `<p class="academic-subtitle">§755 — Ví dụ kinh điển của Ăngghen về hạt lúa</p>`
- `<div class="example-flow">` containing 3 visual step cards as fragments (index 1,2,3):
  1. `<div class="example-step fragment" data-fragment-index="1">` with emoji 🌾 icon, heading "Hạt thóc giống (A)", description "Khẳng định — Trạng thái ban đầu"
  2. `<div class="example-step fragment" data-fragment-index="2">` with emoji 🌱 icon, heading "Cây lúa sinh trưởng (B)", description "Phủ định lần 1 — Hạt thóc bị tiêu biến, cây lúa ra đời"
  3. `<div class="example-step fragment" data-fragment-index="3">` with emoji 🌾✨ icon, heading "Bông lúa trĩu hạt (A')", description "Phủ định của phủ định — Hàng trăm hạt thóc mới, chất lượng cao hơn"
- Arrow divs `<div class="flow-arrow">→</div>` between steps

Populate section#slide-09 with:
- `<h2>Ví Dụ Thực Tiễn: Công Nghệ & Xã Hội</h2>`
- `<p class="academic-subtitle">Mở rộng — Quy luật phủ định trong đời sống hiện đại</p>`
- `<div class="example-flow">` containing 3 visual step cards as fragments (index 1,2,3):
  1. Fragment 1: emoji 📞, heading "Điện thoại bàn / Feature phone (A)", description "Khẳng định — Liên lạc từ xa cơ bản"
  2. Fragment 2: emoji 📱, heading "Smartphone cảm ứng (B)", description "Phủ định lần 1 — Loại bỏ bàn phím vật lý, kế thừa tính di động"
  3. Fragment 3: emoji 🤖, heading "AI Phone / Thiết bị gập (A')", description "Phủ định của phủ định — Kế thừa di động, nâng cấp vượt bậc về trí tuệ nhân tạo"
- `<aside class="notes">` on each slide
</action>
<acceptance_criteria>
- section#slide-08 contains `<h2>` with "Ví Dụ Thực Tiễn: Trong Tự Nhiên"
- section#slide-08 contains `§755` and "Ăngghen"
- section#slide-08 contains 3 elements with class `example-step fragment`
- section#slide-08 contains text "Hạt thóc giống" and "Cây lúa sinh trưởng" and "Bông lúa trĩu hạt"
- section#slide-09 contains `<h2>` with "Công Nghệ & Xã Hội"
- section#slide-09 contains 3 elements with class `example-step fragment`
- section#slide-09 contains text "Điện thoại bàn" and "Smartphone cảm ứng" and "AI Phone"
- Both slides have `<aside class="notes">`
</acceptance_criteria>
</task>

<task id="T01-10" title="Populate Slides 10-12 — Methodology, Summary, Q&A" depends_on="T01-01">
<read_first>
  - presentation/slides/index.html
  - .planning/phases/01-web-slide-prezi-style/01-RESEARCH.md (Section 9, rows S10, S11, S12)
  - .planning/phases/01-web-slide-prezi-style/01-CONTEXT.md (D-02)
</read_first>
<action>
Populate section#slide-10 with:
- `<h2>4 Ý Nghĩa Phương Pháp Luận</h2>`
- `<p class="academic-subtitle">§758–761 — Vận dụng quy luật vào thực tiễn</p>`
- `<div class="methodology-grid">` containing 4 `<div class="method-card academic-card fragment">` items (data-fragment-index 1 through 4):
  1. Icon + heading "Tin tưởng tương lai", description: "Nhận thức khuynh hướng đi lên của sự phát triển, tin tưởng vào cái mới"
  2. Icon + heading "Chấp nhận quanh co", description: "Hiểu tính quanh co, phức tạp — không bi quan khi sự phát triển thụt lùi tạm thời"
  3. Icon + heading "Ủng hộ cái mới", description: "Phát hiện, ủng hộ và bồi dưỡng cái mới tiến bộ dù nó còn non yếu"
  4. Icon + heading "Kế thừa chọn lọc", description: "Kế thừa có chọn lọc di sản cũ, chống phủ định sạch trơn và chống bảo thủ"

Populate section#slide-11 with:
- `<h2>Tổng Kết: Triết Lý Về Sự Tiến Bộ</h2>`
- `<p class="academic-subtitle">§756 — Thông điệp cốt lõi</p>`
- `<div class="summary-card academic-card">` containing:
  - 3 keyword badges: `<span class="keyword-badge">` with text "Khách Quan", "Kế Thừa", "Vươn Lên"
  - `<blockquote class="fragment lenin-quote" data-fragment-index="1">` with text: "Sự phát triển theo đường xoáy ốc chứ không theo đường thẳng" — V.I. Lênin
  - `<p class="fragment closing-message" data-fragment-index="2">` with text: "Mọi sự phát triển đều trải qua phủ định — nhưng phủ định để tiến lên, không phải để hủy diệt"

Populate section#slide-12 with:
- `<h2>Thảo Luận & Mini Quiz</h2>`
- `<div class="qa-card academic-card">`:
  - `<p>Cảm ơn thầy cô và các bạn đã lắng nghe!</p>`
  - `<div class="qr-placeholder">` with text "QR Code Quiz — Sẽ được kết nối sau (Phase 3)" and a placeholder box
  - `<p class="fragment" data-fragment-index="1">Các bạn có câu hỏi hoặc ý kiến phản biện?</p>`
- `<aside class="notes">` on all 3 slides
</action>
<acceptance_criteria>
- section#slide-10 contains `<h2>` with "4 Ý Nghĩa Phương Pháp Luận"
- section#slide-10 contains `§758–761`
- section#slide-10 contains 4 elements with class `method-card` and class `fragment`
- Contains text "Tin tưởng tương lai" and "Chấp nhận quanh co" and "Ủng hộ cái mới" and "Kế thừa chọn lọc"
- section#slide-11 contains `<h2>` with "Tổng Kết"
- section#slide-11 contains 3 `span.keyword-badge` elements
- section#slide-11 contains `<blockquote` with "Lênin" and "đường xoáy ốc"
- section#slide-12 contains `<h2>` with "Thảo Luận & Mini Quiz"
- section#slide-12 contains `<div class="qr-placeholder">`
- All 3 slides have `<aside class="notes">`
</acceptance_criteria>
</task>

---

## Artifacts this phase produces

### New Files
| Path | Description |
|------|-------------|
| `presentation/slides/index.html` | 12-slide reveal.js presentation with full Vietnamese curriculum content |

### Key HTML Structure
- `div.prezi-spatial-canvas` — Spatial parallax background container
- `div.mobile-orient-tip` — Mobile orientation hint overlay
- `section#slide-01` through `section#slide-12` — 12 slide sections
- `section#slide-spiral` (alias for slide-07) — SVG spiral diagram container
- `svg.spiral-svg` — SVG element with 3 path turns and gradients
- `div.spiral-captions` — 3 fragment caption cards for spiral
- `div.cycle-diagram` — 3-step cycle visual on slide 06
- `div.comparison-table` — 2-column dialectical vs metaphysical comparison
- `div.example-flow` — Visual step flow for example slides
- `div.methodology-grid` — 4-card grid for methodology slide
- `button.start-btn` — Interactive start CTA on title slide

### CSS Classes Introduced (styled in PLAN-02)
- `.academic-title`, `.academic-subtitle`, `.academic-card`, `.card-heading`
- `.step-list`, `.fragment`, `.keyword-badge`, `.lenin-quote`
- `.two-column`, `.comparison-table`, `.compare-col`
- `.cycle-card`, `.cycle-diagram`, `.cycle-step`, `.cycle-arrow`
- `.spiral-stage`, `.spiral-svg`, `.spiral-turn`, `.spiral-captions`
- `.example-flow`, `.example-step`, `.flow-arrow`
- `.methodology-grid`, `.method-card`
- `.qr-placeholder`, `.title-meta`, `.group-name`, `.start-btn`

---

## Verification

```powershell
# 1. File exists
Test-Path "presentation/slides/index.html"

# 2. Count sections
(Select-String -Path "presentation/slides/index.html" -Pattern '<section ' -AllMatches).Matches.Count
# Expected: 12

# 3. CDN links present
Select-String -Path "presentation/slides/index.html" -Pattern "cdnjs.cloudflare.com/ajax/libs/reveal.js/5.1.0"
# Expected: 3+ matches (2 CSS + 1-2 JS)

# 4. Google Fonts present
Select-String -Path "presentation/slides/index.html" -Pattern "Be.Vietnam.Pro"
# Expected: 1+ match

# 5. All slides have notes
(Select-String -Path "presentation/slides/index.html" -Pattern '<aside class="notes">' -AllMatches).Matches.Count
# Expected: 12

# 6. Fragment elements exist
(Select-String -Path "presentation/slides/index.html" -Pattern 'class="fragment' -AllMatches).Matches.Count
# Expected: 25+ fragments across all slides
```
