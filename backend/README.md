# doctor-clinic-management backend

Python/Flask microservices backend for the `doctor-clinic-management` frontend, backed by a single PostgreSQL database on Supabase (schema-per-service). No Docker - every service is a plain Python process on its own port.

See `C:\Users\LAKSHMIKANTH REDDY\.claude\plans\floating-rolling-lantern.md` for the full architecture writeup (service boundaries, DDL, auth design, trade-offs).

## Services

| Service | Port | Schema | Purpose |
|---|---|---|---|
| gateway | 5000 | - | Routes `/api/<service>/*`, verifies JWTs, CORS |
| auth-service | 5001 | `clinic_auth` | Login, registration, staff creation, password reset |
| clinical-service | 5002 | `clinical` | Departments, doctors, patients, appointments, consultations |
| prescription-service | 5003 | `prescription` | Prescriptions, dispense orchestration |
| pharmacy-service | 5004 | `pharmacy` | Medical stores, inventory |
| billing-service | 5005 | `billing` | Bills |
| notification-service | 5006 | `notification` | Notifications, SMS logs |
| core-service | 5007 | `core` | Clinics, settings, activity log, dashboard/report aggregation |

## Supabase-specific gotchas (already handled in this repo, documented for reference)

- **Use the pooler connection string, not the "Direct connection" one.** `db.<project-ref>.supabase.co` resolves IPv6-only unless you've bought Supabase's IPv4 add-on, and most networks can't route to it. Use "Session pooler" or "Transaction pooler" from the dashboard instead (`aws-0-<region>.pooler.supabase.com`).
- **If your DB password contains `@`, `%`, `/`, `:`, or `#`, URL-encode it** in `DATABASE_URL` (e.g. `@` -> `%40`). Otherwise the connection string parses incorrectly.
- **The Postgres schema is named `clinic_auth`, not `auth`.** Supabase reserves the `auth` schema for its own built-in GoTrue authentication and blocks the `postgres` role from creating objects there - the service is still called `auth-service` and its gateway route is still `/api/auth/*`, only the underlying Postgres schema differs.

## First-time setup

**1. Get your Supabase connection string**
Supabase dashboard -> Project Settings -> Database -> Connection string (URI) -> **Session pooler** (see gotchas above - do not use "Direct connection").

**2. Configure environment**
```powershell
cd backend
Copy-Item .env.example .env
notepad .env   # paste DATABASE_URL, generate JWT_SECRET / INTERNAL_SERVICE_SECRET
```
Generate secrets with:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**3. Create the database schema**
Run `backend/sql/schema.sql` once against your Supabase database - easiest via the Supabase SQL Editor (paste the whole file and run), or via `psql`:
```powershell
psql "$env:DATABASE_URL" -f sql/schema.sql
```

**4. Set up each service's virtual environment**
Repeat for every service directory (`auth-service`, `clinical-service`, `prescription-service`, `pharmacy-service`, `billing-service`, `notification-service`, `core-service`, `gateway`) - and first for `shared/` isn't needed standalone, it gets installed into each service's venv via `-e ../shared` in their requirements.txt:
```powershell
cd auth-service
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cd ..
```

**5. Stamp Alembic to the baseline**
Since `sql/schema.sql` already created every table, tell each service's Alembic "this is already applied" rather than trying to create it again:
```powershell
./migrate-all.ps1 -Stamp
```

**6. Seed demo data**
```powershell
cd seed
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python seed_data.py
cd ..
```
This loads the same demo data the old frontend mock used to have baked in: 8 departments, 10 doctors, 6 patients, 15 appointments, prescriptions, inventory, bills, notifications, and the 5 demo login accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@clinic.com | admin123 |
| Doctor | doctor@clinic.com | doctor123 |
| Reception | reception@clinic.com | reception123 |
| Patient | patient@clinic.com | patient123 |
| Medical Store | store@clinic.com | store123 |

## Running

```powershell
./start-all.ps1     # starts all 7 services + gateway in the background
./stop-all.ps1      # stops everything start-all.ps1 started
```

Health check every service is up:
```powershell
curl http://127.0.0.1:5000/health   # gateway
curl http://127.0.0.1:5001/health   # auth-service
# ... etc for each port above
```

## Trying it end to end

```powershell
# Log in as the demo doctor
$resp = curl -Method POST http://127.0.0.1:5000/api/auth/login `
  -Body (@{identifier="doctor@clinic.com"; password="doctor123"; role="doctor"} | ConvertTo-Json) `
  -ContentType "application/json" | ConvertFrom-Json
$token = $resp.token

# Call an authenticated endpoint through the gateway
curl http://127.0.0.1:5000/api/clinical/doctors -Headers @{Authorization = "Bearer $token"}
```

## Future schema changes

Once past this initial baseline, use Alembic normally per service:
```powershell
cd clinical-service
.venv\Scripts\alembic revision --autogenerate -m "add some_column"
.venv\Scripts\alembic upgrade head
```
Then run `../migrate-all.ps1` (without `-Stamp`) from `backend/` to apply pending migrations across all services in dependency order (`auth -> clinical -> pharmacy -> prescription -> billing -> notification -> core`).

## What's NOT included (see plan §8)

Real SMS/email delivery, file uploads, Docker/CI-CD, automated tests, distributed-transaction safety for the dispense flow (best-effort sequential REST calls - see `prescription-service/services/dispense_service.py`), rate limiting/observability, multi-clinic scoping, and wiring the React frontend to call this backend instead of its current `localStorage` mocks.
