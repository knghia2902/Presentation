# Quiz Triết học

Webapp quiz realtime bằng tiếng Việt cho bài **Quy luật phủ định của phủ định** trong Triết học Mác–Lênin.

## Tính năng

- 20 câu trắc nghiệm, mỗi câu 4 đáp án.
- Một người tạo phòng; người chơi tham gia bằng mã phòng.
- Timer, tối đa 1.000 điểm mỗi câu, ưu tiên người đúng và nhanh.
- Bảng xếp hạng theo phòng, cập nhật realtime qua WebSocket.
- Host tự chuyển câu hoặc chuyển thủ công, kết thúc ván chơi.
- Offline/reconnect an toàn và âm thanh/SFX có thể bật tắt.
- Giao diện responsive cho máy tính và điện thoại.

## Chạy local

```bash
npm install
npm test

# Terminal 1: Durable Object + D1 local
npx wrangler dev --config presentation/workers/wrangler.toml --local --port 8787

# Terminal 2: Pages Functions + quiz Worker local
npx wrangler pages dev . --do QUIZ_ROOM=QuizRoom@quiz-room-worker --port 8788
```

Mở `http://127.0.0.1:8788/presentation/quiz/` hoặc dùng hostname public `https://quiz.natime.vn/` khi Cloudflare Tunnel đang chạy.

## Dữ liệu và API

Schema chuẩn nằm tại [`migrations/0001_quiz.sql`](migrations/0001_quiz.sql), còn bootstrap schema của Worker nằm tại [`presentation/workers/schema.sql`](presentation/workers/schema.sql).

Các API chính:

- `POST /api/quiz/rooms`
- `GET /api/quiz/rooms`
- `WebSocket /api/quiz/rooms/:roomCode/socket`
- `POST /api/score`
- `GET /api/leaderboard`

Pages giữ binding D1 `DB` và binding Durable Object `QUIZ_ROOM` tới Worker `quiz-room-worker`. Không còn editor slide, API lưu presentation hoặc runtime trình chiếu trong project này; slide được thực hiện trên Prezi bên ngoài.

## Kiểm thử

```bash
npm test
npm run test:scoring
npm run test:questions
npm run test:backend
npm run test:audio
```

Audio cố định, nhạc nền và SFX được khai báo trong [`presentation/quiz/audio/LICENSE.md`](presentation/quiz/audio/LICENSE.md).
