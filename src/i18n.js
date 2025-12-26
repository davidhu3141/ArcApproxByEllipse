const MESSAGES = {
  en: {
    app: {
      heroTitle: 'Approximate an Arc with an Ellipse',
      heroLede:
        'Enter arc parameters and the tool searches for an ellipse that meets the constraints, then visualizes the results. The goal is to approximate a large-radius arc with a smaller ellipse.',
      status: 'Under development',
      langSwitch: 'Language',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: 'Circle and Ellipse',
        animationTitle: 'Archimedean Ellipse Trammel',
        errorTitle: 'Error vs Angle',
        attemptsTitle: 'Tried Ellipse Semi-Axes (a, b)',
      },
      basicSettingsTitle: 'Arc settings',
      basicSettingsHelper:
        'You can enter either the central angle or the chord length.',
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
      statTargetA: 'a (search target)',
      statTargetSum: 'a + b',
      statTargetMinAB: 'min(a, b)',
      statTargetL1L3: 'L1 + L3',
      statL1: 'L1',
      statL2: 'L2',
      statL3: 'L3',
      bestNote:
        'L1, L2, and L3 are defined in the animation above. On the trammel rod, the distances from the pen to the two nodes (shuttles) are a and b.',
      noBest: 'No valid ellipse yet.',
      searchSettingsTitle: 'Advanced search settings',
      expand: 'Expand',
      collapse: 'Collapse',
      advancedHelper:
        'Adjust the sampling steps for points P (midpoint), Q (right quarter), and R (right endpoint), as well as the arc sampling steps (ts).',
      advancedWarning:
        'Warning: unchecking this may slow down calculations.',
      minimizeByLabel: 'Optimization target (usually does not affect results)',
      minimizeByMinAB: 'Minimize min(a, b)',
      minimizeByA: 'Minimize a',
      minimizeBySum: 'Minimize a + b',
      minimizeByL1L3: 'Minimize L1 + L3',
      offsetP: 'P sampling steps',
      offsetQ: 'Q sampling steps',
      offsetR: 'R sampling steps',
      arcSample: 'Error sampling steps',
      skipWorse:
        'Skip error checks when the ellipse is already larger than the current smallest.',
      showAttempts: 'Show "Tried ellipse semi-axes" chart',
      disableP: 'Disable P sampling (always on arc)',
      disableR: 'Disable R sampling (always on arc)',
      readmeTitle: 'Readme',
      readmeHelper: 'Learn more about the background of the project and computation details.',
      readmeLink: 'Open GitHub README',
    },
  },
  'zh-tw': {
    app: {
      heroTitle: '以橢圓近似圓弧',
      heroLede:
        '輸入圓弧的參數後，本工具會依據條件搜尋橢圓，並在圖表中顯示結果。本工具旨在用較小的橢圓近似半徑很大的一段圓弧。',
      status: '開發中',
      langSwitch: '語系',
      langEn: 'EN',
      langZhTw: '繁中',
      charts: {
        viewportTitle: '圓與橢圓',
        animationTitle: '橢圓規演示',
        errorTitle: '各角度誤差',
        attemptsTitle: '已嘗試的橢圓半軸 (a, b)',
      },
      basicSettingsTitle: '圓弧設定',
      basicSettingsHelper: '圓心角與弦長可以擇一輸入',
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
      statTargetA: 'a (搜尋目標)',
      statTargetSum: 'a + b',
      statTargetMinAB: 'min(a, b)',
      statTargetL1L3: 'L1 + L3',
      statL1: 'L1',
      statL2: 'L2',
      statL3: 'L3',
      bestNote:
        'L1, L2, L3 的定義如上方動畫所示；阿基米德橢圓規的桿子上，筆到兩個節點 (可能是梭子/釘子/滑塊) 的距離為 a 與 b。',
      noBest: '尚未找到符合的橢圓。',
      searchSettingsTitle: '進階搜尋設定',
      expand: '展開',
      collapse: '收合',
      advancedHelper:
        '控制橢圓弧上三點 P（中點）、Q（右側 1/4 處）、R（右端點）的取樣步數，以及弧長取樣步數（ts）。',
      advancedWarning: '注意：取消勾選可能會讓計算變慢。',
      minimizeByLabel: '最佳化目標 (通常不會影響結果)',
      minimizeByMinAB: 'min(a, b) 最小',
      minimizeByA: 'a 最小',
      minimizeBySum: 'a + b 最小',
      minimizeByL1L3: 'L1 + L3 最小',
      offsetP: 'P 點取樣步數',
      offsetQ: 'Q 點取樣步數',
      offsetR: 'R 點取樣步數',
      arcSample: '誤差取樣步數',
      skipWorse: "若橢圓已比目前最小的還大則跳過誤差驗證。",
      showAttempts: '顯示「已嘗試的橢圓半軸」圖表',
      disableP: '停用 P 取樣 (恆取在圓弧上)',
      disableR: '停用 R 取樣 (恆取在圓弧上)',
      readmeTitle: 'Readme',
      readmeHelper: '查看本專案的開發背景說明與運算細節。',
      readmeLink: '前往 GitHub README',
    },
  },
}

const getByPath = (obj, path) =>
  path.split('.').reduce((value, key) => (value ? value[key] : undefined), obj)

const normalizeLocale = (locale) => (locale === 'zh-tw' ? 'zh-tw' : 'en')

const getLocaleFromQuery = (search) => {
  const params = new URLSearchParams(search || '')
  return normalizeLocale(params.get('lang'))
}

const normalizeBaseUrl = (baseUrl) => {
  const withLeading = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

const getLocaleHref = (baseUrl, targetLocale) => {
  const normalized = normalizeBaseUrl(baseUrl || '/')
  const locale = normalizeLocale(targetLocale)
  return `${normalized}?lang=${locale}`
}

const createT = (locale) => {
  const normalized = normalizeLocale(locale)
  return (key) => {
    const value =
      getByPath(MESSAGES[normalized], key) ?? getByPath(MESSAGES.en, key)
    return value ?? key
  }
}

export { MESSAGES, createT, getLocaleFromQuery, getLocaleHref, normalizeLocale }
