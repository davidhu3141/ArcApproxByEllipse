import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { toRad } from '../lib/utils'

function ArcViewportChart({ radius, thetaDeg, bestEllipse, title, layoutToggle, height = 320 }) {
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
      const xMinRaw = -arcWidth / 2
      const xMaxRaw = arcWidth / 2
      const yMinRaw = valid ? r * Math.cos(thetaRad) : -1
      const yMaxRaw = valid ? r : 1

      let xMin = xMinRaw
      let xMax = xMaxRaw
      let yMin = yMinRaw
      let yMax = yMaxRaw

      if (
        bestEllipse &&
        Number.isFinite(bestEllipse.a) &&
        Number.isFinite(bestEllipse.b) &&
        Number.isFinite(bestEllipse.h)
      ) {
        xMin = -bestEllipse.a
        xMax = bestEllipse.a
        yMin = bestEllipse.h - bestEllipse.b
        yMax = bestEllipse.h + bestEllipse.b
      }

      const baseRangeX = xMax - xMin
      const baseRangeY = yMax - yMin
      const pad = Math.max(baseRangeX, baseRangeY) * 0.15
      xMin -= pad
      xMax += pad
      yMin -= pad
      yMax += pad

      const rangeX = xMax - xMin
      const rangeY = yMax - yMin
      const size = Math.max(rangeX, rangeY)
      const centerX = (xMin + xMax) / 2
      const centerY = (yMin + yMax) / 2
      const innerW = width - padding * 2
      const innerH = height - padding * 2
      const side = Math.min(innerW, innerH)
      const cx = width / 2
      const cy = height / 2

      const extendX = innerW / side
      const extendY = innerH / side

      const xScale = d3
        .scaleLinear()
        .domain([
          centerX - size / 2 * extendX,
          centerX + size / 2 * extendX
        ])
        .range([
          cx - side / 2 * extendX,
          cx + side / 2 * extendX
        ])

      const yScale = d3
        .scaleLinear()
        .domain([
          centerY - size / 2 * extendY,
          centerY + size / 2 * extendY
        ])
        .range([
          cy + side / 2 * extendY,
          cy - side / 2 * extendY
        ])

      const scale = (x) => Math.abs(xScale(x) - xScale(0));
      const yAxisHasZero = centerY - size / 2 * extendY < 0;

      svg
        .append('g')
        .attr('transform', `translate(0, ${yAxisHasZero ? yScale(0) : height - padding})`)
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
          .attr('r', scale(r))

        const endpointsGroup = svg.append('g').attr('class', 'arc-endpoints')
          ;[startPt, endPt].forEach((pt, idx) => {
            endpointsGroup
              .append('circle')
              .attr('class', 'endpoint-dot')
              .attr('cx', xScale(pt.x))
              .attr('cy', yScale(pt.y))
              .attr('r', 5)
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
  }, [radius, thetaDeg, height, bestEllipse, layoutToggle])

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <h3>{title}</h3>
      </div>
      <div className="chart-card__body" ref={containerRef} />
    </div>
  )
}

export default ArcViewportChart
