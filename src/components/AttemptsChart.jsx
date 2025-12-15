import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { formatNum } from '../lib/utils'

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

    const fails = attempts.filter((d) => !d.accepted)
    const passes = attempts.filter((d) => d.accepted)

    svg
      .selectAll('circle.attempt-dot.fail')
      .data(fails)
      .enter()
      .append('circle')
      .attr('class', 'attempt-dot attempt-dot--fail')
      .attr('r', 2)
      .attr('cx', (d) => xScale(d.a))
      .attr('cy', (d) => yScale(d.b))
      .append('title')
      .text((d) => `a=${formatNum(d.a, 3)}, b=${formatNum(d.b, 3)}, err=${formatNum(d.err, 4)}`)

    svg
      .selectAll('circle.attempt-dot.pass')
      .data(passes)
      .enter()
      .append('circle')
      .attr('class', 'attempt-dot attempt-dot--pass')
      .attr('r', 2)
      .attr('cx', (d) => xScale(d.a))
      .attr('cy', (d) => yScale(d.b))
      .attr('fill', '#6fdc8c')
      .append('title')
      .text((d) => `a=${formatNum(d.a, 3)}, b=${formatNum(d.b, 3)}, err=${formatNum(d.err, 4)}`)

    if (best) {
      svg
        .append('circle')
        .attr('class', 'attempt-dot attempt-dot--best')
        .attr('r', 5)
        .attr('cx', xScale(best.a))
        .attr('cy', yScale(best.b))
        .attr('stroke', 'rgba(0,0,0,0.6)')
        .attr('stroke-width', 1.6)
        .raise()
    }
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

export default AttemptsChart
