import { createHash } from 'node:crypto'

export const TEAS = ['milk', 'plain', 'green', 'coffee']
export const SUGARS = ['none', 'less', 'regular']
export const ROUNDS = ['morning', 'afternoon']
export function teaDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
const clean = (value) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
const ownerID = (token, day, round) =>
  createHash('sha256')
    .update(`${token}:${day}:${round}`)
    .digest('hex')
    .slice(0, 32)

export function createHandler(store, { now = () => new Date() } = {}) {
  return async function handle(request) {
    try {
      const url = new URL(request.url)
      const day = url.searchParams.get('day') || teaDay(now())
      const round = url.searchParams.get('round') || 'morning'
      if (day !== teaDay(now()) || !ROUNDS.includes(round))
        return json(
          { error: 'Please refresh to order for today’s tea round.' },
          400,
        )
      const token = request.headers.get('X-Order-Token') || ''
      const validToken =
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
          token,
        )
      const mineID = validToken ? ownerID(token, day, round) : null
      const prefix = `${day}/${round}/`
      if (request.method === 'GET') {
        const orders = await store.list(prefix)
        return json({
          day,
          round,
          orders: orders
            .map((order) => ({ ...order, mine: order.id === mineID }))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        })
      }
      if (!['POST', 'PUT', 'DELETE'].includes(request.method))
        return json({ error: 'Method not allowed.' }, 405)
      const origin = request.headers.get('Origin')
      if (origin && origin !== url.origin)
        return json(
          { error: 'Please submit your order from this website.' },
          403,
        )
      if (!validToken)
        return json(
          {
            error:
              'Your browser identity is missing. Please refresh and try again.',
          },
          401,
        )
      const segments = url.pathname.split('/').filter(Boolean)
      const last = segments.at(-1)
      const id = last === 'orders' ? null : last
      if (request.method !== 'POST' && (!id || id !== mineID))
        return json(
          { error: 'You can only change your own order on this browser.' },
          403,
        )
      const key = `${prefix}${mineID}`
      if (request.method === 'DELETE') {
        await store.delete(key)
        return json({ ok: true })
      }
      const text = await request.text()
      if (text.length > 4096)
        return json({ error: 'Your order is too long.' }, 413)
      let data
      try {
        data = JSON.parse(text)
      } catch {
        return json({ error: 'Please send a valid order.' }, 400)
      }
      if (!data || typeof data !== 'object')
        return json({ error: 'Please send a valid order.' }, 400)
      const name = clean(data.name)
      const note = clean(data.note)
      if (
        name.length < 2 ||
        name.length > 40 ||
        /[\u0000-\u001f\u007f]/.test(name)
      )
        return json(
          { error: 'Please enter a name between 2 and 40 characters.' },
          400,
        )
      if (!TEAS.includes(data.tea) || !SUGARS.includes(data.sugar))
        return json({ error: 'Choose a drink and sugar preference.' }, 400)
      if (note.length > 100)
        return json({ error: 'Keep your note within 100 characters.' }, 400)
      const previous = await store.get(key)
      if (request.method === 'POST' && previous)
        return json(
          {
            error: 'You already have an order in this round. Edit it instead.',
          },
          409,
        )
      if (request.method === 'PUT' && !previous)
        return json(
          { error: 'This order is no longer here. Refresh and add it again.' },
          404,
        )
      const order = {
        id: mineID,
        name,
        tea: data.tea,
        sugar: data.sugar,
        note,
        createdAt: previous?.data.createdAt || now().toISOString(),
        updatedAt: now().toISOString(),
      }
      const saved = await store.set(
        key,
        order,
        request.method === 'POST'
          ? { onlyIfNew: true }
          : { onlyIfMatch: previous.etag },
      )
      if (!saved)
        return json(
          { error: 'The order changed in another tab. Refresh and try again.' },
          409,
        )
      return json(
        { order: { ...order, mine: true } },
        request.method === 'POST' ? 201 : 200,
      )
    } catch (error) {
      console.error(
        'Tea order request failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return json(
        {
          error:
            'The tea board is taking a little break. Please try again in a moment.',
        },
        503,
      )
    }
  }
}
