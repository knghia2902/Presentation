# Phase 3: Quiz Webapp + Backend - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-25T16:31:48+07:00
**Phase:** 3-Quiz Webapp + Backend
**Areas discussed:** Luồng chơi, Timer và tính điểm, Tên người chơi và leaderboard, Offline và backend, Âm thanh và hiệu ứng

---

## Luồng chơi

| Option | Description | Selected |
|--------|-------------|----------|
| Một câu mỗi màn hình | Rõ ràng, phù hợp điện thoại | ✓ |
| Nhiều câu trên một trang | Xem nhanh hơn | |
| Quiz cá nhân | Không có phòng realtime | |
| Quiz realtime theo phòng | Người chủ phòng tạo phòng, người chơi tham gia bằng mã | ✓ |
| Chủ phòng điều khiển | Tạo phòng, bắt đầu, chuyển thủ công/tự động và kết thúc | ✓ |

**User's choice:** “Giống Kahoot” về mô hình phòng, nhưng không dùng tên Kahoot; chủ phòng điều khiển, người chơi chỉ chọn đáp án.
**Notes:** Câu hỏi bị khóa sau khi chọn; không quay lại sửa.

---

## Timer và tính điểm

| Option | Description | Selected |
|--------|-------------|----------|
| Timer chung 30 giây | Một timer dùng cho cả phòng | ✓ |
| Timer riêng | Mỗi người có đồng hồ riêng | |
| 1.000 điểm/câu | Câu đúng bắt đầu tối đa 1.000 và giảm đều theo thời gian | ✓ |
| Không trả lời | Hết 30 giây mà chưa chọn thì 0 điểm | ✓ |
| Đáp án + giải thích + leaderboard | Hiện sau mỗi câu trước khi chuyển tiếp | ✓ |

**User's choice:** “Thang 1000 điểm cho 1 câu”; người dùng bổ sung rằng không chọn trước khi hết giờ thì 0 điểm.
**Notes:** Sau mỗi câu có thể tự chuyển hoặc do chủ phòng chuyển.

---

## Tên người chơi và leaderboard

| Option | Description | Selected |
|--------|-------------|----------|
| Nhập biệt danh | Không cần đăng nhập | ✓ |
| Tự thêm hậu tố khi trùng | Ví dụ Minh và Minh #2 | ✓ |
| Leaderboard trong phòng + top chung | Ưu tiên phòng hiện tại | ✓ |
| Tổng thời gian nhanh hơn | Dùng làm tiêu chí phá hòa | ✓ |

**User's choice:** Người chơi nhập biệt danh; leaderboard ưu tiên trong phòng; bằng điểm thì ai có tổng thời gian nhanh hơn xếp trên.
**Notes:** Có thể lưu thêm top điểm chung nếu phù hợp với backend.

---

## Offline và backend

| Option | Description | Selected |
|--------|-------------|----------|
| Lưu kết quả online trước đó | Câu chưa chọn khi mất kết nối bị bỏ qua, không tính điểm | ✓ |
| Chủ phòng mất kết nối thì tạm dừng | Dừng timer và thông báo chờ chủ phòng | ✓ |
| Người chơi mất kết nối | Phòng vẫn chạy; câu bỏ lỡ của người đó tính 0 | ✓ |

**User's choice:** Offline chỉ giữ các kết quả đã ghi nhận khi còn online; khi kết nối lại tiếp tục các câu sau, không hồi phục câu bỏ lỡ.
**Notes:** Chủ phòng và người chơi có hành vi mất kết nối khác nhau.

---

## Âm thanh và hiệu ứng

| Option | Description | Selected |
|--------|-------------|----------|
| Nhạc nền + hiệu ứng + voice | Tạo không khí nhưng vẫn có thể tắt | ✓ |
| Voice chọn thời điểm | Mở đầu, bắt đầu, hết giờ, kết quả cuối; không đọc lúc chuyển câu | ✓ |
| Một câu báo người đúng và nhanh nhất | Đọc ngắn sau mỗi câu | ✓ |
| Đọc top 5 ở kết quả cuối | Không đọc top 5 sau từng câu | ✓ |
| Nhạc có nút bật/tắt và ducking | Tự hạ âm lượng khi voice phát | ✓ |
| Hybrid TTS | Audio cố định tạo sẵn bằng model open-source/free; tên/top 5 động dùng SpeechSynthesis | ✓ |

**User's choice:** “Trong 1 câu đọc người đúng và nhanh nhất, kết thúc đọc top 5”; chọn nhạc nền có thể bật/tắt và giảm âm lượng khi voice.
**Notes:** Ưu tiên độ nhanh và rõ hơn việc gọi API TTS cho từng tên.

---

## the agent's Discretion

- Chọn model TTS cụ thể sau khi kiểm tra license, kích thước và độ trễ.
- Chọn cơ chế realtime và giới hạn phòng phù hợp với Cloudflare.
- Chọn công thức giảm điểm chi tiết và UI miễn đáp ứng các quyết định đã khóa.

## Deferred Ideas

Không có. Người dùng đã xác nhận đưa phòng realtime và voice vào phạm vi Phase 3.
