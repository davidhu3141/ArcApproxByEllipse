import { useCallback, useEffect, useState } from 'react'
import ArcViewportChart from './components/ArcViewportChart'
import ArchiAnimationChart from './components/ArchiAnimationChart'
import ErrorChart from './components/ErrorChart'
import AttemptsChart from './components/AttemptsChart'
import { formatNum, toRad } from './lib/utils'
import { runEllipseSearch } from './lib/search'
import './App.css'
import { createT, getLocaleFromPath, getLocaleHref } from './i18n'

const versionCode = "v0.0.1.1222.3";

const isDevMode = false;
const maxStepNumber = isDevMode ? 50 : 30;

function AppContent({ t, locale, localeLinks }) {
  const [radius, setRadius] = useState('700')
  const [theta, setTheta] = useState('20')
  const [chord, setChord] = useState(() => {
    const r = 700
    const t = 20
    return (2 * r * Math.sin(toRad(t / 2))).toFixed(4)
  })
  const [tolerance, setTolerance] = useState('0.4')
  const [offsetStepsD, setOffsetStepsD] = useState('25')
  const [offsetStepsD1, setOffsetStepsD1] = useState('10')
  const [offsetStepsD2, setOffsetStepsD2] = useState('10')
  const [tsSteps, setTsSteps] = useState('20')
  const [skipWorse, setSkipWorse] = useState(true)
  const [minimizeBy, setMinimizeBy] = useState('a')
  const [forceZeroD1, setForceZeroD1] = useState(true)
  const [forceZeroD2, setForceZeroD2] = useState(true)
  const [showAttemptsChart, setShowAttemptsChart] = useState(isDevMode)
  const [showAdvanced, setShowAdvanced] = useState(isDevMode)
  const [attempts, setAttempts] = useState([])
  const [bestAttempt, setBestAttempt] = useState(null)
  const [errorSeries, setErrorSeries] = useState([])
  const [bestLengths, setBestLengths] = useState(null)
  const radiusNum = parseFloat(radius)
  const toleranceNum = parseFloat(tolerance)
  const radiusSliderMax = 2000
  const toleranceSliderMax = 1
  const chordMax = Number.isFinite(radiusNum) && radiusNum > 0 ? radiusNum * 2 : 2000
  const radiusSliderValue = Number.isFinite(radiusNum) ? Math.min(radiusNum, radiusSliderMax) : 0
  const thetaNum = parseFloat(theta)
  const thetaSliderValue = Number.isFinite(thetaNum) ? Math.min(thetaNum, 180) : 0
  const chordNum = parseFloat(chord)
  const chordSliderValue = Number.isFinite(chordNum) ? Math.min(chordNum, chordMax) : 0
  const toleranceSliderValue = Number.isFinite(toleranceNum) ? Math.min(toleranceNum, toleranceSliderMax) : 0

  const bestTarget = (() => {
    if (!bestAttempt) return null
    if (minimizeBy === 'sum') {
      return { label: t('app.statTargetSum'), value: bestAttempt.a + bestAttempt.b }
    }
    if (minimizeBy === 'l1l3') {
      if (!bestLengths) return null
      return { label: t('app.statTargetL1L3'), value: bestLengths.l1 + bestLengths.l3 }
    }
    return { label: t('app.statTargetA'), value: bestAttempt.a }
  })()

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
    const { attempts: a, bestAttempt: best, errorSeries: es, bestLengths: lengths } = runEllipseSearch({
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
      minimizeBy,
    })
    setAttempts(a)
    setBestAttempt(best)
    setErrorSeries(es)
    setBestLengths(lengths)
  }, [radius, theta, tolerance, offsetStepsD, offsetStepsD1, offsetStepsD2, tsSteps, skipWorse, forceZeroD1, forceZeroD2, minimizeBy])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__text">
          <h1>{t('app.heroTitle')}</h1>
          <p className="lede">
            {t('app.heroLede')}
          </p>
          <div className="hero__meta">
            <span className="pill">{versionCode}</span>
            <span className="pill">{t('app.status')}</span>
            <div className="lang-switch">
              <span className="lang-label">{t('app.langSwitch')}</span>
              <a
                className={`lang-btn${locale === 'en' ? ' is-active' : ''}`}
                href={localeLinks.en}
              >
                {t('app.langEn')}
              </a>
              <a
                className={`lang-btn${locale === 'zh-tw' ? ' is-active' : ''}`}
                href={localeLinks['zh-tw']}
              >
                {t('app.langZhTw')}
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="charts-grid">
        <ArcViewportChart
          title={t('app.charts.viewportTitle')}
          height={320}
          radius={radius}
          thetaDeg={theta}
          bestEllipse={bestAttempt}
          layoutToggle={showAttemptsChart}
        />
        <ArchiAnimationChart
          title={t('app.charts.animationTitle')}
          height={320}
          radius={radius}
          thetaDeg={theta}
          bestEllipse={bestAttempt}
          bestLengths={bestLengths}
          layoutToggle={showAttemptsChart}
        />
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>{t('app.basicSettingsTitle')}</h2>
          </div>
          <p className="helper-text">
            {t('app.basicSettingsHelper')}
          </p>
        </div>
        <div className="input-grid">
          <label className="field">
            <span>{t('app.fieldRadius')}</span>
            <div className="field__controls">
              <input
                type="range"
                min="0"
                max={radiusSliderMax}
                step="1"
                value={radiusSliderValue}
                onChange={(e) => handleRadiusChange(e.target.value)}
              />
              <input
                type="number"
                min="0"
                value={radius}
                onChange={(e) => handleRadiusChange(e.target.value)}
                placeholder={t('app.placeholderRadius')}
              />
            </div>
          </label>
          <label className="field">
            <span>{t('app.fieldTheta')}</span>
            <div className="field__controls">
              <input
                type="range"
                min="0"
                max="180"
                step="0.1"
                value={thetaSliderValue}
                onChange={(e) => handleThetaChange(e.target.value)}
              />
              <input
                type="number"
                value={theta}
                min="0"
                max="180"
                onChange={(e) => handleThetaChange(e.target.value)}
                placeholder={t('app.placeholderTheta')}
              />
            </div>
          </label>
          <label className="field">
            <span>{t('app.fieldChord')}</span>
            <div className="field__controls">
              <input
                type="range"
                min="0"
                max={chordMax}
                step="0.1"
                value={chordSliderValue}
                onChange={(e) => handleChordChange(e.target.value)}
              />
              <input
                type="number"
                min="0"
                max={radius !== '' && Number.isFinite(parseFloat(radius)) ? 2 * parseFloat(radius) : undefined}
                value={chord}
                onChange={(e) => handleChordChange(e.target.value)}
                placeholder={t('app.placeholderChord')}
              />
            </div>
          </label>
          <label className="field">
            <span>{t('app.fieldTolerance')}</span>
            <div className="field__controls">
              <input
                type="range"
                min="0"
                max={toleranceSliderMax}
                step="0.01"
                value={toleranceSliderValue}
                onChange={(e) => setTolerance(e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                placeholder={t('app.placeholderTolerance')}
              />
            </div>
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>{t('app.currentBestTitle')}</h2>
          </div>
        </div>
        {bestAttempt ? (
          <div className="best-grid">
            <div className="stat">
              <p className="stat-label">{t('app.statA')}</p>
              <p className="stat-value">{formatNum(bestAttempt.a, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">{t('app.statB')}</p>
              <p className="stat-value">{formatNum(bestAttempt.b, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">{t('app.statH')}</p>
              <p className="stat-value">{formatNum(bestAttempt.h, 4)}</p>
            </div>
            <div className="stat">
              <p className="stat-label">{t('app.statErr')}</p>
              <p className="stat-value">{formatNum(bestAttempt.err, 6)}</p>
            </div>
            {bestTarget && (
              <div className="stat">
                <p className="stat-label">{bestTarget.label}</p>
                <p className="stat-value">{formatNum(bestTarget.value, 4)}</p>
              </div>
            )}
            {bestLengths && (
              <>
                <div className="stat">
                  <p className="stat-label">{t('app.statL1')}</p>
                  <p className="stat-value">{formatNum(bestLengths.l1, 4)}</p>
                </div>
                <div className="stat">
                  <p className="stat-label">{t('app.statL2')}</p>
                  <p className="stat-value">{formatNum(bestLengths.l2, 4)}</p>
                </div>
                <div className="stat">
                  <p className="stat-label">{t('app.statL3')}</p>
                  <p className="stat-value">{formatNum(bestLengths.l3, 4)}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="helper-text">{t('app.noBest')}</p>
        )}
      </section>

      <section className="charts-grid">
        <ErrorChart
          title={t('app.charts.errorTitle')}
          height={260}
          series={errorSeries}
          tolerance={parseFloat(tolerance) || 0}
          layoutToggle={showAttemptsChart}
        />
        {showAttemptsChart && (
          <AttemptsChart
            title={t('app.charts.attemptsTitle')}
            height={260}
            attempts={attempts}
            best={bestAttempt}
          />
        )}
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>{t('app.searchSettingsTitle')}</h2>
          </div>
          <div className="panel__actions">
            <button className="link-btn" type="button" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? t('app.collapse') : t('app.expand')}
            </button>
          </div>
        </div>
        {showAdvanced && (
          <>
            <p className="helper-text">
              {t('app.advancedHelper')}
            </p>
            <div className="input-grid">
              <label className="field">
                <span>{t('app.offsetP')}</span>
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
                <span>{t('app.offsetQ')}</span>
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
                <span>{t('app.offsetR')}</span>
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
                <span>{t('app.arcSample')}</span>
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
                <span>{t('app.skipWorse')}</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={showAttemptsChart}
                  onChange={(e) => setShowAttemptsChart(e.target.checked)}
                />
                <span>{t('app.showAttempts')}</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={forceZeroD1}
                  onChange={(e) => setForceZeroD1(e.target.checked)}
                />
                <span>{t('app.disableP')}</span>
              </label>
              <label className="field checkbox-field">
                <input
                  type="checkbox"
                  checked={forceZeroD2}
                  onChange={(e) => setForceZeroD2(e.target.checked)}
                />
                <span>{t('app.disableR')}</span>
              </label>
              <label className="field">
                <span>{t('app.minimizeByLabel')}</span>
                <select
                  value={minimizeBy}
                  onChange={(e) => setMinimizeBy(e.target.value)}
                >
                  <option value="a">{t('app.minimizeByA')}</option>
                  <option value="sum">{t('app.minimizeBySum')}</option>
                  <option value="l1l3">{t('app.minimizeByL1L3')}</option>
                </select>
              </label>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function App() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '/'
  const locale = getLocaleFromPath(pathname)
  const t = createT(locale)
  const baseUrl = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/'
  const localeLinks = {
    en: getLocaleHref(baseUrl, 'en'),
    'zh-tw': getLocaleHref(baseUrl, 'zh-tw'),
  }

  return <AppContent t={t} locale={locale} localeLinks={localeLinks} />
}

export default App
