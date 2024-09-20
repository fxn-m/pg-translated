export type LanguageData = {
  [key: string]: {
    translation: string
    flag: string
    name: string
    code: string
  }
}

export const languageData: LanguageData = {
  english: { name: "English", code: "EN", translation: "Essays", flag: "🇬🇧" },
  french: { name: "Français", code: "FR", translation: "Essais", flag: "🇫🇷" },
  spanish: { name: "Español", code: "ES", translation: "Ensayos", flag: "🇪🇸" },
  portuguese: { name: "Português", code: "PT-BR", translation: "Ensaios", flag: "🇧🇷" },
  german: { name: "Deutsch", code: "DE", translation: "Aufsätze", flag: "🇩🇪" },
  japanese: { name: "日本語", code: "JP", translation: "エッセイ", flag: "🇯🇵" },
  hindi: { name: "हिन्दी", code: "HI", translation: "निबंध", flag: "🇮🇳" },
  chinese: { name: "中文", code: "ZH", translation: "论文", flag: "🇨🇳" }
}
