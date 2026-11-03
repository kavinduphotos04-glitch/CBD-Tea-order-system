import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Copy,
  CupSoda,
  Heart,
  HelpCircle,
  Leaf,
  LoaderCircle,
  Minus,
  Moon,
  Pencil,
  Plus,
  Printer,
  Search,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Users,
  WifiOff,
  X,
} from 'lucide-react'

type Tea = 'milk' | 'plain' | 'green' | 'coffee'
type Sugar = 'none' | 'less' | 'regular'
type Round = 'morning' | 'afternoon'
type Order = {
  id: string
  name: string
  tea: Tea
  sugar: Sugar
  note: string
  createdAt: string
  updatedAt: string
  mine: boolean
}
const drinks: {
  id: Tea
  name: string
  description: string
  color: string
  icon: typeof Coffee
}[] = [
  {
    id: 'milk',
    name: 'Milk tea',
    description: 'The creamy classic',
    color: 'peach',
    icon: CupSoda,
  },
  {
    id: 'plain',
    name: 'Plain tea',
    description: 'Simple & strong',
    color: 'yellow',
    icon: Coffee,
  },
  {
    id: 'green',
    name: 'Green tea',
    description: 'A lighter little sip',
    color: 'mint',
    icon: Leaf,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'For the coffee crew',
    color: 'lavender',
    icon: Coffee,
  },
]
const sugars: { id: Sugar; label: string; description: string }[] = [
  { id: 'none', label: 'No sugar', description: '0 tsp' },
  { id: 'less', label: 'Less sugar', description: '1 tsp' },
  { id: 'regular', label: 'Regular', description: '2 tsp' },
]
const dayInColombo = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
const dateLabel = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date())
const defaultRound = (): Round => {
  const query = new URLSearchParams(location.search).get('round')
  if (query === 'morning' || query === 'afternoon') return query
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(new Date()),
  ) < 12
    ? 'morning'
    : 'afternoon'
}
function identity() {
  try {
    const existing = localStorage.getItem('cbd-tea-identity')
    if (
      existing &&
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
        existing,
      )
    )
      return existing
    const id = crypto.randomUUID()
    localStorage.setItem('cbd-tea-identity', id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}
function rememberedName() {
  try {
    return localStorage.getItem('cbd-tea-name') || ''
  } catch {
    return ''
  }
}

function Modal({
  title,
  className = '',
  close,
  children,
}: {
  title: string
  className?: string
  close: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={titleId}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

function TeaIllustration({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? 'tea-art small-art' : 'tea-art'}
      viewBox="0 0 450 250"
      role="img"
      aria-label="An illustrated cup of tea with a flower and rising steam"
    >
      <ellipse
        cx="235"
        cy="224"
        rx="147"
        ry="15"
        fill="#e8bca9"
        opacity=".35"
      />
      <path
        d="M332 92c65-17 78 75 13 83"
        fill="none"
        stroke="#bf6b4e"
        strokeWidth="25"
      />
      <path
        d="M333 92c65-17 78 75 13 83"
        fill="none"
        stroke="#ffd9b9"
        strokeWidth="15"
      />
      <path
        d="M110 91h235l-18 97c-4 24-49 37-99 37s-95-13-99-37Z"
        fill="#fff8e9"
      />
      <path
        d="m110 91 19 97c4 24 49 37 99 37v-13c-46 0-78-12-83-31L128 91Z"
        fill="#efd8bb"
      />
      <ellipse cx="227.5" cy="91" rx="117.5" ry="31" fill="#f8dfbd" />
      <ellipse cx="227.5" cy="91" rx="102.5" ry="22" fill="#b6754e" />
      <path d="M130 96c40-23 149-25 194 0-29 22-155 23-194 0Z" fill="#c88961" />
      <g fill="#ff775e" transform="translate(235 158)">
        <ellipse rx="11" ry="22" cy="-13" />
        <ellipse rx="11" ry="22" cy="-13" transform="rotate(72)" />
        <ellipse rx="11" ry="22" cy="-13" transform="rotate(144)" />
        <ellipse rx="11" ry="22" cy="-13" transform="rotate(216)" />
        <ellipse rx="11" ry="22" cy="-13" transform="rotate(288)" />
        <circle r="10" fill="#ffc96d" />
      </g>
      <g
        fill="none"
        stroke="#fff9ed"
        strokeWidth="6"
        strokeLinecap="round"
        opacity=".9"
      >
        <path d="M197 45c-23-20 22-26 0-44" />
        <path d="M237 43c-22-22 20-28 0-44" />
        <path d="M276 49c-22-22 20-28 0-44" />
      </g>
      <path d="m86 122-5 13-14 5 14 4 5 14 4-14 14-4-14-5Z" fill="#fff9ed" />
      <path d="m363 42-4 10-10 4 10 4 4 10 4-10 10-4-10-4Z" fill="#fff9ed" />
      <g transform="rotate(-17 75 195)">
        <rect x="27" y="182" width="91" height="28" rx="14" fill="#e6dfff" />
        <path
          d="M39 195h66"
          stroke="#c1b4df"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </g>
      <path d="M355 208c-8-31 29-43 33-43 4 28-8 44-33 43" fill="#628973" />
      <path d="m355 208 24-33" stroke="#c1dac6" strokeWidth="2" />
    </svg>
  )
}

export default function App() {
  const [token] = useState(identity)
  const [day, setDay] = useState(dayInColombo)
  const [round, setRound] = useState<Round>(defaultRound)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [name, setName] = useState(rememberedName)
  const [tea, setTea] = useState<Tea>('milk')
  const [sugar, setSugar] = useState<Sugar>('regular')
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('time')
  const [modal, setModal] = useState<
    'help' | 'aunty' | 'share' | 'delete' | null
  >(null)
  const [toast, setToast] = useState('')
  const nameInput = useRef<HTMLInputElement>(null)
  const generation = useRef(0)
  const mounted = useRef(true)
  const currentRequest = useRef<AbortController | null>(null)
  const savingRef = useRef(false)
  const myOrder = orders.find((order) => order.mine)
  const query = `?day=${day}&round=${round}`
  const roundLabel = round === 'morning' ? 'Morning' : 'Afternoon'
  const shareLink = `${location.origin}${location.pathname}?round=${round}`

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const gen = generation.current
      try {
        const response = await fetch(`/api/orders?day=${day}&round=${round}`, {
          headers: { 'X-Order-Token': token },
          signal,
          cache: 'no-store',
        })
        const data = await response.json()
        if (!response.ok)
          throw new Error(data.error || 'Unable to load the tea board.')
        if (gen !== generation.current || signal?.aborted || !mounted.current)
          return
        setOrders(data.orders)
        setConnectionError('')
        setLastSync(new Date())
      } catch (error) {
        if (gen === generation.current && !signal?.aborted && mounted.current)
          setConnectionError(
            error instanceof Error
              ? error.message
              : 'Unable to connect. Please try again.',
          )
      } finally {
        if (gen === generation.current && !signal?.aborted && mounted.current)
          setLoading(false)
      }
    },
    [day, round, token],
  )

  useEffect(() => {
    mounted.current = true
    generation.current++
    const controller = new AbortController()
    currentRequest.current = controller
    setOrders([])
    setLoading(true)
    setLastSync(null)
    setEditing(false)
    setFormError('')
    setSearch('')
    void refresh(controller.signal)
    const sync = () => {
      if (document.visibilityState === 'visible' && !savingRef.current)
        void refresh(controller.signal)
      setDay(dayInColombo())
    }
    const timer = setInterval(sync, 10000)
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      controller.abort()
      generation.current++
      clearInterval(timer)
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
      mounted.current = false
    }
  }, [refresh])
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4500)
      return () => clearTimeout(timer)
    }
  }, [toast])
  useEffect(() => {
    savingRef.current = saving
  }, [saving])

  const filtered = useMemo(
    () =>
      orders
        .filter((order) =>
          order.name
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase().trim()),
        )
        .sort((a, b) =>
          sort === 'name'
            ? a.name.localeCompare(b.name)
            : a.createdAt.localeCompare(b.createdAt),
        ),
    [orders, search, sort],
  )
  const groups = drinks.map((drink) => ({
    ...drink,
    orders: orders.filter((order) => order.tea === drink.id),
  }))
  const selectRound = (value: Round) => {
    if (saving || value === round) return
    const url = new URL(location.href)
    url.searchParams.set('round', value)
    history.replaceState(null, '', url)
    setRound(value)
  }
  const beginEdit = () => {
    if (!myOrder) return
    setName(myOrder.name)
    setTea(myOrder.tea)
    setSugar(myOrder.sugar)
    setNote(myOrder.note)
    setEditing(true)
    setFormError('')
    nameInput.current?.focus()
    document
      .getElementById('order-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const mutate = async (method: string, body?: object) => {
    const response = await fetch(
      `/api/orders${method === 'POST' ? '' : `/${myOrder?.id}`}${query}`,
      {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Order-Token': token },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    )
    const data = await response.json()
    if (!response.ok)
      throw new Error(data.error || 'Something went wrong. Please try again.')
    return data
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (name.trim().length < 2) {
      setFormError('Let us know your name (at least 2 characters).')
      nameInput.current?.focus()
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const result = await mutate(editing ? 'PUT' : 'POST', {
        name,
        tea,
        sugar,
        note,
      })
      setOrders((previous) => [
        ...previous.filter((order) => !order.mine),
        result.order,
      ])
      try {
        localStorage.setItem('cbd-tea-name', name.trim())
      } catch {
        /* Name memory is optional. */
      }
      setEditing(false)
      setToast(
        editing
          ? 'Your order is updated. Just your cup of tea!'
          : 'You’re on the list. A little happiness is brewing!',
      )
      await refresh(currentRequest.current?.signal)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Could not save your order. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }
  const cancelOrder = async () => {
    setSaving(true)
    setFormError('')
    try {
      await mutate('DELETE')
      setOrders((previous) => previous.filter((order) => !order.mine))
      setModal(null)
      setEditing(false)
      setToast('Order cancelled. There’s always the next round!')
      await refresh(currentRequest.current?.signal)
    } catch (error) {
      setModal(null)
      setFormError(
        error instanceof Error ? error.message : 'Could not cancel your order.',
      )
    } finally {
      setSaving(false)
    }
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setToast('Link copied. Invite the tea crew!')
    } catch {
      setToast('Copy the link from the field to share it with your team.')
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="CBD Tea Club home">
            <span className="brand-icon">
              <Coffee size={25} strokeWidth={1.8} />
            </span>
            <span>
              CBD<span className="brand-light"> tea club</span>
              <span className="brand-dot">.</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <span className="nav-active">The tea board</span>
            <button onClick={() => setModal('help')}>
              How it works <HelpCircle size={15} />
            </button>
          </nav>
          <button
            className="button button-dark share-header"
            onClick={() => setModal('share')}
          >
            <Share2 size={16} />
            <span>Invite the team</span>
          </button>
        </div>
      </header>

      <main className="page">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="little-star">✳</span> LESS ORGANISING. MORE
              SIPPING.
            </span>
            <h1 id="hero-title">
              Good tea.
              <br />
              Great{' '}
              <span>
                company
                <svg viewBox="0 0 300 15" aria-hidden="true">
                  <path
                    d="M4 10C69 2 186 2 296 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
            <p>
              Your tea, your way. Add your order and let’s
              <br className="desktop-break" /> make the next tea break a little
              sweeter.
            </p>
          </div>
          <div className="hero-visual">
            <span className="hero-orbit orbit-one" />
            <span className="hero-orbit orbit-two" />
            <span className="hero-sticker">
              a little cup of
              <br />
              <strong>happy</strong>
              <Heart size={16} />
            </span>
            <TeaIllustration />
            <span className="hero-caption">
              <span /> BREWING GOOD VIBES AT CBD
            </span>
          </div>
          <div className="hero-side-note">
            Made for our daily little ritual <Heart size={13} />
          </div>
        </section>

        <div className="round-toolbar">
          <div
            className="round-selector"
            role="group"
            aria-label="Choose tea round"
          >
            <button
              className={round === 'morning' ? 'selected' : ''}
              onClick={() => selectRound('morning')}
              disabled={saving}
            >
              <Sun size={17} /> Morning tea <span>AM</span>
            </button>
            <button
              className={round === 'afternoon' ? 'selected' : ''}
              onClick={() => selectRound('afternoon')}
              disabled={saving}
            >
              <Moon size={16} /> Afternoon tea <span>PM</span>
            </button>
          </div>
          <div className="today">
            <span className="today-dot" />
            Today, {dateLabel()}
            <span className="timezone">Sri Lanka time</span>
          </div>
        </div>

        <section className="stats-grid" aria-label="Tea round summary">
          <div className="stat stat-total">
            <span className="stat-icon">
              <Users size={21} />
            </span>
            <div>
              <span className="stat-number">
                {orders.length}
                <span className="stat-unit">
                  {orders.length === 1 ? 'cup' : 'cups'} of happiness
                </span>
              </span>
              <span className="stat-label">in this tea round</span>
            </div>
            <Sparkles className="stat-sparkle" size={24} />
          </div>
          {groups.map((drink) => (
            <div className={`stat stat-drink ${drink.color}`} key={drink.id}>
              <span className="stat-icon">
                <drink.icon size={21} />
              </span>
              <div>
                <span className="stat-number">{drink.orders.length}</span>
                <span className="stat-label">{drink.name}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="workspace">
          <section
            className="order-card panel"
            id="order-form"
            aria-labelledby="order-heading"
          >
            <div className="section-heading">
              <span className="section-kicker">YOUR LITTLE PICK-ME-UP</span>
              <h2 id="order-heading">
                {myOrder && !editing
                  ? 'You’re on the list!'
                  : editing
                    ? 'Just your cup of tea.'
                    : 'What’s your cup of tea?'}
                <span className="heading-flower">✳</span>
              </h2>
              <p>
                {myOrder && !editing
                  ? 'All set for a well-deserved tea break.'
                  : 'A few little details. One lovely tea break.'}
              </p>
            </div>
            {myOrder && !editing ? (
              <div className="my-order">
                <div
                  className={`my-cup ${drinks.find((d) => d.id === myOrder.tea)?.color}`}
                >
                  <Coffee size={43} strokeWidth={1.4} />
                  <span className="my-check">
                    <Check size={15} />
                  </span>
                </div>
                <span className="pill pill-mine">
                  YOUR {round.toUpperCase()} ORDER
                </span>
                <h3>{myOrder.name}</h3>
                <p>
                  {drinks.find((d) => d.id === myOrder.tea)?.name}{' '}
                  <span>·</span>{' '}
                  {sugars.find((s) => s.id === myOrder.sugar)?.label}
                </p>
                {myOrder.note && (
                  <div className="saved-note">“{myOrder.note}”</div>
                )}
                <button className="button button-coral" onClick={beginEdit}>
                  <Pencil size={16} /> Edit my order
                </button>
                <button
                  className="text-button cancel-order"
                  onClick={() => setModal('delete')}
                >
                  <Trash2 size={14} /> Cancel my order
                </button>
                <div className="form-footnote">
                  <Check size={14} /> Saved and shared with the team
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label className="field-label" htmlFor="name">
                  Your name <span>*</span>
                </label>
                <div className="input-wrap">
                  <Users size={17} />
                  <input
                    ref={nameInput}
                    id="name"
                    autoComplete="name"
                    placeholder="e.g. Kavindu"
                    value={name}
                    maxLength={40}
                    required
                    minLength={2}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <fieldset>
                  <legend>
                    Pick your drink <span>*</span>
                  </legend>
                  <div className="drink-options">
                    {drinks.map((drink) => (
                      <label
                        key={drink.id}
                        className={`drink-option ${tea === drink.id ? 'chosen' : ''}`}
                      >
                        <input
                          type="radio"
                          name="tea"
                          value={drink.id}
                          checked={tea === drink.id}
                          onChange={() => setTea(drink.id)}
                          disabled={saving}
                        />
                        <span className={`drink-symbol ${drink.color}`}>
                          <drink.icon size={24} strokeWidth={1.7} />
                        </span>
                        <span className="drink-name">{drink.name}</span>
                        <span className="drink-description">
                          {drink.description}
                        </span>
                        <span className="radio-mark">
                          {tea === drink.id && (
                            <Check size={10} strokeWidth={3} />
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="sugar-field">
                  <legend>How sweet?</legend>
                  <div className="sugar-options">
                    {sugars.map((option) => (
                      <label
                        key={option.id}
                        className={`sugar-option ${sugar === option.id ? 'chosen' : ''}`}
                      >
                        <input
                          type="radio"
                          name="sugar"
                          value={option.id}
                          checked={sugar === option.id}
                          onChange={() => setSugar(option.id)}
                          disabled={saving}
                        />
                        <span>{option.label}</span>
                        <small>{option.description}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="field-label note-label" htmlFor="note">
                  A little note <span className="optional">optional</span>
                </label>
                <input
                  className="note-input"
                  id="note"
                  placeholder="Less milk? Extra strong? Let us know."
                  value={note}
                  maxLength={100}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={saving}
                />
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
                <button
                  className="button button-coral submit-order"
                  type="submit"
                  disabled={saving || loading}
                >
                  {saving ? (
                    <LoaderCircle size={18} className="spin" />
                  ) : editing ? (
                    <Check size={18} />
                  ) : (
                    <Plus size={19} />
                  )}
                  {saving
                    ? 'Saving your order…'
                    : editing
                      ? 'Save my changes'
                      : 'Count me in'}
                  {!saving && <ArrowRight size={18} />}
                </button>
                {editing ? (
                  <button
                    type="button"
                    className="text-button stop-edit"
                    disabled={saving}
                    onClick={() => {
                      setEditing(false)
                      setFormError('')
                    }}
                  >
                    Keep my current order
                  </button>
                ) : (
                  <div className="form-footnote">
                    <Heart size={13} /> No sign-up. Just good tea and good
                    company.
                  </div>
                )}
              </form>
            )}
            {myOrder && !editing && formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
          </section>

          <section className="board-card panel" aria-labelledby="board-heading">
            <div className="board-top">
              <div>
                <div className="section-kicker">THE GANG’S ALL HERE</div>
                <h2 id="board-heading">
                  The tea list{' '}
                  <span className="count-bubble">{orders.length}</span>
                </h2>
                <p>
                  {roundLabel} round <span className="middle-dot">·</span> One
                  less thing to organise.
                </p>
              </div>
              <span
                className={`live-badge ${connectionError ? 'offline' : ''}`}
              >
                <span />
                {connectionError
                  ? 'Offline'
                  : loading
                    ? 'Connecting'
                    : 'Live board'}
              </span>
            </div>
            <div className="board-controls">
              <div className="search-wrap">
                <Search size={17} />
                <input
                  aria-label="Find a teammate"
                  placeholder="Find a teammate…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="sort-wrap">
                <select
                  aria-label="Sort orders"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="time">Order added</option>
                  <option value="name">Name A–Z</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            {connectionError && (
              <div className="connection-error" role="alert">
                <WifiOff size={18} />
                <span>
                  {connectionError}{' '}
                  {orders.length > 0 && 'Showing the last synced list.'}
                </span>
                <button onClick={() => void refresh()}>Retry</button>
              </div>
            )}
            <div className="order-table-wrap">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>TEAMMATE</th>
                    <th>THEIR CUP</th>
                    <th>SUGAR</th>
                    <th aria-label="Order status" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, index) => {
                    const drink = drinks.find((d) => d.id === order.tea)!
                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="teammate">
                            <span className={`avatar avatar-${index % 5}`}>
                              {order.name
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </span>
                            <span className="teammate-name">
                              {order.name}
                              {order.mine && <small>THAT’S YOU</small>}
                            </span>
                          </div>
                          {order.note && (
                            <div className="table-note">{order.note}</div>
                          )}
                        </td>
                        <td>
                          <span className={`drink-pill ${drink.color}`}>
                            <drink.icon size={14} />
                            {drink.name}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`sugar-text ${order.sugar === 'none' ? 'no-sugar' : ''}`}
                          >
                            {order.sugar === 'none' ? (
                              <Minus size={12} />
                            ) : (
                              <span className="sugar-dots">
                                {order.sugar === 'less' ? '▪' : '▪▪'}
                              </span>
                            )}
                            {sugars.find((s) => s.id === order.sugar)?.label}
                          </span>
                        </td>
                        <td>
                          {order.mine ? (
                            <button
                              className="icon-button edit-row"
                              aria-label="Edit your order"
                              onClick={beginEdit}
                            >
                              <Pencil size={15} />
                            </button>
                          ) : (
                            <Check className="row-check" size={16} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {loading ? (
                <div className="board-empty">
                  <LoaderCircle size={30} className="spin" />
                  <h3>Putting the kettle on…</h3>
                  <p>Fetching today’s tea round.</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="board-empty">
                  <div className="empty-illustration">
                    <Coffee size={42} strokeWidth={1.4} />
                    <span>✦</span>
                    <Heart size={16} />
                  </div>
                  <h3>A fresh round. A little possibility.</h3>
                  <p>
                    Be the first to put the kettle on.
                    <br />
                    Your tea crew’s orders will appear right here.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      nameInput.current?.focus()
                      document.getElementById('order-form')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }}
                  >
                    Let’s start with your cup <ArrowLeft size={14} />
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="board-empty">
                  <Search size={30} />
                  <h3>No one by that name yet.</h3>
                  <p>Try another name or clear your search.</p>
                  <button className="text-button" onClick={() => setSearch('')}>
                    Clear search
                  </button>
                </div>
              ) : null}
            </div>
            <div className="board-bottom">
              <div className="sync-note">
                <span
                  className={connectionError ? 'sync-dot stale' : 'sync-dot'}
                />
                {connectionError
                  ? 'Waiting to reconnect'
                  : lastSync
                    ? 'Refreshes automatically every 10 seconds'
                    : 'Connecting to the tea crew'}
              </div>
              <div className="aunty-banner">
                <span className="aunty-icon">
                  <Coffee size={24} strokeWidth={1.6} />
                </span>
                <div>
                  <strong>All in? Let’s make it tea time.</strong>
                  <p>
                    A big, simple list for tea aunty. No more counting cups.
                  </p>
                </div>
                <button
                  className="button button-dark"
                  onClick={() => setModal('aunty')}
                  disabled={loading || orders.length === 0}
                >
                  <span>Tea aunty view</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
        <div className="how-strip">
          <span className="tiny-label">
            A BETTER TEA BREAK, IN THREE LITTLE STEPS
          </span>
          <div>
            <span>
              <b>01</b> Pick your perfect cup
            </span>
            <ArrowRight size={16} />
            <span>
              <b>02</b> The team joins in
            </span>
            <ArrowRight size={16} />
            <span>
              <b>03</b> Show the list. Sip happy.
            </span>
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <a className="footer-brand" href="/">
          CBD tea club<span>.</span>
        </a>
        <span>Small breaks. Better days.</span>
        <span>
          Made for the CBD crew <Heart size={13} />
        </span>
      </footer>

      {modal === 'help' && (
        <Modal
          title="A good tea break starts here."
          close={() => setModal(null)}
        >
          <p className="modal-intro">
            One link, everyone’s order, a little less organising.
          </p>
          <ol className="help-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Make it your cup</h3>
                <p>
                  Choose the morning or afternoon round, add your name, pick a
                  drink and tell us how sweet you like it.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Bring the crew together</h3>
                <p>
                  Share this link with your team. Orders appear here
                  automatically, even when you’re on different devices.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Let’s make it tea time</h3>
                <p>
                  Open tea aunty view for big, readable drink totals, sugar
                  preferences, names and special notes. You can print it too.
                </p>
              </div>
            </li>
          </ol>
          <div className="info-note">
            Each day starts with a fresh list, using Sri Lanka time. Edit or
            cancel your own order from the browser you used to add it. This is a
            shared team link, so only add details you’re happy for the team to
            see.
          </div>
          <button
            className="button button-coral full-width"
            onClick={() => setModal(null)}
          >
            Lovely. Let’s get brewing <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {modal === 'share' && (
        <Modal title="Tea tastes better together." close={() => setModal(null)}>
          <div className="share-art">
            <Users size={37} strokeWidth={1.5} />
            <Heart size={19} />
          </div>
          <p className="modal-intro">
            Send the {round} tea link to the CBD crew.
            <br />
            Everyone’s order lands on the same board.
          </p>
          <label className="field-label" htmlFor="share-link">
            Your team’s tea link
          </label>
          <div className="share-link">
            <input
              id="share-link"
              value={shareLink}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <button
              className="icon-button"
              aria-label="Copy tea link"
              onClick={() => void copyLink()}
            >
              <Copy size={19} />
            </button>
          </div>
          <button
            className="button button-coral full-width"
            onClick={() => void copyLink()}
          >
            <Copy size={17} /> Copy team link
          </button>
          <p className="share-disclaimer">
            No accounts to create. Just open, order, and look forward to tea.
          </p>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal
          title="Sitting this round out?"
          close={() => {
            if (!saving) setModal(null)
          }}
        >
          <p className="modal-intro">
            We’ll remove your {round} order from the shared list. You can always
            add it again.
          </p>
          <div className="modal-actions">
            <button
              className="button button-light"
              disabled={saving}
              onClick={() => setModal(null)}
            >
              Keep my tea
            </button>
            <button
              className="button button-coral"
              disabled={saving}
              onClick={() => void cancelOrder()}
            >
              {saving ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Yes, cancel order
            </button>
          </div>
        </Modal>
      )}
      {modal === 'aunty' && (
        <Modal
          title="It’s tea time, CBD."
          className="aunty-dialog"
          close={() => setModal(null)}
        >
          <div className="aunty-toolbar">
            <div>
              <span className="section-kicker">
                THE {round.toUpperCase()} TEA ROUND
              </span>
              <p>
                {dateLabel()} <span>·</span>{' '}
                <strong>
                  {orders.length} {orders.length === 1 ? 'cup' : 'cups'} in
                  total
                </strong>
              </p>
            </div>
            <button
              className="button button-dark print-button"
              onClick={() => window.print()}
            >
              <Printer size={17} /> Print list
            </button>
          </div>
          {connectionError && (
            <p className="form-error" role="alert">
              This list may be out of date. Reconnect before preparing tea.
            </p>
          )}
          <div className="aunty-groups">
            {groups
              .filter((group) => group.orders.length > 0)
              .map((group) => (
                <section
                  className={`aunty-group ${group.color}`}
                  key={group.id}
                >
                  <div className="aunty-group-title">
                    <span>
                      <group.icon size={27} />
                      {group.name}
                    </span>
                    <strong>
                      {group.orders.length}
                      <small>
                        {group.orders.length === 1 ? 'cup' : 'cups'}
                      </small>
                    </strong>
                  </div>
                  {sugars.map((s) => {
                    const list = group.orders.filter(
                      (order) => order.sugar === s.id,
                    )
                    if (!list.length) return null
                    return (
                      <div className="aunty-sugar" key={s.id}>
                        <div className="aunty-sugar-title">
                          <h3>
                            {s.label}
                            <small> {s.description}</small>
                          </h3>
                          <b>{list.length}</b>
                        </div>
                        <ul>
                          {list.map((order) => (
                            <li key={order.id}>
                              <Check size={16} />
                              <span>
                                {order.name}
                                {order.note && <small>{order.note}</small>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </section>
              ))}
          </div>
          <p className="aunty-footnote">
            Thank you for making our tea breaks a little brighter.{' '}
            <Heart size={15} />
          </p>
        </Modal>
      )}
      <div
        className={`toast ${toast ? 'show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <span>
              <Check size={17} />
            </span>
            {toast}
            <button onClick={() => setToast('')} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </>
  )
}
