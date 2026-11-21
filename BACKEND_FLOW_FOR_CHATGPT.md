# Spring Boot Backend Flow — Prompt for ChatGPT

Copy the prompt below into ChatGPT together with this project/repository. Ask it
to inspect the existing code before making changes.

---

## Prompt

I have an existing personal finance dashboard built with React 19 and Vite. I
want to add a real Spring Boot backend and connect the existing frontend to it.
Please inspect the repository first, then implement this in small, working
steps. Do not replace the UI or remove existing features.

### Existing app

- Frontend: React + Vite, JavaScript, React Router.
- The app currently stores finance data in browser `localStorage` through
  `src/context/FinanceProvider.jsx`.
- Login and registration are currently browser-only in
  `src/utils/localAccount.js`, `src/pages/Register.jsx`, and
  `src/pages/Login.jsx`. This is a demo flow, not server authentication.
- Protected pages include Dashboard, Income, Expense, Budget, Bills, Savings
  Goals, Money Management, Reports, and Settings.
- Finance data sections currently include:
  - `income`: title, amount, date
  - `expense`: title, category, amount, date
  - `budgets`: category, amount
  - `bills`: name, type, amount, dueDate, frequency, status, installment counts,
    and payment history
  - `savingsGoals`: name, target, saved, targetDate, contributions
  - `savingsDeposits`: amount, remaining, date
  - `calendarNotes`: date-to-note map
  - `preferences`: profile and notification/report preferences
- The current currency is INR (₹). Dates are generally `YYYY-MM-DD`.
- Income/expense/budget/bill/savings features, EMI installment counts and
  payment history, savings-pool allocation, calendar notes, CSV exports,
  reports, and the Money Management assistant must keep working.
- The Money Management assistant is a local rule-based UI feature. It should
  continue to use finance data loaded from the backend; it does not need an
  external AI service.
- Java 17 is installed in my Windows environment. Maven was not available on
  PATH when checked. Include a Maven wrapper (`mvnw.cmd`) if possible, or give
  exact Windows setup/run commands.

### Desired user/data flow

1. A new user opens the app and registers with name, email, password, and
   password confirmation.
2. The backend validates the request, checks that email is unique, hashes the
   password securely, and stores the user in MySQL. Never store plaintext
   passwords.
3. The user logs in. The backend verifies credentials and returns a secure
   authentication result. Protect all finance APIs. Prefer a secure,
   HttpOnly cookie-based session if practical; otherwise use a short-lived JWT
   and explain safe storage/refresh/logout behavior. Do not store passwords or
   long-lived access tokens in localStorage.
4. React loads the authenticated user's finance data from the backend after
   login and displays it in the existing pages.
5. Adding, editing, deleting, paying, or allocating finance records calls the
   corresponding API. Backend responses update the React context/UI.
6. Every finance record belongs to the authenticated user. A user must never
   be able to read, change, or delete another user's records by changing an ID.
7. Logout ends the server session/token lifecycle and returns the user to
   login.
8. Existing users may have data in localStorage. Provide a deliberate,
   authenticated import/migration path for existing finance data; do not
   silently erase it. Validate imported data and prevent duplicate imports.
9. Keep an export/backup path for the user's finance data and keep the existing
   CSV statement downloads working.

### Backend requirements

- Use a supported Spring Boot 3.x release compatible with Java 17.
- Use Maven, Spring Web, Spring Security, Bean Validation, Spring Data JPA,
  MySQL Connector/J, and a database migration tool such as Flyway.
- Keep a clear layered structure: controller, service, repository, entity,
  DTO/request-response, security/configuration, and exception handling.
- Use DTOs rather than exposing JPA entities directly.
- Use `BigDecimal` for money, positive-amount validation, and `LocalDate` for
  finance dates. Use INR semantics and avoid floating-point calculations for
  stored amounts.
- Use secure password hashing such as BCrypt. Never return password hashes or
  secrets in API responses or logs.
- Add CORS configuration for the Vite development origin, configurable via
  properties/environment variables. Do not use wildcard origins with
  credentials.
- Use environment variables for DB credentials and secrets. Commit only safe
  example placeholders; never commit real passwords or JWT secrets.
- Return clear validation errors and appropriate HTTP status codes. Do not
  hide server errors or return success-shaped fallback data.
- Add database migrations and do not rely on Hibernate auto-creating
  production tables.
- Add tests for authentication, validation, user data isolation, core CRUD,
  EMI payments, savings allocation, and migration/import behavior.

### API coverage

Design and implement REST endpoints for:

- Register, login, logout, and current-user/profile.
- Load the authenticated user's finance overview.
- CRUD for income and expense entries.
- CRUD for budgets.
- CRUD for bills/EMIs and recording a payment. Preserve payment history,
  paid/total/remaining installment counts, recurrence, due-date advancement,
  and status.
- CRUD for savings goals, adding savings deposits, allocating available
  deposits to a goal, and handling goal deletion without losing the
  savings-pool accounting.
- Read/create/update/delete calendar notes by date.
- Read/update user preferences.
- Import/export/backup of the user's finance data.

For any endpoint that changes money, calculate and validate the resulting
balances and savings-pool amounts on the server in a transaction. Prevent
duplicate EMI payments and over-allocation. Do not let a client-supplied user
ID decide ownership.

### Frontend integration requirements

- Replace local-only registration/login with the backend auth flow and keep
  protected routes working.
- Update `FinanceProvider` to load and persist finance sections through API
  requests instead of treating localStorage as the source of truth.
- Centralize API calls and auth/error handling in a small reusable client.
- Show loading and error states; do not silently ignore failed requests.
- Keep the existing page UX and styling. Do not rewrite unrelated components.
- Use the backend as the source of truth. If local data migration is offered,
  show a clear confirmation and only clear old local data after the import
  succeeds.
- Update README with setup, database creation/configuration, backend and
  frontend run commands, API/auth notes, and test commands.

### How to work

1. First inspect the repository and report the proposed architecture and any
   assumptions. Check whether a backend already exists; preserve useful work.
2. Implement the backend in coherent steps, with file paths and complete code.
3. Run backend tests/build and frontend lint/build. Fix failures caused by the
   changes.
4. Provide exact Windows PowerShell commands for MySQL setup, configuration,
   running both apps, and testing key flows.
5. Summarize changed files and clearly state any feature that remains
   incomplete. Do not claim production readiness without explaining deployment,
   HTTPS, secret management, backups, and security limitations.

