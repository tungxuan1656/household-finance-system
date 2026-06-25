/**
 * Map of category keys → single Unicode emoji for Telegram messages.
 * Chosen for broad platform support (no ZWJ sequences, common glyphs).
 *
 * food 🍜 — instant food, all platforms
 * transport 🛵 — Vietnamese motorbike, 2 UTF-16 units
 * dating 💕 — semantic, no ZWJ
 * living-costs 🧾 — receipt, avoids 🏠 clash
 * family 👪 — single-glyph family
 * children 🍼 — baby bottle
 * relatives 👴 — elder, distinct
 * shopping 🛍️ — bags
 * beauty 💄 — lipstick
 * health 💊 — pill clearer than ❤️
 * social 🍻 — Vietnamese gathering
 * repairs 🔧 — wrench
 * work 💼 — briefcase
 * education 🎓 — graduation cap
 * investment 📈 — upward chart, 2 units
 * self-development 📚 — books distinct from education
 * sports ⚽ — universal
 * travel ✈️ — single concept
 * hobbies 🎨 — art palette, broad
 * pets 🐶 — universal dog
 * charity 🤲 — giving hands
 * other 🔹 — neutral, 1 unit
 * money-in 💵 — banknote distinct from 💰 totals
 * lending 🔄 — transfer/reciprocal
 */
export const TELEGRAM_CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍜',
  transport: '🛵',
  dating: '💕',
  'living-costs': '🧾',
  family: '👪',
  children: '🍼',
  relatives: '👴',
  shopping: '🛍️',
  beauty: '💄',
  health: '💊',
  social: '🍻',
  repairs: '🔧',
  work: '💼',
  education: '🎓',
  investment: '📈',
  'self-development': '📚',
  sports: '⚽',
  travel: '✈️',
  hobbies: '🎨',
  pets: '🐶',
  charity: '🤲',
  other: '🔹',
  'money-in': '💵',
  lending: '🔄',
}

/**
 * Get the emoji for a category key. Falls back to 🔹 for unknown keys.
 */
export const getCategoryEmoji = (key: string): string =>
  TELEGRAM_CATEGORY_EMOJIS[key] ?? '🔹'
