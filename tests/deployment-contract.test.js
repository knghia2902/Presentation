import { describe, expect, it } from 'vitest';
import rootWrangler from '../wrangler.toml?raw';
import workerWrangler from '../presentation/workers/wrangler.toml?raw';
import workerApi from '../presentation/workers/api.js?raw';
import workerSchema from '../presentation/workers/schema.sql?raw';
import migration from '../migrations/0001_quiz.sql?raw';
import readme from '../README.md?raw';
import packageJson from '../package.json?raw';

describe('Phase 3 deployment contract', () => {
  it('keeps Pages DB and binds the external quiz Worker', () => {
    expect(rootWrangler).toContain('binding = "DB"');
    expect(rootWrangler).toContain('name = "QUIZ_ROOM"');
    expect(rootWrangler).toContain('class_name = "QuizRoom"');
    expect(rootWrangler).toContain('script_name = "quiz-room-worker"');
    expect(workerWrangler).toContain('main = "api.js"');
    expect(workerWrangler).toContain('storage = "sqlite"');
    expect(workerApi).toContain('export { QuizRoom }');
  });

  it('keeps bootstrap schema aligned with the versioned migration', () => {
    for (const marker of ['quiz_rooms', 'quiz_players', 'quiz_answers', 'quiz_results', 'presentations']) {
      expect(workerSchema).toContain(marker);
      expect(migration).toContain(marker);
    }
  });

  it('documents local, migration, API, audio, and Phase 4 boundaries', () => {
    for (const marker of ['presentation/quiz/', 'wrangler', 'migrations/0001_quiz.sql', '/api/score', '/api/leaderboard', 'Phase 4', 'LICENSE.md']) {
      expect(readme).toContain(marker);
    }
    expect(JSON.parse(packageJson).scripts.test).toContain('vitest run');
  });
});
