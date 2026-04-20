import themes from '../constants/themes.json';

export const applyTheme = (themeId: string) => {
  const theme = (themes as any)[themeId];
  if (!theme) return;

  const root = document.documentElement;
  const colors = theme.colors;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--app-${key}`, value as string);
  });
  
  root.setAttribute('data-theme', themeId);
  
  // Toggle .dark class for shadcn/ui components
  if (themeId === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const getThemeConfig = (themeId: string) => {
  return (themes as any)[themeId];
};
