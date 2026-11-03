import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error The API is native JavaScript shared with Netlify Functions.
import { createHandler } from './server/api.mjs'
// @ts-expect-error Local filesystem adapter, development only.
import { localStore } from './server/local-store.mjs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-tea-api',
      configureServer(server) {
        const handle = createHandler(localStore())
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/orders')) return next()
          try {
            const chunks = []
            let size = 0
            for await (const chunk of req) {
              size += chunk.length
              if (size > 4096) {
                res.statusCode = 413
                res.end(JSON.stringify({ error: 'Your order is too long.' }))
                return
              }
              chunks.push(chunk)
            }
            const response = await handle(
              new Request(`http://${req.headers.host}${req.url}`, {
                method: req.method,
                headers: Object.fromEntries(
                  Object.entries(req.headers).filter(
                    ([, v]) => typeof v === 'string',
                  ),
                ) as Record<string, string>,
                ...(['GET', 'HEAD'].includes(req.method || 'GET')
                  ? {}
                  : { body: Buffer.concat(chunks) }),
              }),
            )
            res.statusCode = response.status
            response.headers.forEach((value: string, key: string) =>
              res.setHeader(key, value),
            )
            res.end(await response.text())
          } catch (error) {
            next(error)
          }
        })
      },
    },
  ],
})
