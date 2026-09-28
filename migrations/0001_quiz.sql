-- Versioned D1 schema for quiz rooms and durable quiz results.
CREATE TABLE IF NOT EXISTS quiz_rooms (
  room_code TEXT PRIMARY KEY,
  host_player_id TEXT,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'finished', 'expired')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME
);

CREATE TABLE IF NOT EXISTS quiz_players (
  player_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('host', 'player')),
  player_sequence INTEGER NOT NULL CHECK (player_sequence > 0),
  connected_at DATETIME,
  disconnected_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_code) REFERENCES quiz_rooms(room_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  answer_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_option TEXT CHECK (answer_option IS NULL OR answer_option IN ('A', 'B', 'C', 'D')),
  is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 1000),
  response_time_ms INTEGER NOT NULL DEFAULT 0 CHECK (response_time_ms BETWEEN 0 AND 30000),
  accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_code) REFERENCES quiz_rooms(room_code) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES quiz_players(player_id) ON DELETE CASCADE,
  UNIQUE (room_code, player_id, question_id)
);

CREATE TABLE IF NOT EXISTS quiz_results (
  result_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  player_sequence INTEGER NOT NULL CHECK (player_sequence > 0),
  total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score BETWEEN 0 AND 20000),
  total_response_ms INTEGER NOT NULL DEFAULT 0 CHECK (total_response_ms BETWEEN 0 AND 600000),
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_code) REFERENCES quiz_rooms(room_code) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES quiz_players(player_id) ON DELETE CASCADE,
  UNIQUE (room_code, player_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_players_room_lookup
  ON quiz_players (room_code, player_sequence);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_answers_idempotency
  ON quiz_answers (room_code, player_id, question_id);

CREATE INDEX IF NOT EXISTS idx_quiz_results_leaderboard
  ON quiz_results (total_score DESC, total_response_ms ASC, player_sequence ASC);

CREATE INDEX IF NOT EXISTS idx_quiz_results_room_leaderboard
  ON quiz_results (room_code, total_score DESC, total_response_ms ASC, player_sequence ASC);
