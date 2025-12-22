const MESSAGES = {
  en: {
    app: {
      heroTitle: 'Arc to Ellipse Exploration',
      heroLede:
        'Inputs, visualization frame, and D3 canvases wired to req2/req3 sampling. Layout is responsive for quick iteration.',
      status: 'Under development',
      langSwitch: 'Language',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: 'Plane view with circle / endpoints / ellipse',
        errorTitle: 'Error vs angle',
        attemptsTitle: 'Tried ellipse semi-axes',
      },
      basicSettingsTitle: 'Basic settings',
      basicSettingsHelper:
        'theta and chord sync each other; radius changes recompute chord. theta is the total span (90−theta/2 ~ 90+theta/2).',
      fieldRadius: 'Radius (R)',
      fieldTheta: 'Theta (deg)',
      fieldChord: 'Chord length',
      fieldTolerance: 'Tolerance e',
      placeholderRadius: 'e.g. 700',
      placeholderTheta: 'e.g. 20',
      placeholderChord: 'e.g. 243',
      placeholderTolerance: 'e.g. 0.1',
      basicFoot:
        'Each change tries 10×10×10 random (d,d1,d2) in (-e,e); keeps err <= e with minimal a+b, and plots its error curve and ellipse.',
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
        'Control sampling steps for offsets (d, d1, d2) and arc sampling (ts). Optionally skip attempts whose a+b is already worse than the best pass, force d1/d2 to 0, or show the attempts scatter plot.',
      offsetP: 'Offset steps for P',
      offsetQ: 'Offset steps for Q',
      offsetR: 'Offset steps for R',
      arcSample: 'Arc sample steps (ts)',
      skipWorse: "Skip when 'a' is already better than current attempt",
      showAttempts: 'Show "Tried ellipse semi-axes" chart',
      disableP: 'Disable P sampling',
      disableR: 'Disable R sampling',
    },
  },
  'zh-tw': {
    app: {
      heroTitle: '圓弧以橢圓近似',
      heroLede:
        '輸入參數後，系統會依據取樣條件搜尋橢圓，並在可視化圖表中顯示結果。',
      status: '開發中',
      langSwitch: '語系',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: '圓、端點與橢圓的平面視角',
        errorTitle: '誤差 vs 角度',
        attemptsTitle: '已嘗試的橢圓半軸',
      },
      basicSettingsTitle: '基本設定',
      basicSettingsHelper:
        'theta 與 chord 會同步更新；radius 改變會重新計算 chord。theta 是整個圓心角跨度（90−theta/2 ~ 90+theta/2）。',
      fieldRadius: '半徑 (R)',
      fieldTheta: 'Theta (角度)',
      fieldChord: '弦長',
      fieldTolerance: '容許誤差 e',
      placeholderRadius: '例如 700',
      placeholderTheta: '例如 20',
      placeholderChord: '例如 243',
      placeholderTolerance: '例如 0.1',
      basicFoot:
        '每次變更會嘗試 10×10×10 組 (d,d1,d2) 取樣，在 (-e,e) 範圍內找出 err <= e 且 a+b 最小的橢圓。',
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
        '控制偏移 (d, d1, d2) 的取樣步數與弧長取樣 (ts)。可跳過比目前最佳 a+b 更差的嘗試，或強制 d1/d2 為 0。',
      offsetP: 'P 點偏移步數',
      offsetQ: 'Q 點偏移步數',
      offsetR: 'R 點偏移步數',
      arcSample: '弧長取樣步數 (ts)',
      skipWorse: "若 a 已比目前最佳差則跳過",
      showAttempts: '顯示「已嘗試的橢圓半軸」圖表',
      disableP: '停用 P 取樣',
      disableR: '停用 R 取樣',
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
