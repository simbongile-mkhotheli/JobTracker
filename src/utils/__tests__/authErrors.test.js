import { describe, expect, it } from "vitest";

import {
  getAuthErrorDiagnostics,
  getAuthUserMessage,
  isExpectedAuthError,
} from "../authErrors";

describe("auth error handling", () => {
  it.each([
    [
      "signIn",
      { code: "invalid_credentials" },
      "Email or password is incorrect.",
    ],
    [
      "signIn",
      { message: "Invalid login credentials" },
      "Email or password is incorrect.",
    ],
    [
      "signIn",
      { code: "email_not_confirmed" },
      "Please confirm your email before signing in.",
    ],
    [
      "signUp",
      { code: "email_address_invalid" },
      "Enter a valid email address.",
    ],
    [
      "signUp",
      { code: "weak_password" },
      "Password must be at least 6 characters.",
    ],
    [
      "signUp",
      { message: "Password should be at least 6 characters" },
      "Password must be at least 6 characters.",
    ],
    [
      "signUp",
      { code: "user_already_exists" },
      "An account with this email may already exist.",
    ],
    [
      "signUp",
      { message: "User already registered" },
      "An account with this email may already exist.",
    ],
  ])(
    "maps expected %s errors to safe messages: %j",
    (action, error, message) => {
      expect(isExpectedAuthError(error, action)).toBe(true);
      expect(getAuthUserMessage(error, action)).toBe(message);
    },
  );

  it.each([
    ["signIn", "We couldn't sign you in. Please try again."],
    ["signUp", "We couldn't create your account. Please try again."],
    ["signOut", "We couldn't sign you out. Please try again."],
  ])(
    "does not expose unexpected provider details for %s",
    (action, message) => {
      const error = {
        message: "Internal database password authentication failed",
        code: "unexpected_failure",
      };
      expect(isExpectedAuthError(error, action)).toBe(false);
      expect(getAuthUserMessage(error, action)).toBe(message);
    },
  );

  it.each([undefined, null, "network error", { message: 42 }])(
    "handles malformed errors without throwing: %j",
    (error) => {
      expect(isExpectedAuthError(error, "signIn")).toBe(false);
      expect(getAuthUserMessage(error, "signIn")).toBe(
        "We couldn't sign you in. Please try again.",
      );
    },
  );

  it("keeps useful diagnostics without copying credentials or session data", () => {
    expect(
      getAuthErrorDiagnostics(
        {
          name: "AuthApiError",
          message: "Unavailable",
          code: "server_error",
          status: 503,
          password: "private",
          access_token: "private",
          session: { user: "private" },
        },
        "signIn",
      ),
    ).toEqual({
      operation: "signIn",
      name: "AuthApiError",
      message: "Unavailable",
      code: "server_error",
      status: 503,
    });
  });
});
