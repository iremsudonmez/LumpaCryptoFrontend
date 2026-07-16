// backend error codes -> user friendly text
const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'check the form fields and try again.',
  INVALID_CREDENTIALS: 'email or password is incorrect.',
  INVALID_TOKEN: 'your session has expired. Please log in again.',
  EMAIL_TAKEN: 'this email is already registered.',
  NETWORK_ERROR: 'cannot reach the server. is the backend running??',
  INTERNAL_ERROR: 'something went wrong. please try again.',
};

export function friendlyError(code: string, fallback: string) {
  return MESSAGES[code] ?? fallback;
}