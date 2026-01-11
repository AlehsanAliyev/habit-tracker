# Security & Deployment Notes (Human-Friendly)

This project is a personal app. If you deploy it for friends, you still need basic protections so random internet traffic can’t break it. Below is a plain-English guide to what was added and why, plus how to configure it.

## What was added and why

### 1) Secure sessions (MongoDB store + cookie flags)
**Why:** If sessions live only in memory, they reset on every deploy/restart. Also, cookies need proper security flags to avoid being stolen.

**What we did:**
- Session storage moved to MongoDB with `connect-mongo`.
- Cookies are now:
  - `httpOnly` (JavaScript can’t read them)
  - `secure` in production (HTTPS only)
  - `sameSite: "lax"` (helps block CSRF attacks)
  - `maxAge` set (session expires)

### 2) CSRF protection (forms + fetch)
**Why:** Without CSRF tokens, a malicious site could make a logged‑in user submit requests without knowing.

**What we did:**
- Added `csurf` middleware.
- Every POST form now includes a hidden `_csrf` token.
- JS fetch calls include the CSRF token header.

### 3) Rate limiting on login/register
**Why:** Prevent brute‑force attacks on accounts.

**What we did:**
- Applied a rate limiter to `/login` and `/register`.

### 4) Input validation (server‑side)
**Why:** Never trust client input. Validation is needed for title fields, frequency values, scores, etc.

**What we did:**
- Added `express-validator` checks for all POST endpoints.
- On failure, the request is rejected with a friendly error message.

### 5) Basic protection against NoSQL injection + XSS
**Why:** Even though this is MongoDB, attackers can still inject query operators like `$gt`, `$ne`, or script tags.

**What we did:**
- Added `express-mongo-sanitize` to remove `$` and `.` from inputs.
- XSS protection relies on server-side validation plus Handlebars auto-escaping.
- Avoid `{{{raw}}}` unless you fully sanitize that content yourself.

### 6) Security headers with Helmet
**Why:** Sets default headers that block common browser‑side attacks.

**What we did:**
- Added `helmet()` with CSP disabled to avoid breaking inline scripts.

## What you still need to configure

### Environment variables
Make sure you set these in your hosting platform:
```
SESSION_SECRET=your_long_random_secret
MONGO_URI=your_mongodb_connection_string
NODE_ENV=production
```

### HTTPS only
If you deploy to Vercel/Render/Railway, HTTPS is automatic.  
Just make sure:
- `NODE_ENV=production` is set.
- Your site runs behind HTTPS.

## “SQL injection” vs Mongo
This app does **not** use SQL, so classic SQL injection doesn’t apply.  
The Mongo version is **NoSQL injection**, and we protect against it by:
- sanitizing user input
- validating allowed values
- avoiding raw query construction with user input

## How to keep it healthy
- Run `npm audit` after install.
- Update dependencies monthly.
- Keep MongoDB IP‑restricted if possible (Atlas allows IP allowlists).
- Use a least‑privilege MongoDB user (not admin).

## Quick deployment checklist
- [ ] HTTPS enabled
- [ ] SESSION_SECRET set
- [ ] MONGO_URI set
- [ ] NODE_ENV=production set
- [ ] `npm install` run with new dependencies
- [ ] Rate limiting & CSRF verified

If you want, I can also add logging for failed logins and admin actions, or set up Redis sessions for larger usage.
