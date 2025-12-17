import { useCallback, useEffect, useState } from 'react'
import ArcViewportChart from './components/ArcViewportChart'
import ErrorChart from './components/ErrorChart'
import AttemptsChart from './components/AttemptsChart'
import { formatNum, toRad } from './lib/utils'
import { runEllipseSearch } from './lib/search'
import './App.css'

const isDevMode = false;
const maxStepNumber = isDevMode ? 50 : 30;

function App() {
  const [radius, setRadius] = useState('700')
  const [theta, setTheta] = useState('20')
  const [chord, setChord] = useState(() => {
    const r = 700
    const t = 20
    return (2 * r * Math.sin(toRad(t / 2))).toFixed(4)
  })
  const [tolerance, setTolerance] = useState('0.1')
  const [offsetStepsD, setOffsetStepsD] = useState('10')
  const [offsetStepsD1, setOffsetStepsD1] = useState('10')
  const [offsetStepsD2, setOffsetStepsD2] = useState('10')
  const [tsSteps, setTsSteps] = useState('20')
  const [skipWorse, setSkipWorse] = useState(true)
  const [forceZeroD1, setForceZeroD1] = useState(true)
  const [forceZeroD2, setForceZeroD2] = useState(true)
  const [showAttemptsChart, setShowAttemptsChart] = useState(isDevMode)
  const [showAdvanced, setShowAdvanced] = useState(isDevMode)
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
    const { attempts: a, bestAttempt: best, errorSeries: es } = runEllipseSearch({
      radius: parseFloat(radius),
      thetaDeg: parseFloat(theta),
      tolerance: parseFloat(tolerance),
      offsetsStepsD: parseInt(offsetStepsD, 10),
      offsetsStepsD1: parseInt(offsetStepsD1, 10),
      offsetsStepsD2: parseInt(offsetStepsD2, 10),
      tsSteps: parseInt(tsSteps, 10),
      skipWorseThanBest: skipWorse,
      constrainD1ForceZero: forceZeroD1,
      constrainD2ForceZero: forceZeroD2,
      maxStepNumber,
    })
    setAttempts(a)
    setBestAttempt(best)
    setErrorSeries(es)
  }, [radius, theta, tolerance, offsetStepsD, offsetStepsD1, offsetStepsD2, tsSteps, skipWorse, forceZeroD1, forceZeroD2])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <h1>Arc to Ellipse Exploration</h1>
          <p className="lede">
            Inputs, visualization frame, and D3 canvases wired to req2/req3 sampling. Layout is responsive for quick iteration.
          </p>
          <div className="hero__meta">
            <span className="pill">v0.0.1.1216.1</span>
            <span className="pill">Under development</span>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="panel__head">
          <div>
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
              placeholder="e.g. 700"
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
              placeholder="e.g. 20"
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
              placeholder="e.g. 243"
            />
          </label>
          <label className="field">
            <span>Tolerance e</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="e.g. 0.1"
            />
          </label>
        </div>
        <div className="panel__foot">
          <p>
            Each change tries 10×10×10 random (d,d1,d2) in (-e,e); keeps err &lt;= e with minimal a+b, and plots its error curve and ellipse.
          </p>
        </div>
      </section>

      <section className="charts-grid">
        <ArcViewportChart
          title="Plane view with circle / endpoints / ellipse"
          height={320}
          radius={radius}
          thetaDeg={theta}
          bestEllipse={bestAttempt}
          layoutToggle={showAttemptsChart}
        />
        <ErrorChart
          title="Angle vs error"
          height={260}
          series={errorSeries}
          tolerance={parseFloat(tolerance) || 0}
          layoutToggle={showAttemptsChart}
        />
        {showAttemptsChart && (
          <AttemptsChart
            title="Tried ellipse semi-axes"
            height={260}
            attempts={attempts}
            best={bestAttempt}
          />
        )}
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Current best ellipse</h2>
          </div>
        </div>
        {bestAttempt ? (
          <div className="best-grid">
            <div className="stat">
              <p className="stat-label">a</p>
              <p className="stat-value">{formatNum(bestAttempt.a, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">b</p>
              <p className="stat-value">{formatNum(bestAttempt.b, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">h (center y)</p>
              <p className="stat-value">{formatNum(bestAttempt.h, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">max err</p>
              <p className="stat-value">{formatNum(bestAttempt.err, 6)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">a + b</p>
              <p className="stat-value">{formatNum(bestAttempt.a + bestAttempt.b, 4)}</p>
            </div>
          </div>
        ) : (
          <p className="helper-text">No passing ellipse yet.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Search settings</h2>
          </div>
          <div className="panel__actions">
            <button className="link-btn" type="button" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        {showAdvanced && (
          <>
            <p className="helper-text">
              Control sampling steps for offsets (d, d1, d2) and arc sampling (ts). Optionally skip attempts whose a+b is already worse than the best pass, force d1/d2 to 0, or show the attempts scatter plot.
            </p>
            <div className="input-grid">
              <label className="field">
                <span>Offset steps for d</span>
                <input
                  type="number"
                  min="2"
                  max={maxStepNumber}
                  value={offsetStepsD}
                  onChange={(e) => setOffsetStepsD(e.target.value)}
                  placeholder={`2 - ${maxStepNumber}`}
                />
              </label>
              <label className="field">
                <span>Offset steps for d1</span>
                <input
                  type="number"
                  min="2"
                  max={maxStepNumber}
                  value={offsetStepsD1}
                  onChange={(e) => setOffsetStepsD1(e.target.value)}
                  placeholder={`2 - ${maxStepNumber}`}
                  disabled={forceZeroD1}
                />
              </label>
              <label className="field">
                <span>Offset steps for d2</span>
                <input
                  type="number"
                  min="2"
                  max={maxStepNumber}
                  value={offsetStepsD2}
                  onChange={(e) => setOffsetStepsD2(e.target.value)}
                  placeholder={`2 - ${maxStepNumber}`}
                  disabled={forceZeroD2}
                />
              </label>
              <label className="field">
                <span>Arc sample steps (ts)</span>
                <input
                  type="number"
                  min="4"
                  max={maxStepNumber}
                  value={tsSteps}
                  onChange={(e) => setTsSteps(e.target.value)}
                  placeholder={`4 - ${maxStepNumber}`}
                />
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={skipWorse}
                  onChange={(e) => setSkipWorse(e.target.checked)}
                />
                <span>Skip when a+b already better than current attempt</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={showAttemptsChart}
                  onChange={(e) => setShowAttemptsChart(e.target.checked)}
                />
                <span>Show "Tried ellipse semi-axes" chart</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={forceZeroD1}
                  onChange={(e) => setForceZeroD1(e.target.checked)}
                />
                <span>Force d1 = 0 (disable d1 sampling)</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={forceZeroD2}
                  onChange={(e) => setForceZeroD2(e.target.checked)}
                />
                <span>Force d2 = 0 (disable d2 sampling)</span>
              </label>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default App
