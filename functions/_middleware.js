export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'quiz.natime.vn' && url.pathname === '/') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/presentation/quiz/',
        'Cache-Control': 'no-store',
      },
    });
  }

  return context.next();
}
