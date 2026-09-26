import { beforeAll, describe, expect, it } from 'vitest';
import { applyTestMigrations } from './helpers/d1-runtime.js';
import migrationSql from '../migrations/0001_quiz.sql?raw';
import bootstrapSql from '../presentation/workers/schema.sql?raw';

let database;

function schemaContract(sql) {
  const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z_]+)/gi)]
    .map(([, name]) => name);
  const indexes = [...sql.matchAll(/CREATE (?:UNIQUE )?INDEX IF NOT EXISTS\s+([a-z_]+)/gi)]
    .map(([, name]) => name);
  const columns = {};
  for (const [, name, body] of sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z_]+)\s*\(([\s\S]*?)\n\);/gi)) {
    columns[name] = body.split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^(FOREIGN|UNIQUE|CHECK)/i.test(line))
      .map((line) => line.split(/\s+/)[0].replace(/,$/, ''));
  }
  return { tables, indexes, columns };
}

describe('repeatable quiz D1 schema', () => {
  beforeAll(async () => {
    database = await applyTestMigrations();
    await applyTestMigrations(database);
  });

  it('preserves presentations and creates every quiz table and index', async () => {
    const tables = await database.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE '_cf_%' ORDER BY name"
    ).all();
    expect(tables.results.map(({ name }) => name).filter((name) => name !== 'sqlite_sequence')).toEqual([
      'd1_migrations', 'presentations', 'quiz_answers', 'quiz_players', 'quiz_results', 'quiz_rooms'
    ]);

    const indexes = await database.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_quiz_%' ORDER BY name"
    ).all();
    expect(indexes.results.map(({ name }) => name)).toEqual([
      'idx_quiz_answers_idempotency',
      'idx_quiz_players_room_lookup',
      'idx_quiz_results_leaderboard',
      'idx_quiz_results_room_leaderboard'
    ]);
  });

  it('keeps the Worker bootstrap schema structurally aligned with the migration', async () => {
    expect(schemaContract(bootstrapSql)).toEqual(schemaContract(migrationSql));
  });

  it('rejects duplicate accepted answers for the same room, player, and question', async () => {
    await database.prepare(
      "INSERT INTO quiz_rooms (room_code, host_player_id) VALUES (?, ?)"
    ).bind('ABC123', 'host-1').run();
    await database.prepare(
      "INSERT INTO quiz_players (player_id, room_code, display_name, player_sequence) VALUES (?, ?, ?, ?)"
    ).bind('player-1', 'ABC123', 'Minh', 1).run();
    const answer = database.prepare(
      "INSERT INTO quiz_answers (answer_id, room_code, player_id, question_id, answer_option, is_correct, score, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    await answer.bind('answer-1', 'ABC123', 'player-1', 'q01', 'A', 1, 1000, 0).run();
    await expect(
      answer.bind('answer-2', 'ABC123', 'player-1', 'q01', 'B', 0, 0, 1000).run()
    ).rejects.toThrow();
  });

  it('supports the prepared leaderboard score, time, sequence ordering and top-20 bound', async () => {
    for (let i = 1; i <= 21; i += 1) {
      const playerId = `rank-player-${i}`;
      await database.prepare(
        "INSERT INTO quiz_players (player_id, room_code, display_name, player_sequence) VALUES (?, ?, ?, ?)"
      ).bind(playerId, 'ABC123', `Người chơi ${i}`, i + 1).run();
      await database.prepare(
        "INSERT INTO quiz_results (result_id, room_code, player_id, display_name, player_sequence, total_score, total_response_ms) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(`result-${i}`, 'ABC123', playerId, `Người chơi ${i}`, i + 1, i === 21 ? 1000 : 500, 21 - i).run();
    }

    const ranked = await database.prepare(
      "SELECT display_name, total_score, total_response_ms, player_sequence FROM quiz_results WHERE room_code = ? ORDER BY total_score DESC, total_response_ms ASC, player_sequence ASC LIMIT ?"
    ).bind('ABC123', 20).all();
    expect(ranked.results).toHaveLength(20);
    expect(ranked.results[0]).toMatchObject({ total_score: 1000, total_response_ms: 0 });
    expect(ranked.results[1].total_score).toBe(500);
    for (let i = 1; i < ranked.results.length; i += 1) {
      const previous = ranked.results[i - 1];
      const current = ranked.results[i];
      expect(previous.total_score > current.total_score ||
        (previous.total_score === current.total_score && previous.total_response_ms < current.total_response_ms) ||
        (previous.total_score === current.total_score && previous.total_response_ms === current.total_response_ms && previous.player_sequence < current.player_sequence))
        .toBe(true);
    }
  });
});
