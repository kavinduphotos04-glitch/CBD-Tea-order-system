import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createHandler, teaDay } from '../server/api.mjs'
import { localStore } from '../server/local-store.mjs'

const fixedNow = new Date('2026-11-03T10:00:00Z')
const day = '2026-11-03'
const order = {
  name: 'Kavindu',
  tea: 'milk',
  sugar: 'less',
  note: 'Extra strong',
}
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'cbd-tea-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const handler = createHandler(localStore(root), { now: () => fixedNow })
  const request = async (
    method,
    body,
    token = randomUUID(),
    path = '',
    round = 'morning',
    extra = {},
  ) => {
    const response = await handler(
      new Request(
        `https://tea.example/api/orders${path}?day=${day}&round=${round}`,
        {
          method,
          headers: { 'X-Order-Token': token, ...extra },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        },
      ),
    )
    return { status: response.status, body: await response.json() }
  }
  return { request, handler, root }
}

test('shared storage persists orders and only the creator can edit or cancel', async (t) => {
  const { request, root } = await fixture(t)
  const owner = randomUUID(),
    other = randomUUID()
  const created = await request('POST', order, owner)
  assert.equal(created.status, 201)
  const id = created.body.order.id
  const list = await request('GET', undefined, other)
  assert.equal(list.body.orders[0].name, 'Kavindu')
  assert.equal(list.body.orders[0].mine, false)
  assert.equal(
    (await request('GET', undefined, owner)).body.orders[0].mine,
    true,
  )
  assert.equal(
    (await request('PUT', { ...order, tea: 'milk-coffee' }, other, `/${id}`))
      .status,
    403,
  )
  assert.equal(
    (await request('DELETE', undefined, other, `/${id}`)).status,
    403,
  )
  assert.equal((await request('POST', order, owner)).status, 409)
  const edited = await request(
    'PUT',
    { ...order, tea: 'milk-coffee', sugar: 'none' },
    owner,
    `/${id}`,
  )
  assert.equal(edited.body.order.tea, 'milk-coffee')
  const restoredHandler = createHandler(localStore(root), {
    now: () => fixedNow,
  })
  const restored = await restoredHandler(
    new Request(`https://tea.example/api/orders?day=${day}`),
  )
  assert.equal((await restored.json()).orders[0].tea, 'milk-coffee')
  assert.equal(
    (await request('DELETE', undefined, owner, `/${id}`)).status,
    200,
  )
  assert.equal((await request('GET')).body.orders.length, 0)
})

test('separate rounds and Sri Lanka midnight keep each list fresh', async (t) => {
  const { request, handler } = await fixture(t)
  const owner = randomUUID()
  await request('POST', order, owner)
  assert.equal(
    (await request('GET', undefined, owner, '', 'afternoon')).body.orders
      .length,
    0,
  )
  assert.equal(
    (await request('POST', order, owner, '', 'afternoon')).status,
    201,
  )
  assert.equal((await request('GET', undefined, owner)).body.orders.length, 1)
  assert.equal(teaDay(new Date('2026-11-03T18:29:59Z')), '2026-11-03')
  assert.equal(teaDay(new Date('2026-11-03T18:30:00Z')), '2026-11-04')
  assert.equal(
    (
      await handler(
        new Request('https://tea.example/api/orders?day=2026-11-02'),
      )
    ).status,
    400,
  )
})

test('validation rejects malformed, oversize and cross-origin requests', async (t) => {
  const { request } = await fixture(t)
  assert.equal((await request('POST', { ...order, name: ' ' })).status, 400)
  assert.equal(
    (await request('POST', { ...order, tea: 'unknown' })).status,
    400,
  )
  assert.equal((await request('POST', { ...order, sugar: 'lots' })).status, 400)
  assert.equal(
    (await request('POST', { ...order, note: 'x'.repeat(101) })).status,
    400,
  )
  assert.equal((await request('POST', null)).status, 400)
  assert.equal((await request('POST', order, '')).status, 401)
  assert.equal(
    (await request('POST', { ...order, note: 'x'.repeat(5000) })).status,
    413,
  )
  assert.equal(
    (
      await request('POST', order, randomUUID(), '', 'morning', {
        Origin: 'https://other.example',
      })
    ).status,
    403,
  )
})

test('simultaneous submissions do not lose orders or create duplicates', async (t) => {
  const { request } = await fixture(t)
  const owner = randomUUID()
  const sameOwner = await Promise.all([
    request('POST', order, owner),
    request('POST', order, owner),
  ])
  assert.deepEqual(sameOwner.map((r) => r.status).sort(), [201, 409])
  const team = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      request('POST', { ...order, name: `Teammate ${i}` }),
    ),
  )
  assert.ok(team.every((r) => r.status === 201))
  assert.equal((await request('GET')).body.orders.length, 13)
})

test('a storage outage is reported honestly instead of returning an empty board', async () => {
  const handler = createHandler(
    {
      list: async () => {
        throw new Error('Storage offline')
      },
    },
    { now: () => fixedNow },
  )
  const response = await handler(
    new Request(`https://tea.example/api/orders?day=${day}`),
  )
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /try again/)
})
