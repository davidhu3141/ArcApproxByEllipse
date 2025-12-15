import * as d3 from 'd3'
import { toRad } from './utils'

// calculations.js port (ESM)
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

export function runEllipseSearch({
  radius,
  thetaDeg,
  tolerance,
  offsetsStepsD = 10,
  offsetsStepsD1 = 10,
  offsetsStepsD2 = 10,
  tsSteps = 10,
  skipWorseThanBest = false,
  constrainD2ForceZero = false,
}) {
  const r = Number(radius)
  const tDeg = Number(thetaDeg)
  const e = Number(tolerance)

  if (!(Number.isFinite(r) && r > 0 && Number.isFinite(tDeg) && tDeg > 0 && tDeg <= 180 && Number.isFinite(e) && e > 0)) {
    return { attempts: [], bestAttempt: null, errorSeries: [] }
  }

  const thetaRad = toRad(tDeg)
  const half = thetaRad / 2
  const quarter = thetaRad / 4
  const attemptsList = []

  const clampOffsetsD = Math.min(Math.max(Math.round(offsetsStepsD), 2), 20)
  const clampOffsetsD1 = Math.min(Math.max(Math.round(offsetsStepsD1), 2), 20)
  const clampOffsetsD2 = Math.min(Math.max(Math.round(offsetsStepsD2), 2), 20)
  const clampTs = Math.min(Math.max(Math.round(tsSteps), 4), 50)

  const sampleOffsets = (n, allowNegative = true) => {
    const span = allowNegative ? 2 * e : e
    const start = allowNegative ? -e : 0
    const step = span / (n - 1)
    return Array.from({ length: n }, (_, i) => start + i * step)
  }

  const ds = sampleOffsets(clampOffsetsD, true)
  const d1s = sampleOffsets(clampOffsetsD1, true)
  const d2s = constrainD2ForceZero ? [0] : sampleOffsets(clampOffsetsD2, true)

  let attemptId = 0
  let bestAcceptedSum = Infinity
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
          const sumAB = a + b
          if (skipWorseThanBest && bestAcceptedSum !== Infinity && sumAB >= bestAcceptedSum) {
            continue
          }
          const ratio = ((r + d2) * Math.cos(Math.PI / 2 - half)) / a
          if (Math.abs(ratio) > 1) continue

          const t0 = Math.acos(ratio)
          const t1 = Math.PI - t0
          if (!(t0 < Math.PI / 2 && t1 > t0)) continue

          const steps = clampTs
          const ts = d3.range(steps).map((idx) => t0 + ((Math.PI / 2 - t0) * idx) / (steps - 1))
          const series = ts.map((tVal) => {
            const x = a * Math.cos(tVal)
            const y = b * Math.sin(tVal) + h
            const rTilde = Math.hypot(x, y)
            const deg = Math.acos(x / Math.hypot(x, y)) * 180 / Math.PI
            return { deg, tDeg: (tVal * 180) / Math.PI, err: rTilde - r }
          })
          const maxErr = d3.max(series, (dVal) => Math.abs(dVal.err)) || Infinity
          attemptsList.push({
            id: `att-${attemptId}`,
            a,
            b,
            h,
            err: maxErr,
            accepted: maxErr <= e,
            series,
          })
          if (maxErr <= e) {
            bestAcceptedSum = Math.min(bestAcceptedSum, sumAB)
          }
          attemptId += 1
        } catch (err) {
          // skip invalid attempt
        }
      }
    }
  }

  const bestAttempt = attemptsList
    .filter((a) => a.accepted)
    .sort((a, b) => a.a + a.b - (b.a + b.b))[0] || null

  return {
    attempts: attemptsList,
    bestAttempt,
    errorSeries: bestAttempt ? bestAttempt.series : [],
  }
}
