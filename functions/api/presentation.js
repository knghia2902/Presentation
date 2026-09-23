/**
 * Cloudflare Pages Function: /api/presentation
 * Handles GET (load from D1) and POST (save to D1)
 * Binding name: DB (Cloudflare D1 Database)
 */

export async function onRequestGet(context) {
  const { env } = context;
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cloudflare D1 binding (DB) is not yet configured.',
        isConfigured: false
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Auto-create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS presentations (
        id TEXT PRIMARY KEY,
        content TEXT,
        cards_layout TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const record = await env.DB.prepare(
      'SELECT id, content, cards_layout, updated_at FROM presentations WHERE id = ?'
    ).bind('main').first();

    if (!record) {
      return new Response(JSON.stringify({
        success: true,
        data: null,
        message: 'No presentation record found yet'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let content = record.content;
    let parsedLayout = null;
    if (content && (content.includes('cluster-principles') || content.includes('bust_portrait_card'))) {
      content = null;
      try {
        await env.DB.prepare('DELETE FROM presentations WHERE id = ?').bind('main').run();
      } catch (e) {}
    } else if (record.cards_layout) {
      try {
        parsedLayout = JSON.parse(record.cards_layout);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: record.id,
        content: content,
        cardsLayout: parsedLayout,
        updatedAt: record.updated_at
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cloudflare D1 binding (DB) is not yet configured.',
        isConfigured: false
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const body = await request.json();
    const { content, cardsLayout } = body;
    const layoutStr = cardsLayout ? JSON.stringify(cardsLayout) : null;

    // Auto-create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS presentations (
        id TEXT PRIMARY KEY,
        content TEXT,
        cards_layout TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      INSERT INTO presentations (id, content, cards_layout, updated_at)
      VALUES ('main', ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        content = excluded.content,
        cards_layout = excluded.cards_layout,
        updated_at = datetime('now')
    `).bind(content, layoutStr).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully saved to Cloudflare D1 database',
      savedAt: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
