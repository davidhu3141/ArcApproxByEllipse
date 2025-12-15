import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { toRad } from '../lib/utils'

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

        const endpointsGroup = svg.append('g').attr('class', 'arc-endpoints')
        ;[startPt, endPt].forEach((pt, idx) => {
          endpointsGroup
            .append('circle')
            .attr('class', 'endpoint-dot')
            .attr('cx', xScale(pt.x))
            .attr('cy', yScale(pt.y))
            .attr('r', 5)
          endpointsGroup
            .append('text')
            .attr('x', xScale(pt.x))
            .attr('y', yScale(pt.y) - 10)
            .attr('class', 'chart-note')
            .attr('text-anchor', 'middle')
            .text(idx === 0 ? 'start' : 'end')
        })
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

export default ArcViewportChart
