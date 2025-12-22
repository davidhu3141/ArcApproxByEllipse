const MESSAGES = {
  en: {
    app: {
      heroTitle: 'Approximate an Arc with an Ellipse',
      heroLede:
        'After you enter arc parameters, the tool searches for an ellipse under the constraints and shows results in charts. The goal is to use a smaller ellipse to approximate a large-radius arc.',
      status: 'Under development',
      langSwitch: 'Language',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: 'Circle and ellipse',
        errorTitle: 'Error vs angle',
        attemptsTitle: 'Tried ellipse semi-axes',
      },
      basicSettingsTitle: 'Basic settings',
      basicSettingsHelper:
        'Enter the radius, central angle or chord length, and tolerance.',
      fieldRadius: 'Radius',
      fieldTheta: 'Angle',
      fieldChord: 'Chord length',
      fieldTolerance: 'Tolerance',
      placeholderRadius: 'e.g. 700',
      placeholderTheta: 'e.g. 20',
      placeholderChord: 'e.g. 243',
      placeholderTolerance: 'e.g. 0.4',
      currentBestTitle: 'Current best ellipse',
      statA: 'a',
      statB: 'b',
      statH: 'h (center y)',
      statErr: 'max err',
      statSum: 'a + b',
      noBest: 'No passing ellipse yet.',
      searchSettingsTitle: 'Search settings',
      expand: 'Expand',
      collapse: 'Collapse',
      advancedHelper:
        'Control sampling steps for P (midpoint), Q (right quarter), and R (right endpoint) plus arc sampling steps (ts). If the resulting ellipse is larger than the current smallest, you can skip error checks. You can also force P/R to stay on the arc.',
      offsetP: 'P sampling steps',
      offsetQ: 'Q sampling steps',
      offsetR: 'R sampling steps',
      arcSample: 'Error sampling steps',
      skipWorse:
        'Skip error checks when the ellipse is already larger than the current smallest',
      showAttempts: 'Show "Tried ellipse semi-axes" chart',
      disableP: 'Disable P sampling (always on arc)',
      disableR: 'Disable R sampling (always on arc)',
    },
  },
  'zh-tw': {
    app: {
      heroTitle: '以橢圓近似圓弧',
      heroLede:
        '輸入圓弧的參數後，本工具會依據條件搜尋橢圓，並在圖表中顯示結果。本工具旨在用較小的橢圓近似半徑很大的一段圓弧',
      status: '開發中',
      langSwitch: '語系',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: '圓與橢圓',
        errorTitle: '各角度誤差',
        attemptsTitle: '已嘗試的橢圓半軸',
      },
      basicSettingsTitle: '基本設定',
      basicSettingsHelper: '輸入半徑、圓心角或弦長、誤差容忍值',
      fieldRadius: '半徑',
      fieldTheta: '角度',
      fieldChord: '弦長',
      fieldTolerance: '容許誤差',
      placeholderRadius: '例如 700',
      placeholderTheta: '例如 20',
      placeholderChord: '例如 243',
      placeholderTolerance: '例如 0.4',
      currentBestTitle: '目前最佳橢圓',
      statA: 'a',
      statB: 'b',
      statH: 'h (中心 y)',
      statErr: '最大誤差',
      statSum: 'a + b',
      noBest: '尚未找到符合的橢圓。',
      searchSettingsTitle: '搜尋設定',
      expand: '展開',
      collapse: '收合',
      advancedHelper:
        '控制橢圓弧上三點 P (中點), Q (右邊 1/4 處), R (右端點) 的取樣步數與弧長取樣步數 (ts)。三點決定出的橢圓比目前最小者還大時可跳過誤差值驗證。可強制 P/R 在圓弧上。',
      offsetP: 'P 點取樣步數',
      offsetQ: 'Q 點取樣步數',
      offsetR: 'R 點取樣步數',
      arcSample: '誤差取樣步數',
      skipWorse: "若橢圓已比目前最小的還大則跳過誤差驗證",
      showAttempts: '顯示「已嘗試的橢圓半軸」圖表',
      disableP: '停用 P 取樣 (恆取在圓弧上)',
      disableR: '停用 R 取樣 (恆取在圓弧上)',
    },
  },
}

const getByPath = (obj, path) =>
  path.split('.').reduce((value, key) => (value ? value[key] : undefined), obj)

const normalizeLocale = (locale) => (locale === 'zh-tw' ? 'zh-tw' : 'en')

const getLocaleFromPath = (pathname) => {
  const trimmed = pathname.replace(/\/+$/, '')
  if (
    trimmed === '/zh-tw' ||
    trimmed.endsWith('/zh-tw') ||
    trimmed.endsWith('/zh-tw/index.html')
  ) {
    return 'zh-tw'
  }
  return 'en'
}

const normalizeBaseUrl = (baseUrl) => {
  const withLeading = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

const getLocaleHref = (baseUrl, targetLocale) => {
  const normalized = normalizeBaseUrl(baseUrl || '/')
  if (targetLocale === 'zh-tw') {
    return `${normalized}zh-tw`
  }
  return normalized
}

const createT = (locale) => {
  const normalized = normalizeLocale(locale)
  return (key) => {
    const value =
      getByPath(MESSAGES[normalized], key) ?? getByPath(MESSAGES.en, key)
    return value ?? key
  }
}

export { MESSAGES, createT, getLocaleFromPath, getLocaleHref, normalizeLocale }
