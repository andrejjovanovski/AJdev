#!/usr/bin/env node
/**
 * Prints a PORTAL_PASSWORD_HASH value for the /portal account.
 *
 *   node scripts/portal-password.mjs "your password"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/portal-password.mjs "your password"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

console.log(`PORTAL_PASSWORD_HASH="scrypt:${salt.toString("hex")}:${hash.toString("hex")}"`);
