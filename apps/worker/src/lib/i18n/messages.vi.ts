export const viMessages = {
  'errors.invalidJsonBody': 'Thân yêu cầu phải là JSON hợp lệ.',
  'errors.invalidRequestBody': 'Thân yêu cầu không hợp lệ.',
  'errors.authenticationRequired': 'Yêu cầu xác thực.',
  'errors.missingBearerToken': 'Thiếu token bearer.',
  'errors.sessionExpiredOrRevoked': 'Phiên đã hết hạn hoặc đã bị thu hồi.',
  'errors.userUnavailable': 'Người dùng không còn khả dụng.',
  'errors.refreshTokenInvalid':
    'Refresh token không hợp lệ, đã hết hạn hoặc đã bị thu hồi.',
  'errors.firebaseTokenMissingSubject': 'Token Firebase thiếu subject.',
  'errors.invalidFirebaseIdentityToken':
    'Token định danh Firebase không hợp lệ.',
  'errors.invalidOrExpiredSessionToken':
    'Token phiên không hợp lệ hoặc đã hết hạn.',
  'errors.invalidSessionTokenPayload': 'Payload token phiên không hợp lệ.',
  'errors.routeNotFound': 'Không tìm thấy đường dẫn.',
  'errors.userNotFound': 'Không tìm thấy người dùng.',
  'errors.workerConfigurationInvalid': 'Cấu hình worker không hợp lệ.',
  'errors.unexpectedInternalError': 'Đã xảy ra lỗi nội bộ không mong muốn.',
  'errors.forbidden': 'Bạn không có quyền thực hiện hành động này.',
  'errors.resourceNotFound': 'Không tìm thấy tài nguyên.',
  'errors.conflict': 'Dữ liệu đã tồn tại.',
  'validation.invalidType': 'Kiểu dữ liệu không hợp lệ.',
  'validation.invalidValue': 'Giá trị không hợp lệ.',
  'validation.invalidFormat': 'Định dạng không hợp lệ.',
  'validation.invalidUrl': 'URL không hợp lệ.',
  'validation.unrecognizedKeys': 'Có trường không được hỗ trợ.',
  'validation.stringTooSmall': 'Trường này không được để trống.',
  'validation.stringTooShort': 'Chuỗi quá ngắn.',
  'validation.stringTooBig': 'Chuỗi quá dài.',
  'validation.numberTooSmall': 'Giá trị quá nhỏ.',
  'validation.numberTooBig': 'Giá trị quá lớn.',
  'validation.arrayTooSmall': 'Danh sách chưa đủ phần tử.',
  'validation.arrayTooBig': 'Danh sách quá dài.',
  'validation.custom': 'Giá trị không hợp lệ.',
  'profile.displayNameMustNotBeBlank': 'Tên hiển thị không được để trống.',
  'profile.displayNameTooLong': 'Tên hiển thị không được vượt quá 100 ký tự.',
  'profile.atLeastOneProfileField': 'Cần cung cấp ít nhất một trường hồ sơ.',
  'households.nameMustNotBeBlank': 'Tên hộ gia đình không được để trống.',
  'households.nameTooLong': 'Tên hộ gia đình không được vượt quá 120 ký tự.',
  'households.defaultCurrencyCodeInvalid':
    'Mã tiền tệ mặc định phải gồm đúng 3 ký tự chữ cái.',
  'households.householdIdMustNotBeBlank': 'Mã hộ gia đình không hợp lệ.',
  'households.atLeastOneFieldRequired':
    'Cần cung cấp ít nhất một trường để cập nhật hộ gia đình.',
} as const

export type MessageKey = keyof typeof viMessages
