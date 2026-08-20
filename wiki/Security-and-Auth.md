# 🔒 Security & Authentication Architecture

Ionity Central implements enterprise-grade zero-trust identity authentication for workspace access.

## Google Identity Services (OAuth 2.0)

- **Domain Gate**: Authentication is strictly restricted to authorized domains:
  - `@ionity.today`
  - `@ionity.co.za`
- **Enforcement Layer**: Handled in `js/auth.js` by decoding Google JWT credential tokens (`credentialResponse.credential`).
- **Unauthorized Domains**: If a user attempts to log in with an external Gmail or third-party address, access is rejected immediately:
  ```
  ⛔ Access Denied: Google Login is restricted to @ionity.today accounts only.
  ```

## Security Headers (Nginx & Firebase)

```http
Strict-Transport-Security: max-age=31556926; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```
