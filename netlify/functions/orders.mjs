import { createHandler } from '../../server/api.mjs'
import { netlifyStore } from '../../server/netlify-store.mjs'

export default async function orders(request) {
  // The Netlify runtime supplies the Blobs context; no database key is exposed to browsers.
  return createHandler(netlifyStore())(request)
}
