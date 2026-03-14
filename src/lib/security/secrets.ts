import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ENCRYPTION_PREFIX = "enc:v1";
const IV_LENGTH = 12;

function getEncryptionSecret() {
  const secret = process.env.SECRET_ENCRYPTION_KEY || process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing SECRET_ENCRYPTION_KEY or SESSION_SECRET for secret encryption.");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecretValue(value: string, environmentId?: string) {
  const key = getEncryptionSecret();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  if (environmentId) {
    cipher.setAAD(Buffer.from(environmentId, "utf8"));
  }

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const prefix = environmentId ? "enc:v2" : ENCRYPTION_PREFIX;

  return `${prefix}:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecretValue(value: string, environmentId?: string) {
  const isV2 = value.startsWith("enc:v2:");
  const isV1 = value.startsWith(`${ENCRYPTION_PREFIX}:`);

  if (!isV1 && !isV2) {
    return value; // Not encrypted or unknown format
  }

  const [, , ivBase64, tagBase64, encryptedBase64] = value.split(":");

  if (!ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error("Invalid encrypted secret payload.");
  }

  const key = getEncryptionSecret();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64"));
  
  if (isV2 && environmentId) {
    decipher.setAAD(Buffer.from(environmentId, "utf8"));
  }

  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
