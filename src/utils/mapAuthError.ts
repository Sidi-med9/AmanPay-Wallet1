import { ApiError } from "../services/apiClient";

export type AuthDialogContent = {
  titleKey: string;
  messageKey: string;
  /** Raw API message when no mapping */
  messageRaw?: string;
};

/**
 * Maps API errors to i18n keys under `auth.*` and `dialog.*`.
 */
export function mapAuthErrorToDialog(err: unknown): AuthDialogContent {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "invalid_credentials":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.invalidCredentials" };
      case "account_inactive":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.accountInactive" };
      case "admin_not_allowed_mobile":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.adminNotAllowedMobile" };
      case "email_taken":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.emailTaken" };
      case "phone_taken":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.phoneTaken" };
      case "invalid_phone":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.invalidPhone" };
      case "merchant_category_required":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.merchantCategoryRequired" };
      case "merchant_category_invalid":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.merchantCategoryInvalid" };
      default:
        return {
          titleKey: "dialog.errorTitle",
          messageKey: "auth.loginFailed",
          messageRaw: err.message,
        };
    }
  }
  return { titleKey: "dialog.errorTitle", messageKey: "auth.loginFailed" };
}

export function mapRegisterErrorToDialog(err: unknown): AuthDialogContent {
  if (err instanceof ApiError) {
    if (err.code === "email_taken") {
      return { titleKey: "dialog.errorTitle", messageKey: "auth.emailTaken" };
    }
    if (err.code === "account_inactive") {
      return { titleKey: "dialog.errorTitle", messageKey: "auth.accountInactive" };
    }
    if (err.code === "admin_not_allowed_mobile") {
      return { titleKey: "dialog.errorTitle", messageKey: "auth.adminNotAllowedMobile" };
    }
    if (err.code === "merchant_category_required") {
      return { titleKey: "dialog.errorTitle", messageKey: "auth.merchantCategoryRequired" };
    }
    if (err.code === "merchant_category_invalid") {
      return { titleKey: "dialog.errorTitle", messageKey: "auth.merchantCategoryInvalid" };
    }
    return {
      titleKey: "dialog.errorTitle",
      messageKey: "auth.registerFailed",
      messageRaw: err.message,
    };
  }
  return { titleKey: "dialog.errorTitle", messageKey: "auth.registerFailed" };
}
