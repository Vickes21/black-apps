export const SUPPORTED_LANGUAGES = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;

export const installPromptTranslations = {
  pt: {
    install: 'Instalar',
    installApp: 'Instalar {appName}',
    accessFaster: 'Acesse mais rápido desde sua tela inicial',
    notNow: 'Agora não',
    iosInstruction: 'Toque no botão de compartilhar',
    iosAction: 'e depois "Adicionar à Tela de Início"',
  },
  en: {
    install: 'Install',
    installApp: 'Install {appName}',
    accessFaster: 'Access faster from your home screen',
    notNow: 'Not now',
    iosInstruction: 'Tap the share button',
    iosAction: 'then "Add to Home Screen"',
  },
  es: {
    install: 'Instalar',
    installApp: 'Instalar {appName}',
    accessFaster: 'Accede más rápido desde tu pantalla de inicio',
    notNow: 'Ahora no',
    iosInstruction: 'Toca el botón de compartir',
    iosAction: 'y luego "Añadir a pantalla de inicio"',
  },
  fr: {
    install: 'Installer',
    installApp: 'Installer {appName}',
    accessFaster: "Accédez plus rapidement depuis votre écran d'accueil",
    notNow: 'Pas maintenant',
    iosInstruction: 'Appuyez sur le bouton de partage',
    iosAction: 'puis "Ajouter à l\'écran d\'accueil"',
  },
  de: {
    install: 'Installieren',
    installApp: '{appName} installieren',
    accessFaster: 'Schneller von Ihrem Startbildschirm aus zugreifen',
    notNow: 'Nicht jetzt',
    iosInstruction: 'Tippen Sie auf die Schaltfläche "Teilen"',
    iosAction: 'dann "Zum Home-Bildschirm"',
  },
} as const;

export function getTranslation(language: Language, key: keyof typeof installPromptTranslations['pt'], appName?: string): string {
  const translation = installPromptTranslations[language]?.[key] || installPromptTranslations.pt[key];
  
  if (appName && translation.includes('{appName}')) {
    return translation.replace('{appName}', appName);
  }
  
  return translation;
}
