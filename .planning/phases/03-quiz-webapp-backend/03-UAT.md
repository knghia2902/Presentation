---
status: testing
phase: 03-quiz-webapp-backend
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md, 03-07-SUMMARY.md, 03-08-SUMMARY.md, 03-09-SUMMARY.md
started: 2026-09-26T18:30:00+07:00
updated: 2026-09-26T22:55:00+07:00
---

## Current Test

number: 7
name: Mất kết nối và tiếp tục phiên
expected: |
  Khi tải lại hoặc mất kết nối tạm thời, giao diện báo đang kết nối lại; phiên không phát lại câu trả lời cũ và tiếp tục từ trạng thái authoritative hiện tại.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Trang quiz local tải không lỗi và hiển thị màn hình bắt đầu.
result: pass

### 2. Tạo phòng với vai trò chủ phòng
expected: Nhập tên, bấm tạo phòng, nhận mã phòng và thấy lobby với nút bắt đầu quiz.
result: pass

### 3. Người chơi tham gia phòng
expected: Mở tab thứ hai, nhập mã phòng và tên, tham gia thành công; chủ phòng thấy người chơi xuất hiện trong danh sách.
result: pass

### 4. Bắt đầu câu hỏi và chọn đáp án
expected: Chủ phòng bắt đầu; người chơi thấy câu hỏi, 4 đáp án và timer. Chọn một đáp án thì nút bị khóa và trạng thái đã ghi nhận xuất hiện.
result: pass
note: "Ban đầu hiển thị 8 ô; đã sửa và retest thành công ở Test 10."

### 5. Chấm điểm, hết giờ và giải thích
expected: Sau khi trả lời hoặc hết giờ, kết quả đúng/sai, điểm và phần giải thích hiển thị; câu không chọn trước khi hết giờ không được tính điểm.
result: pass
note: "Đã sửa để đáp án sai đỏ và đáp án đúng xanh ngay lập tức; retest thành công ở Test 11."

### 6. Hiệu ứng và âm thanh
expected: Sau thao tác bật âm thanh, nhạc/SFX hoặc voice hoạt động ở các mốc phù hợp; tắt âm thanh thì quiz vẫn chơi được và thông báo chữ vẫn hiển thị.
result: pass
note: "Đã giới hạn SFX hết giờ còn 900 ms; retest thành công ở Test 12."

### 7. Mất kết nối và tiếp tục phiên
expected: Khi tải lại hoặc mất kết nối tạm thời, giao diện báo đang kết nối lại; phiên không phát lại câu trả lời cũ và tiếp tục từ trạng thái authoritative hiện tại.
result: pending

### 8. Kết thúc và bảng xếp hạng
expected: Chủ phòng kết thúc; người chơi thấy kết quả cuối, top 5/bảng xếp hạng và trạng thái lưu kết quả. Có thể mở bảng xếp hạng chung nếu API hoạt động.
result: pending

### 9. Hiển thị trên màn hình hẹp
expected: Thu nhỏ cửa sổ hoặc dùng chế độ responsive; câu hỏi, đáp án, timer và nút thao tác vẫn nhìn thấy và bấm được.
result: pending

## Summary

total: 12
passed: 9
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

- truth: "Màn hình câu hỏi chỉ hiển thị một bộ 4 đáp án A/B/C/D"
  status: resolved
  reason: "User reported: Hiện 8 câu"
  severity: major
  test: 4
  root_cause: "Host preview và player answer grid cùng nằm trong question panel; hidden ở cấp nút/container chưa được CSS bảo vệ nên container không đúng vai trò vẫn hiển thị."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "renderQuestion() chưa ẩn rõ player-answers container theo role"
    - path: "presentation/quiz/style.css"
      issue: "Chưa có rule bắt buộc answer-grid[hidden] phải display:none"
  missing:
    - "Ẩn container đáp án không thuộc role hiện tại"
    - "Bảo vệ thuộc tính hidden bằng CSS"
  debug_session: ".planning/debug/duplicate-answer-cards.md"

- truth: "Sau khi chấm, chỉ đáp án đã chọn sai hiển thị đỏ và đáp án đúng hiển thị xanh"
  status: resolved
  reason: "User reported: Sai hiển thị sai cả 4 câu, đúng xanh cả 4 câu"
  severity: major
  test: 5
  root_cause: "Tất cả nút được đánh dấu selected khi answerPending; markAuthoritativeAnswer() chuyển toàn bộ các nút selected sang correct/incorrect."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "Không lưu đáp án được chọn riêng và áp trạng thái kết quả cho từng nút"
    - path: "presentation/workers/quiz-room.js"
      issue: "Phản hồi trực tiếp chưa gửi correctOption cho người vừa trả lời"
    - path: "tests/client-events.test.js"
      issue: "Thiếu regression test phân biệt nút đã chọn với nút còn lại"
  missing:
    - "Lưu selectedOption theo lượt trả lời"
    - "Chỉ tô trạng thái cho nút có data-answer trùng selectedOption"
    - "Gửi đáp án đúng chỉ trong phản hồi riêng của người trả lời"
  debug_session: ".planning/debug/answer-result-highlighting.md"

- truth: "Âm cảnh báo gần hết giờ ngắn và không gây khó chịu"
  status: resolved
  reason: "User reported: Âm gần hết giờ hơi khó chịu, dài quá"
  severity: minor
  test: 6
  root_cause: "SFX hết giờ dài khoảng 3,6 giây và được phát nguyên đoạn ở thời điểm chuyển sang reveal."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "playAsset('timeout') chưa giới hạn thời lượng phát"
    - path: "tests/audio-contract.test.js"
      issue: "Thiếu kiểm tra thời lượng tối đa của SFX hết giờ"
  missing:
    - "Giới hạn SFX timeout dưới 1 giây"
    - "Regression test xác nhận âm được dừng và tua về đầu"
  debug_session: ".planning/debug/timeout-audio-duration.md"

### 10. Retest bộ đáp án sau khi sửa
expected: Tải lại trang hoặc tạo phòng mới, bắt đầu câu hỏi và màn hình chỉ còn đúng một bộ 4 đáp án A/B/C/D.
result: pass

### 11. Retest trạng thái đúng/sai của đáp án
expected: Trả lời một đáp án; chỉ nút đã chọn nhận trạng thái đúng/sai, các nút còn lại không bị tô theo.
result: pass

### 12. Retest thời lượng âm thanh hết giờ
expected: Khi hết giờ, âm cảnh báo chỉ phát ngắn dưới 1 giây, không kéo dài gây khó chịu; các âm thanh và thông báo chữ khác vẫn hoạt động bình thường.
result: pass
