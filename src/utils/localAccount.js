export const ACCOUNT_KEY = "personalFinanceDashboardAccount";
export const SESSION_KEY = "personalFinanceDashboardSession";

const HASH_ITERATIONS = 210_000;

function getCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error("Secure password storage is unavailable in this browser.");
  }
  return globalThis.crypto;
}

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt, iterations = HASH_ITERATIONS) {
  const cryptoApi = getCrypto();
  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await cryptoApi.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export function loadLocalAccount() {
  const savedAccount = localStorage.getItem(ACCOUNT_KEY);
  if (!savedAccount) return null;

  try {
    const account = JSON.parse(savedAccount);
    if (!account || typeof account !== "object" || Array.isArray(account) ||
      typeof account.name !== "string" ||
      typeof account.email !== "string" ||
      typeof account.salt !== "string" ||
      typeof account.passwordHash !== "string" ||
      !Number.isInteger(account.iterations) || account.iterations < 1) {
      throw new Error("The saved account has an invalid format.");
    }
    return account;
  } catch (error) {
    throw new Error("Could not read the saved account in this browser.", {
      cause: error,
    });
  }
}

export async function registerLocalAccount({ name, email, password }) {
  if (loadLocalAccount()) {
    throw new Error("An account is already registered in this browser. Please sign in.");
  }

  const cryptoApi = getCrypto();
  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  const account = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    salt: encodeBase64(salt),
    passwordHash: encodeBase64(passwordHash),
    iterations: HASH_ITERATIONS,
  };

  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch (error) {
    throw new Error("Could not save your account in this browser.", { cause: error });
  }
}

export async function verifyLocalAccount(email, password) {
  const account = loadLocalAccount();
  if (!account) return false;

  const passwordHash = await hashPassword(
    password,
    decodeBase64(account.salt),
    account.iterations
  );
  return account.email === email.trim().toLowerCase() &&
    encodeBase64(passwordHash) === account.passwordHash;
}
