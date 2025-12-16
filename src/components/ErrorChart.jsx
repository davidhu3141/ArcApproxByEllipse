import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function ErrorChart({ series, tolerance, title, subtitle, layoutToggle, height = 260 }) {
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

    let seriesAfter90 = [...series].reverse().map(e => ({ ...e, deg: 180 - e.deg }));
    seriesAfter90.shift();
    series = series.concat(seriesAfter90);

    const xExtent = d3.extent(series, (d) => d.deg)
    const xDomain = xExtent[0] === xExtent[1] ? [xExtent[0] - 1, xExtent[1] + 1] : xExtent
    const yMin = Math.min(0, d3.min(series, (d) => d.err) || 0) * 1.1
    const yMax = Math.max(tolerance, d3.max(series, (d) => d.err) || 0) * 1.1
    const xScale = d3.scaleLinear().domain(xDomain).range([padding, width - padding])
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height - padding, padding])

    svg
      .append('g')
      .attr('transform', `translate(0, ${yScale(0)})`)
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

    svg
      .append('line')
      .attr('class', 'tolerance-line')
      .attr('x1', padding)
      .attr('x2', width - padding)
      .attr('y1', yScale(-tolerance))
      .attr('y2', yScale(-tolerance))

    const line = d3
      .line()
      .x((d) => xScale(d.deg))
      .y((d) => yScale(d.err))
      .curve(d3.curveMonotoneX)

    svg.append('path').attr('class', 'error-line').attr('d', line(series))
  }, [series, tolerance, height, layoutToggle])

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

export default ErrorChart
