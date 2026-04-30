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
      case "email_taken":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.emailTaken" };
      case "phone_taken":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.phoneTaken" };
      case "invalid_phone":
        return { titleKey: "dialog.errorTitle", messageKey: "auth.invalidPhone" };
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
    return {
      titleKey: "dialog.errorTitle",
      messageKey: "auth.registerFailed",
      messageRaw: err.message,
    };
  }
  return { titleKey: "dialog.errorTitle", messageKey: "auth.registerFailed" };
}
