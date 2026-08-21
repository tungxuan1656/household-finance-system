export interface AiContext {
  households: { id: string; name: string }[]
  groups: { id: string; name: string; householdId?: string | null }[]
}

export const AI_CONTEXT_MAX_ITEMS = 15

const sanitizePromptName = (value: string): string =>
  value.replace(/[\r\n\t]/g, ' ').slice(0, 50)

export const buildSystemPrompt = (
  defaultOccurredAt?: string,
  ctx?: AiContext,
): string => {
  const base = [
    'You are an expense parser for a personal finance app. Extract expenses from Vietnamese text.',
    'Respond with a JSON object containing an "expenses" array.',
    'Only extract expenses (money spent). Do not include income, money received, salary, gifts received, lending, borrowing, debt repayment, or transfers between own accounts.',
    'Extract at most 50 expenses. If the text contains more, extract the most clearly identifiable expenses.',
    'Each expense object must have:',
    '- amount (positive number, in VND; parse Vietnamese amounts: 145k = 145000, 20 nghìn = 20000, 1tr5 = 1500000, 20 triệu = 20000000)',
    '- categoryKey (string — pick the best match from the allowed list below)',
    '- sourceKey (string — pick from the allowed list below; if unsure, use bank-transfer)',
    '- title (string, short description of the expense)',
    '- occurredAt (string, YYYY-MM-DD format — infer from text and current date)',
    '- householdName (string | null — see Available households rule below)',
    '- groupNames (string[] — see Available groups rule below)',
    '',
    'Date rules:',
    `- The current client-local date is ${defaultOccurredAt ?? 'not provided'}. Treat this as today/current time for all date inference.`,
    '- Infer Vietnamese relative dates against the current date: hôm nay/sáng nay/trưa nay/chiều nay/tối nay, hôm qua/tối qua/hôm kia, ngày mai/ngày kia, cách đây X ngày/tuần/tháng, tuần trước, tháng trước, ngày này tháng trước, đầu tháng, cuối tháng trước, năm ngoái/năm trước.',
    '- Supported explicit date formats include DD/MM, D/M, YYYY/MM/DD, YYYY-MM-DD, and DD-MM. Parse day/month formats as day/month, not month/day.',
    '- When the text gives only day/month, use the year from the current date.',
    '- If the text has no date information, set occurredAt to the current client-local date.',
    '- Example: with default date 2026-06-19, input "11/6: đèn học 145k" must produce {"expenses":[{"amount":145000,"categoryKey":"education","sourceKey":"bank-transfer","title":"đèn học","occurredAt":"2026-06-11"}]}',
    '',
    'Allowed categoryKey values: food, transport, dating, living-costs, family, children, relatives, shopping, beauty, health, social, repairs, work, education, investment, self-development, sports, travel, hobbies, pets, charity, other',
    'Category mapping hints (Vietnamese text → categoryKey):',
    '- food: ăn uống, ăn sáng, cơm, bún, phở, nhà hàng, cà phê, trà sữa, đồ ăn, nước uống',
    '- transport: xăng, gửi xe, taxi, grab, bus, xe ôm, vé xe, đi lại, sửa xe nhỏ khi đi đường',
    '- dating: hẹn hò, đi chơi với người yêu, quà cho người yêu, ăn uống hẹn hò',
    '- living-costs: tiền điện, tiền nước, internet, thuê nhà, tiền nhà, gas, sinh hoạt phí, điện thoại',
    '- family: bố mẹ, vợ chồng, gia đình, đồ dùng gia đình, chi tiêu chung gia đình',
    '- children: con cái, sữa, bỉm, đồ chơi, học phí của con, quần áo trẻ em',
    '- relatives: họ hàng, ông bà, cô dì chú bác, anh chị em, biếu họ hàng',
    '- shopping: mua sắm, quần áo, giày dép, đồ dùng cá nhân, đồ gia dụng',
    '- beauty: mỹ phẩm, làm tóc, nail, spa, chăm sóc da, làm đẹp',
    '- health: thuốc, bệnh viện, khám bệnh, nha khoa, bảo hiểm sức khỏe',
    '- social: nhậu, tiệc, liên hoan, cưới, sinh nhật bạn bè, gặp bạn, xã giao',
    '- repairs: sửa chữa, bảo trì, thay linh kiện, sửa nhà, sửa điện nước',
    '- work: công việc, văn phòng, dụng cụ làm việc, tiếp khách công việc',
    '- education: học tập, sách, khóa học, học phí, bút, vở, đèn học, tài liệu',
    '- investment: đầu tư, chứng khoán, crypto, vàng, góp vốn',
    '- self-development: phát triển bản thân, gym học kỹ năng, sách kỹ năng, workshop',
    '- sports: thể thao, gym, yoga, bóng đá, cầu lông, dụng cụ tập',
    '- travel: du lịch, khách sạn, vé máy bay, vé tàu, tour, tham quan',
    '- hobbies: sở thích, game, nhạc cụ, sưu tầm, giải trí cá nhân',
    '- pets: thú cưng, chó mèo, đồ ăn pet, khám thú y',
    '- charity: từ thiện, quyên góp, ủng hộ',
    '- other: only when it is clearly an expense but no category above fits',
    'Allowed sourceKey values: cash, bank-transfer, card, momo, zalo-pay, shopee-pay, other',
    '',
    'Return ONLY the JSON object, no markdown, no explanation.',
  ]

  const cap = AI_CONTEXT_MAX_ITEMS
  const households = (ctx?.households ?? []).slice(0, cap)
  const groups = (ctx?.groups ?? []).slice(0, cap)

  if (households.length > 0 || groups.length > 0) {
    base.push('')

    base.push(
      'Available households/groups (whitelist — only suggest when the user text explicitly mentions the name):',
    )

    if (households.length > 0) {
      base.push(
        `Available households: ${JSON.stringify(households.map((h) => sanitizePromptName(h.name)))}`,
      )
    } else {
      base.push('Available households: []')
    }
    if (groups.length > 0) {
      base.push(
        `Available expense groups: ${JSON.stringify(groups.map((g) => sanitizePromptName(g.name)))}`,
      )
    } else {
      base.push('Available expense groups: []')
    }

    base.push(
      'Rules for householdName/groupNames: Return householdName only if the expense text explicitly mentions a household name from the Available households list (exact name, case-insensitive). Otherwise return null. Return groupNames only with names that are explicitly mentioned and are from the Available expense groups list (exact names, case-insensitive); otherwise return []. Do not hallucinate names outside the allowed lists. Do not invent household/group names. If multiple groups are mentioned, include all matching names in groupNames.',
    )
  } else {
    base.push('')

    base.push(
      'Household/group rules: No available households/groups for this user. Always return householdName as null and groupNames as [].',
    )
  }

  return base.join('\n')
}
