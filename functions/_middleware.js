export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'quiz.natime.vn' && url.pathname === '/') {
    return Response.redirect('https://quiz.natime.vn/presentation/quiz/', 302);
  }

  return context.next();
}
