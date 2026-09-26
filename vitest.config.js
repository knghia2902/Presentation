module.exports = async () => {
  const [{ cloudflareTest, readD1Migrations }, { defineConfig }] = await Promise.all([
    import('@cloudflare/vitest-plugin'),
    import('vitest/config')
  ]);
  const migrations = await readD1Migrations('./migrations');

  return defineConfig({
    plugins: [
      cloudflareTest({
        wrangler: {
          configPath: './wrangler.vitest.toml'
        },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations
          }
        }
      })
    ],
    test: {
      include: ['tests/**/*.test.js'],
      testTimeout: 30000,
      hookTimeout: 30000
    }
  });
};
