import { describe, expect, it } from 'vitest'

import {
  detectAmountInVnd,
  looksLikeExpense,
} from '@/bot/lib/vn-amount-detector'

describe('detectAmountInVnd', () => {
  // ── k suffix (x nghìn) ──────────────────────────────────────────────────
  it('D1: detects 30k → 30000', () => {
    expect(detectAmountInVnd('ăn bún 30k')).toEqual({
      amountVnd: 30000,
      matched: '30k',
    })
  })

  it('D2: detects 65k → 65000', () => {
    expect(detectAmountInVnd('đổ xăng 65k')).toEqual({
      amountVnd: 65000,
      matched: '65k',
    })
  })

  it('D3: detects 1.5k → 1500', () => {
    expect(detectAmountInVnd('gửi xe 1.5k')).toEqual({
      amountVnd: 1500,
      matched: '1.5k',
    })
  })

  it('D4: detects 2K (uppercase) → 2000', () => {
    expect(detectAmountInVnd('mua kẹo 2K')).toEqual({
      amountVnd: 2000,
      matched: '2K',
    })
  })

  // ── tr suffix (triệu) ──────────────────────────────────────────────────
  it('D5: detects 1tr → 1000000', () => {
    expect(detectAmountInVnd('mua điện thoại 1tr')).toEqual({
      amountVnd: 1_000_000,
      matched: '1tr',
    })
  })

  it('D6: detects 1.5tr → 1500000', () => {
    expect(detectAmountInVnd('trả nợ 1.5tr')).toEqual({
      amountVnd: 1_500_000,
      matched: '1.5tr',
    })
  })

  it('D7: detects 1tr5 → 1500000 (compact format)', () => {
    expect(detectAmountInVnd('mua xe 1tr5')).toEqual({
      amountVnd: 1_500_000,
      matched: '1tr5',
    })
  })

  it('D8: detects 2TR (uppercase) → 2000000', () => {
    expect(detectAmountInVnd('thuê nhà 2TR')).toEqual({
      amountVnd: 2_000_000,
      matched: '2TR',
    })
  })

  // ── triệu ──────────────────────────────────────────────────────────────
  it('D9: detects "1 triệu" → 1000000', () => {
    expect(detectAmountInVnd('mua quần áo 1 triệu')).toEqual({
      amountVnd: 1_000_000,
      matched: '1 triệu',
    })
  })

  it('D10: detects "2.5 triệu" → 2500000', () => {
    expect(detectAmountInVnd('học phí 2.5 triệu')).toEqual({
      amountVnd: 2_500_000,
      matched: '2.5 triệu',
    })
  })

  // ── củ / cụ / cù ─────────────────────────────────────────────────────
  it('D11: detects "1 củ" → 1000000', () => {
    expect(detectAmountInVnd('mua laptop 1 củ')).toEqual({
      amountVnd: 1_000_000,
      matched: '1 củ',
    })
  })

  it('D12: detects "1 cụ" → 1000000', () => {
    expect(detectAmountInVnd('đi chơi 1 cụ')).toEqual({
      amountVnd: 1_000_000,
      matched: '1 cụ',
    })
  })

  // ── lít ────────────────────────────────────────────────────────────────
  it('D13: detects "1 lít" → 100000', () => {
    expect(detectAmountInVnd('ăn nhậu 1 lít')).toEqual({
      amountVnd: 100_000,
      matched: '1 lít',
    })
  })

  // ── xị ────────────────────────────────────────────────────────────────
  it('D14: detects "5 xị" → 500000', () => {
    expect(detectAmountInVnd('tiệc 5 xị')).toEqual({
      amountVnd: 500_000,
      matched: '5 xị',
    })
  })

  // ── nghìn / ngàn / ng ──────────────────────────────────────────────────
  it('D15: detects "20 nghìn" → 20000', () => {
    expect(detectAmountInVnd('ăn sáng 20 nghìn')).toEqual({
      amountVnd: 20000,
      matched: '20 nghìn',
    })
  })

  it('D16: detects "20 ngàn" → 20000', () => {
    expect(detectAmountInVnd('ăn sáng 20 ngàn')).toEqual({
      amountVnd: 20000,
      matched: '20 ngàn',
    })
  })

  it('D17: detects "20 ng" → 20000', () => {
    expect(detectAmountInVnd('ăn sáng 20 ng')).toEqual({
      amountVnd: 20000,
      matched: '20 ng',
    })
  })

  // ── Plain number ───────────────────────────────────────────────────────
  it('D18: detects "100.000" → 100000', () => {
    expect(detectAmountInVnd('mua đồ 100.000')).toEqual({
      amountVnd: 100_000,
      matched: '100.000',
    })
  })

  it('D19: detects "100000" → 100000', () => {
    expect(detectAmountInVnd('mua đồ 100000')).toEqual({
      amountVnd: 100_000,
      matched: '100000',
    })
  })

  it('D20: detects "1.000.000" → 1000000', () => {
    expect(detectAmountInVnd('thuê nhà 1.000.000')).toEqual({
      amountVnd: 1_000_000,
      matched: '1.000.000',
    })
  })

  // ── Trailing zeros (số kết thúc bằng 000, >= 1000) ─────────────────────
  it('D21: detects "2000" (ends with 000) → 2000', () => {
    expect(detectAmountInVnd('mua sách 2000')).toEqual({
      amountVnd: 2000,
      matched: '2000',
    })
  })

  it('D22: detects "15000" (ends with 000) → 15000', () => {
    expect(detectAmountInVnd('ăn uống 15000')).toEqual({
      amountVnd: 15000,
      matched: '15000',
    })
  })

  // ── Reject cases ────────────────────────────────────────────────────────
  it('D23: rejects number < 1000 (500)', () => {
    expect(detectAmountInVnd('mua bút 500')).toBeNull()
  })

  it('D24: rejects number with > 12 digits', () => {
    expect(detectAmountInVnd('mua nhà 9999999999999')).toBeNull()
  })

  it('D25: rejects number ending with 2 zeros (1500 → ambiguous)', () => {
    // 1500 ends with '500' not '00' actually. Let me test 200
    expect(detectAmountInVnd('mua gì 200')).toBeNull()
  })

  it('D26: rejects plain number 1500 (ends with 00 not 000)', () => {
    expect(detectAmountInVnd('mua gì 1500')).toBeNull()
  })

  it('D27: rejects when text contains income words without spend verb', () => {
    expect(detectAmountInVnd('nhận lương 10tr')).toBeNull()
  })

  it('D28: returns null for text with no amount', () => {
    expect(detectAmountInVnd('đi chơi')).toBeNull()
  })

  it('D29: returns null for empty text', () => {
    expect(detectAmountInVnd('')).toBeNull()
  })
})

describe('looksLikeExpense', () => {
  it('L1: returns true for text with amount + spend verb', () => {
    expect(looksLikeExpense('ăn bún 30k')).toBe(true)
  })

  it('L2: returns true for text with amount only (no income words)', () => {
    expect(looksLikeExpense('30k')).toBe(true)
  })

  it('L3: returns false for text with income words only', () => {
    expect(looksLikeExpense('nhận lương 10tr')).toBe(false)
  })

  it('L4: returns false for text with no number', () => {
    expect(looksLikeExpense('đi chơi')).toBe(false)
  })

  it('L5: returns true for text with spend verb + number but no matched amount pattern', () => {
    // "mua 1500" has spend verb + number, but 1500 is rejected by detectAmountInVnd.
    // looksLikeExpense checks: hasNumber + hasSpendVerb
    expect(looksLikeExpense('mua đồ 1500')).toBe(true)
  })

  it('L6: returns false for income + spend verb ambiguous (both present)', () => {
    // "nhận chuyển khoản mua đồ" — has both income word and spend verb → ambiguous
    expect(looksLikeExpense('nhận tiền mua đồ 30k')).toBe(false)
  })

  it('L7: returns false for empty text', () => {
    expect(looksLikeExpense('')).toBe(false)
  })

  it('L8: returns true for "mua điện thoại 1tr"', () => {
    expect(looksLikeExpense('mua điện thoại 1tr')).toBe(true)
  })

  it('L9: returns false for "vay 5tr mua xe" (ambiguous)', () => {
    expect(looksLikeExpense('vay 5tr mua xe')).toBe(false)
  })
})
