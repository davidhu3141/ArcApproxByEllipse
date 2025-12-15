import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './App.css'

const toRad = (deg) => (deg * Math.PI) / 180
const formatNum = (num, digits = 4) =>
  Number.isFinite(num) ? Number(num.toFixed(digits)).toString() : ''

function ChartPlaceholder({ title, subtitle, height = 280 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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

      const xScale = d3.scaleLinear().domain([-1, 1]).range([48, width - 24])
      const yScale = d3.scaleLinear().domain([-1, 1]).range([height - 36, 18])

      svg
        .append('g')
        .attr('transform', `translate(0, ${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
        .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

      svg
        .append('g')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale).ticks(5))
        .call((g) => g.selectAll('text').attr('class', 'axis-tick'))
        .call((g) => g.selectAll('path,line').attr('class', 'axis-line'))

      svg
        .append('rect')
        .attr('x', xScale(-0.9))
        .attr('y', yScale(0.9))
        .attr('width', xScale(0.9) - xScale(-0.9))
        .attr('height', yScale(-0.9) - yScale(0.9))
        .attr('class', 'chart-zone')

      svg
        .append('text')
        .attr('class', 'chart-placeholder')
        .attr('x', xScale(0))
        .attr('y', yScale(0.4))
        .text('D3 placeholder')

      svg
        .append('text')
        .attr('class', 'chart-note')
        .attr('x', width - 16)
        .attr('y', height - 12)
        .attr('text-anchor', 'end')
        .text('ready for ellipse data')
    }

    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])

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

function ArcViewportChart({ radius, thetaDeg, title, subtitle, height = 320 }) {
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
      const baseYMin = valid ? r * Math.cos(thetaRad) : -1
      const baseYMax = valid ? r : 1
      const xMinRaw = -arcWidth / 2
      const xMaxRaw = arcWidth / 2
      const yMinRaw = baseYMin
      const yMaxRaw = baseYMax

      const xMin = xMinRaw - arcWidth / 3
      const xMax = xMaxRaw + arcWidth / 3
      const yMin = yMinRaw - arcHeight // 下方外推 h
      const yMax = yMaxRaw + arcHeight / 2 // 上方外推 h/2

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

        // screen-space angles: y 向下，所以取反以保持在上方
        const startScreen = -(Math.PI / 2 + thetaRad)
        const endScreen = -(Math.PI / 2 - thetaRad)

        const arcPath = d3.path()
        arcPath.arc(xScale(0), yScale(0), r * scale, startScreen, endScreen)

        svg.append('path').attr('d', arcPath.toString()).attr('class', 'arc-path')

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
          .text('輸入 R 與 θ 以繪製圓弧')
      }
    }

    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [radius, thetaDeg, height])

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

function App() {
  const [radius, setRadius] = useState('120')
  const [theta, setTheta] = useState('45')
  const [chord, setChord] = useState('150')
  const [tolerance, setTolerance] = useState('0.01')

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
    setTheta(value)
    if (value === '') return
    const r = parseFloat(radius)
    const t = parseFloat(value)
    if (Number.isFinite(r) && r > 0 && Number.isFinite(t) && t >= 0 && t <= 180) {
      const newChord = 2 * r * Math.sin(toRad(t / 2))
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

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <p className="eyebrow">ellipse search ui</p>
          <h1>圓弧到橢圓的探索</h1>
          <p className="lede">
            先提供輸入、視覺化框架與空白 D3 畫布，之後再接入計算邏輯。
            視窗與區塊皆為 RWD，方便快速疊代。
          </p>
          <div className="hero__meta">
            <span className="pill">React + Vite</span>
            <span className="pill">D3 畫布 ready</span>
            <span className="pill">θ ↔ 弦長同步</span>
          </div>
        </div>
        <div className="hero__notes">
          <div className="note-card">
            <p className="note-title">目標</p>
            <p className="note-body">
              90±θ 的圓弧、半徑、弦長、容許誤差，找出近似的橢圓。
            </p>
          </div>
          <div className="note-card">
            <p className="note-title">Viewport 提示</p>
            <p className="note-body">
              假設圓弧尺寸為 w×h，D3 viewport 會預留上方 h/2、下方 h、左右 w/3。
            </p>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">輸入參數</p>
            <h2>基本設定</h2>
          </div>
          <p className="helper-text">
            θ 與弦長會互相影響，輸入任一欄位會同步另一欄，半徑變更也會重算弦長。θ 定義為圓弧範圍 90−θ/2 ~ 90+θ/2。
          </p>
        </div>
        <div className="input-grid">
          <label className="field">
            <span>半徑 (R)</span>
            <input
              type="number"
              min="0"
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              placeholder="例如 120"
            />
          </label>
          <label className="field">
            <span>角度 θ (deg)</span>
            <input
              type="number"
              value={theta}
              min="0"
              max="180"
              onChange={(e) => handleThetaChange(e.target.value)}
              placeholder="例如 45"
            />
          </label>
          <label className="field">
            <span>弦長</span>
            <input
              type="number"
              min="0"
              max={radius !== '' && Number.isFinite(parseFloat(radius)) ? 2 * parseFloat(radius) : undefined}
              value={chord}
              onChange={(e) => handleChordChange(e.target.value)}
              placeholder="例如 150"
            />
          </label>
          <label className="field">
            <span>容許誤差</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="例如 0.01"
            />
          </label>
        </div>
        <div className="panel__foot">
          <p>數值目前只保存狀態，D3 畫布 #1 會依輸入即時更新圓弧與 viewport 範圍。</p>
          <button type="button" className="primary-btn">預留「開始搜尋」按鈕</button>
        </div>
      </section>

      <section className="charts-grid">
        <ArcViewportChart
          title="平面座標與圓弧 viewport"
          subtitle="D3 畫布 #1"
          height={320}
          radius={radius}
          thetaDeg={theta}
        />
        <ChartPlaceholder
          title="各角度誤差圖"
          subtitle="D3 畫布 #2"
          height={260}
        />
        <ChartPlaceholder
          title="嘗試過的橢圓半長短軸"
          subtitle="D3 畫布 #3"
          height={260}
        />
      </section>
    </div>
  )
}

export default App
