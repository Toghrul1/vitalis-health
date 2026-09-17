# vitalis-health

## Vitalis Health

A responsive, editorial healthcare website with a real booking backend. Built with Next.js 16, React 19, TypeScript, Zod, Lucide, and Node 24's embedded SQLite driver. Versions are locked in package-lock.json.

## Run

Requires Node.js 24+.

```sh
npm ci
npm run build
npm start
# http://127.0.0.1:3000
```

Use `npm run dev` during development. `npm run typecheck` checks TypeScript. `npm test` runs HTTP integration tests against a production server on port 3011 with an isolated temporary database, including a server restart to verify persistence. Build before testing.

## Features

- Responsive homepage, care specialties, searchable doctor directory, FAQs, mobile navigation.
- Accessible native-dialog booking flow with live slot availability, in-person/video preference, loading/error states and confirmation reference.
- Validated API routes, parameterized SQL, atomic unique slot constraints, same-origin write check, security headers.
- SQLite WAL persistence at `data/vitalis.sqlite`. Set `DATA_DIR` to an absolute persistent directory to override.
- Reduced-motion support, visible keyboard focus, labeled inputs, metadata and lazy-loaded images.

## API

- `GET /api/doctors?q=chen&specialty=Primary%20care`
- `GET /api/appointments?doctorId=sarah-chen&date=YYYY-MM-DD` returns available slots only, never contact information.
- `POST /api/appointments` accepts `{doctorId,date,time,name,email,visitType}`. Dates must be within the next 90 days. Visit type is `In-person` or `Video visit`. Returns 201 with reference, 400 for invalid input, 403 for cross-origin browser requests, 409 for occupied slots.

## Scope and production requirements

This is a functional local demo, **not a HIPAA-compliant or production clinical system**. All providers, ratings and prices are illustrative. Use fictional contact details. No real visits, medical advice, email, video calls, insurance claims or payments are provided. The database is not encrypted and there is no patient authentication, staff dashboard, or audit trail.

Before collecting real patient data: implement authenticated patient/staff roles, authorization, audit trails, encryption, retention/deletion policies, rate limiting and abuse protection, backups, explicit consent, clinic timezone and opening-hour logic, verified providers, and legal/security review. For horizontally scaled production, migrate to managed PostgreSQL with appropriate agreements and network controls. SQLite requires a persistent disk and a single application instance, not an ephemeral serverless deployment.

Images load from Unsplash and fonts from Google Fonts. Self-host licensed assets and fonts before privacy-sensitive deployment. The stack prioritizes pragmatic speed and maintainability. No single stack is universally the fastest.
