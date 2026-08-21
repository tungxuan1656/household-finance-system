import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const generatedButtonSource = readFileSync(
  resolve(process.cwd(), 'src/components/ui/button.tsx'),
  'utf8',
)

describe('generated Button provenance', () => {
  it('has no Telegram or haptic import', () => {
    expect(generatedButtonSource).not.toContain('telegram/haptics')
    expect(generatedButtonSource).not.toContain('impact(')
    expect(generatedButtonSource).not.toContain('selection(')
  })

  it('has no external haptic activation seam', () => {
    expect(generatedButtonSource).not.toContain('runTmaHapticActivation')
    expect(generatedButtonSource).not.toContain('activateButton')

    expect(generatedButtonSource).toMatch(
      /from ['"]@base-ui\/react\/button['"]/,
    )
  })
})
