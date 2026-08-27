import { ApiError } from "./api";

/**
 * Trả thông báo lỗi theo ngôn ngữ hiện tại dựa trên mã lỗi từ backend.
 * Nếu mã không có trong bản dịch, fallback về message gốc.
 */
export function getApiErrorMessage(
  t: (key: string) => string,
  error: unknown,
): string {
  if (error instanceof ApiError) {
    const translated = t(error.code);
    return translated && translated !== error.code ? translated : error.message;
  }
  if (error instanceof Error) {
    return error.message || t("unknown_error");
  }
  return t("unknown_error");
}
