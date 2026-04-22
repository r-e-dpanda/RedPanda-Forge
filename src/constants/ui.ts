/**
 * Centralized UI scale configuration to avoid hardcoding sizes.
 * These base values are multiplied by settings.uiScale at runtime.
 */

export const UI_BASE_CONFIG = {
  // Typography (Base pixels for 1.0 scale)
  font: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 18,
    xl: 22
  },
  // Icon sizes for Lucide
  icon: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24
  }
};

/**
 * Returns scaled sizes based on a scale factor.
 */
export const getUISizes = (scale: number = 1.0) => {
  const scaled = {
    font: {
      xs: `${Math.round(UI_BASE_CONFIG.font.xs * scale)}px`,
      sm: `${Math.round(UI_BASE_CONFIG.font.sm * scale)}px`,
      base: `${Math.round(UI_BASE_CONFIG.font.base * scale)}px`,
      md: `${Math.round(UI_BASE_CONFIG.font.md * scale)}px`,
      lg: `${Math.round(UI_BASE_CONFIG.font.lg * scale)}px`,
      xl: `${Math.round(UI_BASE_CONFIG.font.xl * scale)}px`,
    },
    icon: {
      xs: Math.round(UI_BASE_CONFIG.icon.xs * scale),
      sm: Math.round(UI_BASE_CONFIG.icon.sm * scale),
      base: Math.round(UI_BASE_CONFIG.icon.base * scale),
      md: Math.round(UI_BASE_CONFIG.icon.md * scale),
      lg: Math.round(UI_BASE_CONFIG.icon.lg * scale),
      xl: Math.round(UI_BASE_CONFIG.icon.xl * scale),
    }
  };
  return scaled;
};
