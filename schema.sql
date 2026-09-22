-- Cloudflare D1 Database Schema for Prezi Presentation
CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY,
  content TEXT,
  cards_layout TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
