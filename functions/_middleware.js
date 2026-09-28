export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === '/') {
    const quizUrl = new URL('/presentation/quiz/', url);
    const quizResponse = await context.env.ASSETS.fetch(new Request(quizUrl, context.request));
    if (!quizResponse.ok) return quizResponse;

    const html = (await quizResponse.text()).replace(
      '<head>',
      '<head><base href="/presentation/quiz/">',
    );
    const headers = new Headers(quizResponse.headers);
    headers.set('content-type', 'text/html; charset=UTF-8');
    headers.set('cache-control', 'no-store');
    return new Response(html, { status: quizResponse.status, headers });
  }

  return context.next();
}
