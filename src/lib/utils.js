export const toRad = (deg) => (deg * Math.PI) / 180

export const formatNum = (num, digits = 4) =>
  Number.isFinite(num) ? Number(num.toFixed(digits)).toString() : ''
