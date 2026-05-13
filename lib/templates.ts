export const WELCOME_TEMPLATES = {
  ko: (room: string, password: string, branchName: string) => `안녕하세요! ${branchName} ${room}호에 오신 것을 환영합니다 🙏

✅ 체크인 안내
• 체크인 시간: 오후 4시 이후
• 체크아웃 시간: 오전 11시까지

🔐 도어락 비밀번호
${password}#

궁금하신 점이 있으시면 언제든지 연락 주세요.
편안하고 즐거운 시간 되세요! 😊`,

  zh: (room: string, password: string, branchName: string) => `您好！欢迎入住 ${branchName} ${room}号房 🙏

✅ 入住须知
• 入住时间：下午4点以后
• 退房时间：上午11点之前

🔐 门锁密码
${password}#

如有任何问题，请随时联系我们。
祝您入住愉快！😊`,

  ja: (room: string, password: string, branchName: string) => `こんにちは！${branchName} ${room}号室へようこそ 🙏

✅ チェックイン案内
• チェックイン：午後4時以降
• チェックアウト：午前11時まで

🔐 ドアロック暗証番号
${password}#

ご不明な点がございましたら、いつでもご連絡ください。
素敵な滞在をお楽しみください！😊`,
}

export type Language = keyof typeof WELCOME_TEMPLATES

export const BRANCH_NAMES: Record<string, string> = {
  haundae: '꼬모까사 해운대',
  chungmuro: 'Como Casa 충무로',
}
