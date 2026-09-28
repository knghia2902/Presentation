---
status: testing
phase: 03-quiz-webapp-backend
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md, 03-07-SUMMARY.md, 03-08-SUMMARY.md, 03-09-SUMMARY.md
started: 2026-09-26T18:30:00+07:00
updated: 2026-09-28T09:08:00+07:00
---

## Current Test

number: 18
name: Retest quyền điều khiển và kết thúc ván
expected: |
  Người chơi không thấy/không thể dùng điều khiển chủ phòng; chủ phòng thấy nút kết thúc, kết thúc ván thành công và người chơi thấy kết quả cuối cùng cùng bảng xếp hạng.
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
result: pass
note: "Đã sửa CSS để các panel tạm dừng có hidden thực sự được ẩn; retest thành công ở Test 13."

### 8. Kết thúc và bảng xếp hạng
expected: Chủ phòng kết thúc; người chơi thấy kết quả cuối, top 5/bảng xếp hạng và trạng thái lưu kết quả. Có thể mở bảng xếp hạng chung nếu API hoạt động.
result: pass
note: "Đã sửa luồng snapshot finished và proxy; retest thành công ở Test 17."

### 9. Hiển thị trên màn hình hẹp
expected: Thu nhỏ cửa sổ hoặc dùng chế độ responsive; câu hỏi, đáp án, timer và nút thao tác vẫn nhìn thấy và bấm được.
result: pending

## Summary

total: 19
passed: 17
issues: 1
pending: 1
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

- truth: "Banner tạm dừng chỉ hiện khi chủ phòng thực sự mất kết nối"
  status: resolved
  reason: "User reported: Lúc nào cũng hiện Phòng đang tạm dừng"
  severity: major
  test: 7
  root_cause: "CSS đặt display:grid cho pause-banner và paused-panel nhưng không có rule ưu tiên ẩn phần tử mang thuộc tính hidden, nên cả hai panel vẫn hiển thị ở phase question/lobby."
  artifacts:
    - path: "presentation/quiz/style.css"
      issue: "Thiếu rule [hidden] cho hai panel tạm dừng"
    - path: "presentation/quiz/app.js"
      issue: "Logic hidden đúng nhưng bị CSS ghi đè khi render"
  missing:
    - "Bắt buộc display:none cho pause-banner[hidden] và paused-panel[hidden]"
  debug_session: ".planning/debug/pause-banner-always-visible.md"

- truth: "Phiên thiếu hoặc hết hạn capability token không retry WebSocket vô hạn"
  status: fixed_pending_retest
  reason: "User reported: WebSocket connection failed với capabilityToken=undefined"
  severity: major
  test: 8
  root_cause: "Luồng khởi động/reconnect vẫn gọi connectSocket() sau lỗi xác thực hoặc khi session không có capabilityToken, khiến trình duyệt gửi URL chứa token undefined và retry liên tục."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "connectSocket() chưa chặn session thiếu capabilityToken; start() xử lý lỗi xác thực như lỗi mạng"
    - path: "tests/offline.test.js"
      issue: "Thiếu regression test không mở WebSocket khi token bị thiếu"
  missing:
    - "Chặn WebSocket nếu thiếu capability token"
    - "Dừng retry và yêu cầu vào lại phòng khi credential hết hạn/không hợp lệ"
  debug_session: ".planning/debug/websocket-capability-token.md"

- truth: "Reload sau khi kết thúc vẫn mở lại được kết quả cuối mà không cần credential"
  status: resolved
  reason: "User reported: Sau khi bấm kết thúc, load lại web báo phiên phòng không còn thông tin xác thực"
  severity: major
  test: 8
  root_cause: "Credential bị thu hồi sau khi finish và không được lưu trong localStorage; reload không có cách gọi lại snapshot finished, nên rơi vào màn hình yêu cầu vào lại phòng."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "Chưa lưu/khôi phục snapshot finished cục bộ"
    - path: "tests/offline.test.js"
      issue: "Thiếu regression test reload kết quả finished không dùng credential"
  missing:
    - "Lưu snapshot kết quả cuối theo room/player"
    - "Khôi phục màn hình finished trước khi thử kết nối"
  debug_session: ".planning/debug/finished-result-reload.md"

- truth: "Pages proxy giữ tham số finished=1 khi lấy snapshot sau khi kết thúc"
  status: resolved
  reason: "User reported: GET snapshot với finished=1 trả 401 Unauthorized"
  severity: major
  test: 16
  root_cause: "functions/api/quiz/rooms.js chỉ forward playerId và capabilityToken, làm rơi finished=1 nên Durable Object chạy nhánh authenticate thường và từ chối phòng đã kết thúc."
  artifacts:
    - path: "functions/api/quiz/rooms.js"
      issue: "handleSnapshot() không chuyển tiếp finished=1"
    - path: "tests/quiz-api.test.js"
      issue: "Thiếu assertion finished=1 được giữ khi forward"
  missing:
    - "Forward finished=1 tới Durable Object"
  debug_session: ".planning/debug/finished-snapshot-proxy.md"

- truth: "Điều khiển chủ phòng chỉ hiển thị cho chủ phòng"
  status: fixed_pending_retest
  reason: "User reported: Người chơi vẫn thấy bảng điều khiển chủ phòng"
  severity: major
  test: 14
  root_cause: "CSS đặt display:grid cho .host-rail nhưng không bảo vệ trạng thái hidden, nên người chơi nhìn thấy nút Kết thúc dù state.role không phải host."
  artifacts:
    - path: "presentation/quiz/style.css"
      issue: "Thiếu rule .host-rail[hidden]"
    - path: "presentation/quiz/app.js"
      issue: "Logic phân quyền đúng nhưng bị CSS ghi đè phần hiển thị"
  missing:
    - "Ẩn host-rail thật sự khi người dùng là player"
  debug_session: ".planning/debug/host-rail-visible-to-player.md"

- truth: "Snapshot reveal cũ không được ghi đè kết quả finished mới"
  status: resolved
  reason: "User reported: Bấm kết thúc bên chủ phòng rồi ở đâu cũng thấy bảng kết quả câu hỏi"
  severity: major
  test: 18
  root_cause: "Client nhận reveal snapshot phát trong bước kết thúc sau finished snapshot nhưng không kiểm tra roomVersion, nên trạng thái mới bị snapshot cũ ghi đè."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "applyMessage() nhận mọi snapshot mà không loại snapshot có roomVersion thấp hơn"
    - path: "tests/client-events.test.js"
      issue: "Thiếu regression test thứ tự finished rồi reveal cũ"
  missing:
    - "So sánh roomVersion trước khi áp snapshot"
    - "Có đường khôi phục khi WebSocket bỏ lỡ event finished"
  debug_session: ".planning/debug/finished-event-order.md"

- truth: "Sau khi kết thúc, player không gọi API chốt kết quả bằng credential đã bị thu hồi"
  status: resolved
  reason: "User reported: /api/score trả 401 và /api/leaderboard trả 503 sau khi kết thúc"
  severity: major
  test: 19
  root_cause: "Mọi client đều gọi /api/score dù máy chủ đã chốt kết quả và endpoint chỉ cho host finalize; D1 local cũng chưa áp migration nên leaderboard query thất bại."
  artifacts:
    - path: "presentation/quiz/app.js"
      issue: "persistFinalResult() gọi /api/score không phân biệt host/player"
    - path: "migrations/0001_quiz.sql"
      issue: "Migration chưa được áp vào D1 local"
    - path: "tests/client-integration.test.js"
      issue: "Thiếu regression test player không finalize"
  missing:
    - "Chỉ host gọi /api/score"
    - "Finalize finished idempotent cho credential hợp lệ của mọi participant để tương thích bundle cũ"
    - "Áp migration D1 local trước khi test bảng xếp hạng"
  debug_session: ".planning/debug/finished-persistence-auth.md"

### 10. Retest bộ đáp án sau khi sửa
expected: Tải lại trang hoặc tạo phòng mới, bắt đầu câu hỏi và màn hình chỉ còn đúng một bộ 4 đáp án A/B/C/D.
result: pass

### 11. Retest trạng thái đúng/sai của đáp án
expected: Trả lời một đáp án; chỉ nút đã chọn nhận trạng thái đúng/sai, các nút còn lại không bị tô theo.
result: pass

### 12. Retest thời lượng âm thanh hết giờ
expected: Khi hết giờ, âm cảnh báo chỉ phát ngắn dưới 1 giây, không kéo dài gây khó chịu; các âm thanh và thông báo chữ khác vẫn hoạt động bình thường.
result: pass

### 13. Retest banner tạm dừng
expected: Khi phòng đang ở lobby hoặc câu hỏi bình thường, không hiện banner “Phòng đang tạm dừng”; banner chỉ hiện khi snapshot có phase paused_host_disconnect.
result: pass

### 14. Retest phiên WebSocket và bảng xếp hạng
expected: Phiên hợp lệ kết nối WebSocket không lỗi; chủ phòng kết thúc và người chơi thấy kết quả cuối, top 5/bảng xếp hạng cùng trạng thái lưu kết quả.
result: issue
reported: "Người chơi vẫn thấy bảng điều khiển chủ phòng; bấm kết thúc chỉ còn ở bảng kết quả câu hỏi."
severity: major

### 15. Retest reload sau khi kết thúc
expected: Sau khi kết thúc ván, reload trang vẫn mở lại màn hình kết quả cuối, bảng xếp hạng và top 5; không yêu cầu credential của phiên đã kết thúc.
result: pass
note: "Đã bổ sung khôi phục credential tạm trong cùng tab và snapshot finished; đã xác nhận qua Test 17."

### 16. Retest reload cùng tab sau khi kết thúc
expected: Trong cùng tab, sau khi kết thúc ván và reload trang, màn hình kết quả cuối, bảng xếp hạng và top 5 vẫn mở lại; không hiện lỗi “Phiên cũ chỉ lưu thông tin tối thiểu”.
result: pass
note: "Pages proxy đã forward finished=1; retest endpoint thành công ở Test 17."

### 17. Retest endpoint khôi phục kết quả finished
expected: Sau khi kết thúc ván và reload cùng tab, endpoint snapshot finished trả thành công; màn hình kết quả cuối, bảng xếp hạng và top 5 mở lại, không có lỗi 401.
result: pass

### 18. Retest quyền điều khiển và kết thúc ván
expected: Người chơi không thấy/không thể dùng điều khiển chủ phòng; chủ phòng thấy nút kết thúc, kết thúc ván thành công và người chơi thấy kết quả cuối cùng cùng bảng xếp hạng.
result: pass
note: "Đã kiểm thử live với hai phiên khác origin: host bấm kết thúc và cả host/player đều chuyển sang Kết quả ván chơi; test suite 65/65 pass."

### 19. Retest quyền lưu kết quả sau khi kết thúc
expected: Player không gọi `/api/score` với credential đã bị thu hồi; bảng xếp hạng không còn lỗi 503 khi D1 local đã có migration.
result: pass
note: "Player bỏ qua /api/score; local migration 0001_quiz.sql đã áp dụng; leaderboard trả HTTP 200."
