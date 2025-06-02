import { ServiceAccount } from 'firebase-admin/app';

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("Missing FIREBASE_PROJECT_ID env variable");
}

console.log("FIREBASE_TYPE:", process.env.FIREBASE_TYPE);
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_PRIVATE_KEY_ID:", process.env.FIREBASE_PRIVATE_KEY_ID);
console.log("FIREBASE_PRIVATE_KEY (sanitized):", process.env.FIREBASE_PRIVATE_KEY ? "[loaded]" : "[missing]");
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_CLIENT_ID:", process.env.FIREBASE_CLIENT_ID);
console.log("FIREBASE_AUTH_URI:", process.env.FIREBASE_AUTH_URI);
console.log("FIREBASE_TOKEN_URI:", process.env.FIREBASE_TOKEN_URI);
console.log("FIREBASE_AUTH_PROVIDER_X509_CERT_URL:", process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL);
console.log("FIREBASE_CLIENT_X509_CERT_URL:", process.env.FIREBASE_CLIENT_X509_CERT_URL);
console.log("FIREBASE_UNIVERSE_DOMAIN:", process.env.FIREBASE_UNIVERSE_DOMAIN);

export const serviceKey = {
  type: process.env.FIREBASE_TYPE as string,
  project_id: process.env.FIREBASE_PROJECT_ID as string,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID as string,
  private_key: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL as string,
  client_id: process.env.FIREBASE_CLIENT_ID as string,
  auth_uri: process.env.FIREBASE_AUTH_URI as string,
  token_uri: process.env.FIREBASE_TOKEN_URI as string,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL as string,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN as string,
} as ServiceAccount;