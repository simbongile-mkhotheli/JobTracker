const AUTH_MESSAGES = {
  signIn: {
    default: "We couldn't sign you in. Please try again.",
    invalidCredentials: "Email or password is incorrect.",
    emailNotConfirmed: "Please confirm your email before signing in.",
  },
  signUp: {
    default: "We couldn't create your account. Please try again.",
    invalidEmail: "Enter a valid email address.",
    weakPassword: "Password must be at least 6 characters.",
    existingAccount: "An account with this email may already exist.",
  },
  signOut: {
    default: "We couldn't sign you out. Please try again.",
  },
};

function getErrorField(error, field) {
  return typeof error?.[field] === "string" ? error[field] : undefined;
}

function getLowerMessage(error) {
  return getErrorField(error, "message")?.toLowerCase() || "";
}

function isWeakPasswordMessage(message) {
  return [
    /\bweak password\b/,
    /\bpassword is too weak\b/,
    /\bpassword (?:should|must) be at least \d+ characters?\b/,
    /\bpassword (?:should|must) contain\b/,
  ].some((pattern) => pattern.test(message));
}

export function getAuthErrorDiagnostics(error, operation) {
  return {
    operation,
    name: getErrorField(error, "name"),
    message: getErrorField(error, "message") || "Unknown auth error.",
    code: getErrorField(error, "code"),
    status: error?.status,
  };
}

export function isExpectedAuthError(error, action) {
  const code = getErrorField(error, "code");
  const message = getLowerMessage(error);

  if (action === "signIn") {
    return (
      code === "invalid_credentials" ||
      code === "email_not_confirmed" ||
      message.includes("invalid login credentials") ||
      message.includes("email not confirmed")
    );
  }

  if (action === "signUp") {
    return (
      code === "weak_password" ||
      code === "email_address_invalid" ||
      code === "user_already_exists" ||
      isWeakPasswordMessage(message) ||
      message.includes("already registered") ||
      message.includes("already exists") ||
      message.includes("invalid email")
    );
  }

  return false;
}

export function getAuthUserMessage(error, action) {
  const code = getErrorField(error, "code");
  const message = getLowerMessage(error);

  if (action === "signIn") {
    if (
      code === "invalid_credentials" ||
      message.includes("invalid login credentials")
    ) {
      return AUTH_MESSAGES.signIn.invalidCredentials;
    }

    if (
      code === "email_not_confirmed" ||
      message.includes("email not confirmed")
    ) {
      return AUTH_MESSAGES.signIn.emailNotConfirmed;
    }

    return AUTH_MESSAGES.signIn.default;
  }

  if (action === "signUp") {
    if (code === "email_address_invalid" || message.includes("invalid email")) {
      return AUTH_MESSAGES.signUp.invalidEmail;
    }

    if (code === "weak_password" || isWeakPasswordMessage(message)) {
      return AUTH_MESSAGES.signUp.weakPassword;
    }

    if (
      code === "user_already_exists" ||
      message.includes("already registered") ||
      message.includes("already exists")
    ) {
      return AUTH_MESSAGES.signUp.existingAccount;
    }

    return AUTH_MESSAGES.signUp.default;
  }

  return AUTH_MESSAGES.signOut.default;
}
