export * from './constants';
export * from './theme';
// `theme` already exports COLORS; `colors` is a legacy duplicate
// that the active screens never import. Re-export it under an alias
// so any stragglers can still find the older `colors.COLORS` shape.
export { COLORS as LEGACY_COLORS } from './colors';
export * from './about.constant';