import { randomBytes, createDecipheriv, createCipheriv } from "crypto";
import { handleError } from "./errorHandler";

const algo = "aes-256-gcm";
const key = process.env.SESSION_PASSWORD!;

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algo, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(text: string): string | null {
  try {
    const buff = Buffer.from(text, "base64");
    const iv = buff.subarray(0, 16);
    const tag = buff.subarray(16, 32);
    const encrypted = buff.subarray(32);
    const decipher = createDecipheriv(algo, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (e) {
    handleError(e);
    return null;
  }
}
