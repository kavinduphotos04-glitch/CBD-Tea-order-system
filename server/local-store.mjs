import {
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
  readdir,
} from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'

// Development-only persistent storage. Production always uses shared Netlify Blobs.
export function localStore(root = resolve('.local/orders')) {
  const path = (key) => {
    if (!/^\d{4}-\d{2}-\d{2}\/(morning|afternoon)\/[a-f\d]{32}$/.test(key))
      throw new Error('Invalid storage key')
    return join(root, `${key}.json`)
  }
  const get = async (key) => {
    try {
      const text = await readFile(path(key), 'utf8')
      return {
        data: JSON.parse(text),
        etag: createHash('sha256').update(text).digest('hex'),
      }
    } catch (error) {
      if (error.code === 'ENOENT') return null
      throw error
    }
  }
  return {
    get,
    async list(prefix) {
      if (!/^\d{4}-\d{2}-\d{2}\/(morning|afternoon)\/$/.test(prefix))
        throw new Error('Invalid prefix')
      let files
      try {
        files = await readdir(join(root, prefix))
      } catch (error) {
        if (error.code === 'ENOENT') return []
        throw error
      }
      const entries = await Promise.all(
        files
          .filter((f) => /^[a-f\d]{32}\.json$/.test(f))
          .map((f) => get(prefix + f.slice(0, -5))),
      )
      return entries.filter(Boolean).map((entry) => entry.data)
    },
    async set(key, data, options) {
      const file = path(key)
      await mkdir(resolve(file, '..'), { recursive: true })
      if (options.onlyIfNew) {
        try {
          await writeFile(file, JSON.stringify(data), { flag: 'wx' })
          return true
        } catch (error) {
          if (error.code === 'EEXIST') return false
          throw error
        }
      }
      const previous = await get(key)
      if (!previous || previous.etag !== options.onlyIfMatch) return false
      const temp = `${file}.${randomUUID()}.tmp`
      await writeFile(temp, JSON.stringify(data))
      await rename(temp, file)
      return true
    },
    async delete(key) {
      try {
        await unlink(path(key))
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    },
  }
}
