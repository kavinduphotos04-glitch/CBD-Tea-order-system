import { getStore } from '@netlify/blobs'

export function netlifyStore() {
  const store = getStore({ name: 'cbd-tea-orders', consistency: 'strong' })
  return {
    get: (key) => store.getWithMetadata(key, { type: 'json' }),
    async list(prefix) {
      const orders = []
      for await (const page of store.list({ prefix, paginate: true })) {
        const entries = await Promise.all(
          page.blobs.map((blob) => store.get(blob.key, { type: 'json' })),
        )
        orders.push(...entries.filter(Boolean))
      }
      return orders
    },
    async set(key, data, options) {
      const result = await store.setJSON(key, data, options)
      return result.modified
    },
    delete: (key) => store.delete(key),
  }
}
