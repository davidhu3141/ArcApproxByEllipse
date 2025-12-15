import { useCallback, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './App.css'

const toRad = (deg) => (deg * Math.PI) / 180
const formatNum = (num, digits = 4) =>
  Number.isFinite(num) ? Number(num.toFixed(digits)).toString() : ''

// --- calculations.js port (ESM) ---
function solveABC({ y1, x2, y2, x3, y3 }) {
  const ys = [y1, y2, y3]
  if (new Set(ys).size !== 3) {
    throw new Error('Require y1,y2,y3 all distinct.')
  }

  const d = (y1 - y2) * (y1 - y3) * (y2 - y3)
  const x2sq = x2 * x2
  const x3sq = x3 * x3

  const A = (x2sq * (y1 - y3) + x3sq * (y2 - y1)) / d
  const B = (x2sq * (y3 * y3 - y1 * y1) + x3sq * (y1 * y1 - y2 * y2)) / d
  const C = -A * y1 * y1 - B * y1

  return { A, B, C }
}

function toCanonical({ A, B, C }) {
  const EPS = 1e-12
  if (Math.abs(A) < EPS) throw new Error('A too small')

  const h = -B / (2 * A)
  const K = C - (B * B) / (4 * A)
  const a2 = -K
  if (Math.abs(a2) < EPS) throw new Error('Degenerate a^2')

  const denomY = a2 / A
  if (Math.abs(denomY) < EPS) throw new Error('Degenerate denomY')

  const yDenomSign = denomY >= 0 ? '+' : '-'
  const b2 = Math.abs(denomY)

  return {
    a: Math.sqrt(Math.abs(a2)),
    b: Math.sqrt(b2),
    h,
    yDenomSign,
    a2,
    b2,
    denomY,
  }
}
// -----------------------------------

function ArcViewportChart({ radius, thetaDeg, bestEllipse, title, subtitle, height = 320 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const r = parseFloat(radius)
    const tDeg = parseFloat(thetaDeg)
    const thetaHalfRad = Number.isFinite(tDeg) ? toRad(tDeg / 2) : 0
    const valid = Number.isFinite(r) && r > 0 && Number.isFinite(tDeg) && tDeg > 0 && tDeg <= 180

    const draw = () => {
      const width = container.clientWidth || 640
      d3.select(container).selectAll('*').remove()

      const svg = d3
        .select(container)
        .append('svg')
        .attr('class', 'chart-svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      const padding = 36
      const thetaRad = valid ? thetaHalfRad : 0.5
      const arcWidth = valid ? 2 * r * Math.sin(thetaRad) : 2
      const arcHeight = valid ? r - r * Math.cos(thetaRad) : 1
      const xMinRaw = -arcWidth / 2
      const xMaxRaw = arcWidth / 2
      const yMinRaw = valid ? r * Math.cos(thetaRad) : -1
      const yMaxRaw = valid ? r : 1

      const marginW = Math.max(arcWidth || 0, Math.abs(xMinRaw) + Math.abs(xMaxRaw), 1)
      const marginH = Math.max(arcHeight || 0, Math.abs(yMaxRaw - yMinRaw), 1)
      const xMin = xMinRaw - marginW / 3
      const xMax = xMaxRaw + marginW / 3
      const yMin = yMinRaw - marginH
      const yMax = yMaxRaw + marginH / 2

      const widthRange = xMax - xMin
      const heightRange = yMax - yMin
      const size = Math.max(widthRange, heightRange)
      const centerX = (xMin + xMax) / 2
      const centerY = (yMin + yMax) / 2

      const innerW = width - padding * 2
      const innerH = height - padding * 2
      const pxSize = Math.min(innerW, innerH)
      const scale = pxSize / size
      const halfPx = (size * scale) / 2

      const cx = width / 2
      const cy = height / 2
      const xScale = d3
        .scaleLinear()
        .domain([centerX - size / 2, centerX + size / 2])
        .range([cx - halfPx, cx + halfPx])
      const yScale = d3
        .scaleLinear()
        .domain([centerY - size / 2, centerY + size / 2])
        .range([cy + halfPx, cy - halfPx])

      svg
        .append('g')
        .attr('transform', `translate(0, ${height - padding})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
        .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

      svg
        .append('g')
        .attr('transform', `translate(${padding},0)`)
        .call(d3.axisLeft(yScale).ticks(6))
        .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
        .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

      if (valid) {
        const start = Math.PI / 2 - thetaRad
        const end = Math.PI / 2 + thetaRad
        const startPt = { x: r * Math.cos(start), y: r * Math.sin(start) }
        const endPt = { x: r * Math.cos(end), y: r * Math.sin(end) }

        svg
          .append('circle')
          .attr('class', 'arc-path')
          .attr('cx', xScale(0))
          .attr('cy', yScale(0))
          .attr('r', r * scale)

        svg
          .append('line')
          .attr('class', 'chord-line')
          .attr('x1', xScale(startPt.x))
          .attr('y1', yScale(startPt.y))
          .attr('x2', xScale(endPt.x))
          .attr('y2', yScale(endPt.y))

        svg
          .append('text')
          .attr('x', xScale(endPt.x))
          .attr('y', yScale(endPt.y) - 8)
          .attr('class', 'chart-note')
          .attr('text-anchor', 'end')
          .text('arc & chord')
      } else {
        svg
          .append('text')
          .attr('class', 'chart-placeholder')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .text('Enter R and theta to draw the arc')
      }

      if (bestEllipse) {
        const { a, b, h } = bestEllipse
        const pts = d3.range(0, 361, 2).map((deg) => {
          const t = toRad(deg)
          return { x: a * Math.cos(t), y: b * Math.sin(t) + h }
        })
        const line = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
        svg.append('path').attr('class', 'ellipse-path').attr('d', line(pts))
      }
    }

    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [radius, thetaDeg, height, bestEllipse])

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
      </div>
      <div className="chart-card__body" ref={containerRef} />
    </div>
  )
}

function ErrorChart({ series, tolerance, title, subtitle, height = 260 }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const hasData = series && series.length > 0
    const padding = 36
    const width = container.clientWidth || 480
    d3.select(container).selectAll('*').remove()

    const svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    if (!hasData) {
      svg
        .append('text')
        .attr('class', 'chart-placeholder')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text('No data yet')
      return
    }

    const xExtent = d3.extent(series, (d) => d.tDeg)
    const xDomain = xExtent[0] === xExtent[1] ? [xExtent[0] - 1, xExtent[1] + 1] : xExtent
    const yMax = Math.max(tolerance, d3.max(series, (d) => d.err) || 0) * 1.1
    const xScale = d3.scaleLinear().domain(xDomain).range([padding, width - padding])
    const yScale = d3.scaleLinear().domain([0, yMax]).range([height - padding, padding])

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - padding})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
      .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

    svg
      .append('g')
      .attr('transform', `translate(${padding},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
      .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

    svg
      .append('line')
      .attr('class', 'tolerance-line')
      .attr('x1', padding)
      .attr('x2', width - padding)
      .attr('y1', yScale(tolerance))
      .attr('y2', yScale(tolerance))

    const line = d3
      .line()
      .x((d) => xScale(d.tDeg))
      .y((d) => yScale(d.err))
      .curve(d3.curveMonotoneX)

    svg.append('path').attr('class', 'error-line').attr('d', line(series))
  }, [series, tolerance, height])

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
      </div>
      <div className="chart-card__body" ref={ref} />
    </div>
  )
}

function AttemptsChart({ attempts, best, title, subtitle, height = 260 }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const hasData = attempts && attempts.length > 0
    const padding = 36
    const width = container.clientWidth || 480
    d3.select(container).selectAll('*').remove()

    const svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    if (!hasData) {
      svg
        .append('text')
        .attr('class', 'chart-placeholder')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text('No data yet')
      return
    }

    const xExtent = d3.extent(attempts, (d) => d.a)
    const yExtent = d3.extent(attempts, (d) => d.b)
    const xDomain = xExtent[0] === xExtent[1] ? [xExtent[0] - 1, xExtent[1] + 1] : xExtent
    const yDomain = yExtent[0] === yExtent[1] ? [yExtent[0] - 1, yExtent[1] + 1] : yExtent
    const xScale = d3
      .scaleLinear()
      .domain([xDomain[0] || 0, xDomain[1] || 1])
      .nice()
      .range([padding, width - padding])
    const yScale = d3
      .scaleLinear()
      .domain([yDomain[0] || 0, yDomain[1] || 1])
      .nice()
      .range([height - padding, padding])

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - padding})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
      .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

    svg
      .append('g')
      .attr('transform', `translate(${padding},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
      .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

    svg
      .selectAll('circle.attempt-dot')
      .data(attempts)
      .enter()
      .append('circle')
      .attr('class', (d) =>
        `attempt-dot ${d.accepted ? 'attempt-dot--pass' : 'attempt-dot--fail'} ${best && best.id === d.id ? 'attempt-dot--best' : ''
        }`
      )
      .attr('r', (d) => (best && best.id === d.id ? 6 : 2))
      .attr('cx', (d) => xScale(d.a))
      .attr('cy', (d) => yScale(d.b))
      .append('title')
      .text((d) => `a=${formatNum(d.a, 3)}, b=${formatNum(d.b, 3)}, err=${formatNum(d.err, 4)}`)
  }, [attempts, best, height])

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <p className="eyebrow">{subtitle}</p>
        <h3>{title}</h3>
      </div>
      <div className="chart-card__body" ref={ref} />
    </div>
  )
}

function App() {
  const [radius, setRadius] = useState('120')
  const [theta, setTheta] = useState('45')
  const [chord, setChord] = useState('150')
  const [tolerance, setTolerance] = useState('0.01')
  const [attempts, setAttempts] = useState([])
  const [bestAttempt, setBestAttempt] = useState(null)
  const [errorSeries, setErrorSeries] = useState([])

  const handleRadiusChange = (value) => {
    setRadius(value)
    if (value === '') return
    const r = parseFloat(value)
    const t = parseFloat(theta)
    if (Number.isFinite(r) && r > 0 && Number.isFinite(t)) {
      const newChord = 2 * r * Math.sin(toRad(t / 2))
      setChord(formatNum(newChord, 4))
    }
  }

  const handleThetaChange = (value) => {
    const clamped = Math.min(180, Math.max(0, parseFloat(value)))
    setTheta(value)
    if (!Number.isFinite(clamped)) return
    const r = parseFloat(radius)
    if (Number.isFinite(r) && r > 0) {
      const newChord = 2 * r * Math.sin(toRad(clamped / 2))
      setChord(formatNum(newChord, 4))
    }
  }

  const handleChordChange = (value) => {
    setChord(value)
    if (value === '') return
    const r = parseFloat(radius)
    const c = parseFloat(value)
    if (Number.isFinite(r) && r > 0 && Number.isFinite(c)) {
      const ratio = c / (2 * r)
      if (Math.abs(ratio) <= 1) {
        const newTheta = Math.asin(ratio) * (180 / Math.PI) * 2
        setTheta(formatNum(newTheta, 4))
      }
    }
  }

  const runSearch = useCallback(() => {
    const r = parseFloat(radius)
    const tDeg = parseFloat(theta)
    const e = parseFloat(tolerance)
    if (!(Number.isFinite(r) && r > 0 && Number.isFinite(tDeg) && tDeg > 0 && tDeg <= 180 && Number.isFinite(e) && e > 0)) {
      setAttempts([])
      setBestAttempt(null)
      setErrorSeries([])
      return
    }

    const thetaRad = toRad(tDeg)
    const half = thetaRad / 2
    const quarter = thetaRad / 4
    const attemptsList = []

    const sampleOffsets = () => {
      const n = 10
      const step = (2 * e) / (n - 1)
      return Array.from({ length: n }, (_, i) => -e + i * step)
    }
    const ds = sampleOffsets()
    const d1s = sampleOffsets()
    const d2s = sampleOffsets()

    let attemptId = 0
    for (const d of ds) {
      for (const d1 of d1s) {
        for (const d2 of d2s) {
          const P = { x: 0, y: r + d1 }
          const Q = {
            x: (r + d) * Math.cos(Math.PI / 2 - quarter),
            y: (r + d) * Math.sin(Math.PI / 2 - quarter),
          }
          const R = {
            x: (r + d2) * Math.cos(Math.PI / 2 - half),
            y: (r + d2) * Math.sin(Math.PI / 2 - half),
          }

          try {
            const abc = solveABC({ y1: P.y, x2: Q.x, y2: Q.y, x3: R.x, y3: R.y })
            const canon = toCanonical(abc)
            if (canon.yDenomSign === '-') continue // hyperbola, skip
            const { a, b, h } = canon
            const ratio = ((r + d2) * Math.cos(Math.PI / 2 - half)) / a
            if (Math.abs(ratio) > 1) continue

            const t0 = Math.acos(ratio)
            const t1 = Math.PI - t0
            if (!(t0 < Math.PI / 2 && t1 > t0)) continue

            const steps = 10
            const ts = d3.range(steps).map((idx) => t0 + ((Math.PI / 2 - t0) * idx) / (steps - 1))
            const series = ts.map((tVal) => {
              const x = a * Math.cos(tVal)
              const y = b * Math.sin(tVal) + h
              const rTilde = Math.hypot(x, y)
              return { tDeg: (tVal * 180) / Math.PI, err: Math.abs(rTilde - r) }
            })
            const maxErr = d3.max(series, (dVal) => dVal.err) || Infinity
            attemptsList.push({
              id: `att-${attemptId}`,
              a,
              b,
              h,
              err: maxErr,
              accepted: maxErr <= e,
              series,
            })
            attemptId += 1
          } catch (err) {
            // skip invalid attempt
          }
        }
      }
    }

    const best = attemptsList
      .filter((a) => a.accepted)
      .sort((a, b) => a.a + a.b - (b.a + b.b))[0]

    setAttempts(attemptsList)
    setBestAttempt(best || null)
    setErrorSeries(best ? best.series : [])
  }, [radius, theta, tolerance])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <p className="eyebrow">ellipse search ui</p>
          <h1>Arc to Ellipse Exploration</h1>
          <p className="lede">
            Inputs, visualization frame, and D3 canvases wired to req2/req3 sampling. Layout is responsive for quick iteration.
          </p>
          <div className="hero__meta">
            <span className="pill">React + Vite</span>
            <span className="pill">D3 ready</span>
            <span className="pill">theta ↔ chord sync</span>
          </div>
        </div>
        <div className="hero__notes">
          <div className="note-card">
            <p className="note-title">Goal</p>
            <p className="note-body">Arc span 90−theta/2 ~ 90+theta/2 with radius, chord, tolerance; find a close ellipse.</p>
          </div>
          <div className="note-card">
            <p className="note-title">Viewport hint</p>
            <p className="note-body">Arc size w x h; viewport at least h/2 up, h down, w/3 left/right.</p>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Inputs</p>
            <h2>Basic settings</h2>
          </div>
          <p className="helper-text">
            theta and chord sync each other; radius changes recompute chord. theta is the total span (90−theta/2 ~ 90+theta/2).
          </p>
        </div>
        <div className="input-grid">
          <label className="field">
            <span>Radius (R)</span>
            <input
              type="number"
              min="0"
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              placeholder="e.g. 120"
            />
          </label>
          <label className="field">
            <span>Theta (deg)</span>
            <input
              type="number"
              value={theta}
              min="0"
              max="180"
              onChange={(e) => handleThetaChange(e.target.value)}
              placeholder="e.g. 45"
            />
          </label>
          <label className="field">
            <span>Chord length</span>
            <input
              type="number"
              min="0"
              max={radius !== '' && Number.isFinite(parseFloat(radius)) ? 2 * parseFloat(radius) : undefined}
              value={chord}
              onChange={(e) => handleChordChange(e.target.value)}
              placeholder="e.g. 150"
            />
          </label>
          <label className="field">
            <span>Tolerance e</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="e.g. 0.01"
            />
          </label>
        </div>
        <div className="panel__foot">
          <p>
            Each change tries 10×10×10 random (d,d1,d2) in (-e,e); keeps err &lt;= e with minimal a+b, and plots its error curve and ellipse.
          </p>
          <button type="button" className="primary-btn" onClick={runSearch}>
            Re-run search
          </button>
        </div>
      </section>

      <section className="charts-grid">
        <ArcViewportChart
          title="Plane view with circle / chord / ellipse"
          subtitle="D3 canvas #1"
          height={320}
          radius={radius}
          thetaDeg={theta}
          bestEllipse={bestAttempt}
        />
        <ErrorChart
          title="Angle vs error"
          subtitle="D3 canvas #2"
          height={260}
          series={errorSeries}
          tolerance={parseFloat(tolerance) || 0}
        />
        <AttemptsChart
          title="Tried ellipse semi-axes"
          subtitle="D3 canvas #3"
          height={260}
          attempts={attempts}
          best={bestAttempt}
        />
      </section>
    </div>
  )
}

export default App
