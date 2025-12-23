import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { formatNum, toRad } from '../lib/utils'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function ArchiAnimationChart({ radius, thetaDeg, bestEllipse, bestLengths, title, layoutToggle, height = 320 }) {
  const containerRef = useRef(null)
  const lastWidthRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const r = parseFloat(radius)
    const tDeg = parseFloat(thetaDeg)
    const thetaHalfRad = Number.isFinite(tDeg) ? toRad(tDeg / 2) : 0
    const valid = Number.isFinite(r) && r > 0 && Number.isFinite(tDeg) && tDeg > 0 && tDeg <= 180

    const hasEllipse =
      bestEllipse &&
      Number.isFinite(bestEllipse.a) &&
      Number.isFinite(bestEllipse.b) &&
      Number.isFinite(bestEllipse.h)

    let rafId = 0
    let startTime = 0

    const draw = () => {
      const width = container.clientWidth || 640
      lastWidthRef.current = width
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

      if (!valid || !hasEllipse) {
        svg
          .append('text')
          .attr('class', 'chart-placeholder')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .text('Provide arc + ellipse inputs to animate')
        return
      }

      const thetaRad = thetaHalfRad
      const start = Math.PI / 2 - thetaRad
      const end = Math.PI / 2 + thetaRad
      const startPt = { x: r * Math.cos(start), y: r * Math.sin(start) }
      const endPt = { x: r * Math.cos(end), y: r * Math.sin(end) }
      const chordMid = { x: 0, y: (startPt.y + endPt.y) / 2 }

      const { a, b, h } = bestEllipse
      const chordRightX = Math.max(startPt.x, endPt.x)
      const ratio = clamp(chordRightX / a, -1, 1)
      const t0 = Math.acos(ratio)
      const t1 = Math.PI - t0
      const armLen = Math.max(a - b, 0)

      let xMin = Math.min(startPt.x, endPt.x, -a)
      let xMax = Math.max(startPt.x, endPt.x, a)
      let yMin = Math.min(startPt.y, endPt.y, h - b, h - armLen)
      let yMax = Math.max(startPt.y, endPt.y, h + b)

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
        .domain([centerX - (size / 2) * extendX, centerX + (size / 2) * extendX])
        .range([cx - (side / 2) * extendX, cx + (side / 2) * extendX])

      const yScale = d3
        .scaleLinear()
        .domain([centerY - (size / 2) * extendY, centerY + (size / 2) * extendY])
        .range([cy + (side / 2) * extendY, cy - (side / 2) * extendY])

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

      const chordLine = svg
        .append('line')
        .attr('class', 'chord-line')
        .attr('x1', xScale(startPt.x))
        .attr('y1', yScale(startPt.y))
        .attr('x2', xScale(endPt.x))
        .attr('y2', yScale(endPt.y))

      const center = { x: 0, y: h }
      const l1Line = svg.append('line').attr('class', 'rig-line rig-line--l1')
      const l2ALine = svg.append('line').attr('class', 'rig-line rig-line--l2')
      const l2BLine = svg.append('line').attr('class', 'rig-line rig-line--l2')
      const l3Line = svg.append('line').attr('class', 'rig-line rig-line--l3')
      const l1Label = svg.append('text').attr('class', 'rig-label')
      const l2Label = svg.append('text').attr('class', 'rig-label')
      const l2BLabel = svg.append('text').attr('class', 'rig-label')
      const l3Label = svg.append('text').attr('class', 'rig-label')
      const valueLabel = svg.append('text').attr('class', 'rig-values')

      l1Line
        .attr('x1', xScale(chordMid.x))
        .attr('y1', yScale(chordMid.y))
        .attr('x2', xScale(center.x))
        .attr('y2', yScale(center.y))

      const l2Offset = armLen * Math.cos(t0)
      l2ALine
        .attr('x1', xScale(center.x))
        .attr('y1', yScale(center.y))
        .attr('x2', xScale(center.x + l2Offset))
        .attr('y2', yScale(center.y))

      l2BLine
        .attr('x1', xScale(center.x))
        .attr('y1', yScale(center.y))
        .attr('x2', xScale(center.x - l2Offset))
        .attr('y2', yScale(center.y))

      l3Line
        .attr('x1', xScale(center.x))
        .attr('y1', yScale(center.y))
        .attr('x2', xScale(center.x))
        .attr('y2', yScale(center.y - armLen))

      l1Label
        .attr('x', xScale((center.x + chordMid.x) / 2))
        .attr('y', yScale((center.y + chordMid.y) / 2))
        .text('L1')

      l2Label
        .attr('x', xScale(center.x + l2Offset / 2))
        .attr('y', yScale(center.y))
        .text('L2')

      l2BLabel
        .attr('x', xScale(center.x - l2Offset / 2))
        .attr('y', yScale(center.y))
        .text('L2')

      l3Label
        .attr('x', xScale(center.x))
        .attr('y', yScale(center.y - armLen / 2))
        .text('L3')

      if (bestLengths) {
        const lines = [
          `L1 = ${formatNum(bestLengths.l1, 4)}`,
          `L2 = ${formatNum(bestLengths.l2, 4)}`,
          `L3 = ${formatNum(bestLengths.l3, 4)}`,
        ]
        valueLabel
          .attr('x', padding + 6)
          .attr('y', padding + 12)
          .selectAll('tspan')
          .data(lines)
          .join('tspan')
          .attr('x', padding + 6)
          .attr('dy', (_, i) => (i === 0 ? 0 : 14))
          .text((d) => d)
      }

      const sLine = svg.append('line').attr('class', 'rig-arm')
      const n1 = svg.append('circle').attr('class', 'rig-node')
      const n2 = svg.append('circle').attr('class', 'rig-node')
      const n3 = svg.append('circle').attr('class', 'rig-node')
      const arcPath = svg.append('path').attr('class', 'rig-arc')

      const lineGen = d3
        .line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))

      const updateS = (tS) => {
        const n1Pos = { x: a * Math.cos(tS), y: h + b * Math.sin(tS) }
        const n2Pos = { x: 0, y: h - (a - b) * Math.sin(tS) }
        const n3Pos = { x: (a - b) * Math.cos(tS), y: h }

        sLine
          .attr('x1', xScale(n1Pos.x))
          .attr('y1', yScale(n1Pos.y))
          .attr('x2', xScale(n2Pos.x))
          .attr('y2', yScale(n2Pos.y))

        n1.attr('cx', xScale(n1Pos.x)).attr('cy', yScale(n1Pos.y)).attr('r', 5)
        n2.attr('cx', xScale(n2Pos.x)).attr('cy', yScale(n2Pos.y)).attr('r', 5)
        n3.attr('cx', xScale(n3Pos.x)).attr('cy', yScale(n3Pos.y)).attr('r', 5)

        if (tS <= t0) {
          arcPath.attr('d', '')
          return
        }
        const steps = 80
        const pts = d3.range(steps + 1).map((idx) => {
          const t = t0 + ((tS - t0) * idx) / steps
          return { x: a * Math.cos(t), y: h + b * Math.sin(t) }
        })
        arcPath.attr('d', lineGen(pts))
      }

      const timings = {
        l1: 800,
        l2A: 800,
        l2B: 800,
        l3: 800,
        s: 800,
        sweep: 1800,
        fade: 800,
        pause: 800,
      }
      const tL1 = timings.l1
      const tL2A = tL1 + timings.l2A
      const tL2B = tL2A + timings.l2B
      const tL3 = tL2B + timings.l3
      const tS = tL3 + timings.s
      const tSweep = tS + timings.sweep
      const tFade = tSweep + timings.fade
      const total = tFade + timings.pause

      const render = (now) => {
        if (!startTime) startTime = now
        const elapsed = (now - startTime) % total

        let l1Opacity = 0
        let l2AOpacity = 0
        let l2BOpacity = 0
        let l3Opacity = 0
        let sOpacity = 0
        let arcOpacity = 0
        let tSVal = t0

        if (elapsed < tL1) {
          l1Opacity = elapsed / timings.l1
        } else if (elapsed < tL2A) {
          l1Opacity = 1
          l2AOpacity = (elapsed - tL1) / timings.l2A
        } else if (elapsed < tL2B) {
          l1Opacity = 1
          l2AOpacity = 1
          l2BOpacity = (elapsed - tL2A) / timings.l2B
        } else if (elapsed < tL3) {
          l1Opacity = 1
          l2AOpacity = 1
          l2BOpacity = 1
          l3Opacity = (elapsed - tL2B) / timings.l3
        } else if (elapsed < tS) {
          l1Opacity = 1
          l2AOpacity = 1
          l2BOpacity = 1
          l3Opacity = 1
          sOpacity = (elapsed - tL3) / timings.s
        } else if (elapsed < tSweep) {
          l1Opacity = 1
          l2AOpacity = 1
          l2BOpacity = 1
          l3Opacity = 1
          sOpacity = 1
          const prog = (elapsed - tS) / timings.sweep
          tSVal = t0 + prog * (t1 - t0)
          arcOpacity = prog
        } else if (elapsed < tFade) {
          const fade = 1 - (elapsed - tSweep) / timings.fade
          l1Opacity = fade
          l2AOpacity = fade
          l2BOpacity = fade
          l3Opacity = fade
          sOpacity = fade
          arcOpacity = fade
          tSVal = t1
        }

        l1Line.attr('opacity', l1Opacity)
        l2ALine.attr('opacity', l2AOpacity)
        l2BLine.attr('opacity', l2BOpacity)
        l3Line.attr('opacity', l3Opacity)
        l1Label.attr('opacity', l1Opacity)
        l2Label.attr('opacity', l2AOpacity)
        l2BLabel.attr('opacity', l2BOpacity)
        l3Label.attr('opacity', l3Opacity)
        sLine.attr('opacity', sOpacity)
        n1.attr('opacity', sOpacity)
        n2.attr('opacity', sOpacity)
        n3.attr('opacity', sOpacity)
        arcPath.attr('opacity', arcOpacity)

        updateS(tSVal)

        rafId = window.requestAnimationFrame(render)
      }

      updateS(t0)
      l1Line.attr('opacity', 0)
      l2ALine.attr('opacity', 0)
      l2BLine.attr('opacity', 0)
      l3Line.attr('opacity', 0)
      l1Label.attr('opacity', 0)
      l2Label.attr('opacity', 0)
      l2BLabel.attr('opacity', 0)
      l3Label.attr('opacity', 0)
      sLine.attr('opacity', 0)
      n1.attr('opacity', 0)
      n2.attr('opacity', 0)
      n3.attr('opacity', 0)
      arcPath.attr('opacity', 0)
      chordLine.attr('opacity', 1)

      startTime = 0
      rafId = window.requestAnimationFrame(render)
    }

    draw()
    const handleResize = () => {
      const width = container.clientWidth || 640
      if (Math.abs((lastWidthRef.current ?? 0) - width) < 1) return
      draw()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(rafId)
    }
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

export default ArchiAnimationChart
