import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { defineEcConfig } from 'astro-expressive-code';

const code = {
  lightTheme: 'sibsys-light',
  darkTheme: 'sibsys-dark',
  lineNumbers: true,
  wrap: true,
  preserveIndent: true,
  collapseStyle: 'collapsible-auto',
};

const isDarkCodeTheme = ({ theme }) => theme.name === code.darkTheme;
const monochromeTheme = (name, type, background, foreground, muted) => ({
  name,
  type,
  colors: {
    'editor.background': background,
    'editor.foreground': foreground,
    'editorLineNumber.foreground': muted,
    'editorLineNumber.activeForeground': foreground,
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: muted, fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'storage', 'entity.name.function', 'support.function'],
      settings: { foreground, fontStyle: 'bold' },
    },
  ],
});

export default defineEcConfig({
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  defaultLocale: 'en',
  themes: [
    monochromeTheme(code.lightTheme, 'light', '#f5f5f5', '#111111', '#595959'),
    monochromeTheme(code.darkTheme, 'dark', '#303030', '#e2e2e2', '#b5b5b5'),
  ],
  themeCssRoot: ':root',
  themeCssSelector: (theme) =>
    theme.name === code.darkTheme ? '[data-theme="dark"]' : '[data-theme="light"]',
  useDarkModeMediaQuery: false,
  removeUnusedThemes: true,
  defaultProps: {
    wrap: code.wrap,
    preserveIndent: code.preserveIndent,
    showLineNumbers: code.lineNumbers,
    collapseStyle: code.collapseStyle,
  },
  frames: {
    extractFileNameFromCode: true,
    showCopyToClipboardButton: false,
  },
  styleOverrides: {
    borderRadius: '1px',
    borderWidth: '1px',
    borderColor: 'var(--line)',
    uiFontFamily: 'var(--font)',
    uiFontSize: '0.88rem',
    codeFontFamily: 'var(--font)',
    codeFontSize: '0.9rem',
    codeLineHeight: '1.65',
    codePaddingBlock: '1rem',
    codePaddingInline: '1.15rem',
    codeBackground: 'var(--wash)',
    frames: {
      editorActiveTabBackground: 'var(--wash)',
      editorActiveTabIndicatorTopColor: 'var(--accent)',
      editorTabBarBackground: 'var(--surface)',
      editorBackground: 'var(--wash)',
      frameBoxShadowCssValue: 'none',
      inlineButtonBackgroundActiveOpacity: '0.16',
      inlineButtonBackgroundHoverOrFocusOpacity: '0.1',
      terminalTitlebarBackground: 'var(--surface)',
      terminalBackground: 'var(--wash)',
      tooltipSuccessBackground: 'var(--ink)',
    },
    textMarkers: {
      lineMarkerAccentWidth: '0.2rem',
      backgroundOpacity: '0.24',
      borderOpacity: '0.62',
      markBackground: (context) =>
        isDarkCodeTheme(context) ? 'rgba(220, 220, 220, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      markBorderColor: (context) => (isDarkCodeTheme(context) ? '#b5b5b5' : '#595959'),
      insBackground: (context) =>
        isDarkCodeTheme(context) ? 'rgba(220, 220, 220, 0.10)' : 'rgba(0, 0, 0, 0.05)',
      insBorderColor: (context) => (isDarkCodeTheme(context) ? '#b5b5b5' : '#595959'),
      delBackground: (context) =>
        isDarkCodeTheme(context) ? 'rgba(220, 220, 220, 0.06)' : 'rgba(0, 0, 0, 0.03)',
      delBorderColor: (context) => (isDarkCodeTheme(context) ? '#b5b5b5' : '#595959'),
    },
    collapsibleSections: {
      closedBackgroundColor: 'var(--surface)',
    },
  },
});
