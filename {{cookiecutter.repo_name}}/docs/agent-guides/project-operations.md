# Project Operations

## Docker Compose Services

| Service | Image/Build | Purpose | Port |
|---------|-------------|---------|------|
| `django` | Dockerfile-django | Django dev server (runserver) | 8000 |
| `node` | Dockerfile-node | Next.js dev server | 3000 |
| `celery` | Dockerfile-django | Celery worker (autoscale 2-6) | — |
| `celery_beat` | Dockerfile-django | Celery Beat scheduler | — |
| `postgres` | postgres:{{cookiecutter.postgres_version}} | PostgreSQL database | — |
| `redis` | redis:7-alpine | Cache + Celery broker | — |
| `mailhog` | mailhog/mailhog:v1.0.0 | Email testing UI | 8025 |

All services use `.env` for environment variables. Django services wait for postgres via `wait-for-it.sh`.

## Settings Architecture

### Inheritance Chain

```
base.py                    # All shared settings, env var loading
├── local.py               # Local dev overrides (from local.py.example)
│   ├── test.py            # Test overrides (IS_UNITTEST=True, SessionAuth, console email)
│   │   └── local_test.py  # Docker-specific test overrides (DB host, redis URL)
└── cloud.py               # Production (DEBUG=False, S3 storage, file logging, strict CORS)
```

### Key Environment Variables (from `.env.example`)

| Variable                           | Default                 | Description                      |
|------------------------------------|-------------------------|----------------------------------|
| `DJANGO_SECRET_KEY`                | `"secret-key"`          | Django secret key                |
| `DJANGO_DEBUG`                     | `True`                  | Debug mode                       |
| `DJANGO_DATABASE_HOST`             | `postgres`              | Database host                    |
| `DJANGO_DATABASE_PORT`             | `5432`                  | Database port                    |
| `DJANGO_DATABASE_NAME`             | (project name)          | Database name                    |
| `DJANGO_DATABASE_USER`             | (project name)          | Database user                    |
| `DJANGO_DATABASE_PASSWORD`         | (project name)          | Database password                |
| `DJANGO_REDIS_URL`                 | `redis://redis:6379/1`  | Redis URL                        |
| `DJANGO_PORT`                      | `8000`                  | External Django port             |
| `MAILHOG_PORT`                     | `8025`                  | External Mailhog port            |
| `DJANGO_JWT_PRIVATE_KEY`           | None                    | RSA private key for RS256 JWT    |
| `DJANGO_JWT_PUBLIC_KEY`            | None                    | RSA public key for RS256 JWT     |
| `DJANGO_JWT_MAX_AGE`               | `300` (5 min)           | Access token lifetime in seconds |
| `DJANGO_SENTRY_DSN`                | `""`                    | Sentry DSN                       |
| `DJANGO_SENTRY_ENVIRONMENT`        | `"local"`               | Sentry environment tag           |
| `DJANGO_HEALTH_CHECK_ACCESS_TOKEN` | (project name)          | Token for detailed health check  |
| `APP_SITE_URL`                     | `http://127.0.0.1:3000` | Frontend URL                     |
| `APP_BACKEND_SITE_URL`             | `http://127.0.0.1:8000` | Backend URL                      |

### How Production Is Detected

Production uses `settings.cloud` which imports from `settings.base` directly. It:
- Sets `DEBUG = False`
- Requires `APP_SITE_URL` and `APP_BACKEND_SITE_URL` env vars (no defaults)
- Enables S3 storage via `DEFAULT_FILE_STORAGE`
- Configures strict CORS (not `ALLOW_ALL`)
- Enables file-based logging (unless `DJANGO_DISABLE_FILE_LOGGING=y`)

## Makefile Reference

### Setup & Docker

| Target | Description |
|--------|-------------|
| `make setup` | Full project setup (PyCharm, settings, Docker build, migrate, node install, API gen, i18n) |
| `make settings` | Create `.env`, `local.py`, `local_test.py` from examples if missing |
| `make docker` | `docker compose down && build && up -d && logs -f` |
| `make docker-logs` | Follow Docker Compose logs |

### Testing

| Target | Description |
|--------|-------------|
| `make test` | Run all tests (JS + Python) |
| `make test-py` | Run Python tests (`cmd=` for extra pytest args) |
| `make test-js` | Run JavaScript tests (`cmd=` for extra args) |
| `make test-node-watch` | JS tests in watch mode |
| `make coverage` | All tests with coverage |
| `make coverage-py` | Python coverage |
| `make coverage-js` | JavaScript coverage |

### Linting & Formatting

| Target | Description |
|--------|-------------|
| `make lint` | Run all linters (`lint-py` + `lint-js`) |
| `make lint-py` | Python linting (ruff format check + ruff lint + prospector) |
| `make lint-js` | JS linting (prettier + eslint + typecheck) |
| `make quality` | Full quality check (`lint` + `poetry-check`) |
| `make fmt` | Auto-format all code (`fmt-py` + `fmt-js`) |
| `make fmt-py` | Format Python (ruff format + ruff lint fix) |
| `make fmt-js` | Format JS (eslint fix + prettier) |
| `make ruff-format` | Ruff format only |
| `make ruff-lint` | Ruff lint only |
| `make prospector` | Prospector with bandit |
| `make eslint` | ESLint only |
| `make prettier-format-all` | Prettier format all |

### Migrations & Django

| Target | Description |
|--------|-------------|
| `make migrate` | Run migrations (`cmd=` for extra args) |
| `make makemigrations` | Create migrations + fix ownership + format |
| `make django-manage cmd=<cmd>` | Run any manage.py command |
| `make shell` | Django shell (manage.py shell) |
| `make django-shell` | Bash in Django container |
| `make node-shell` | Bash in Node container |
| `make psql` | psql in Postgres container |

### Translations

| Target | Description |
|--------|-------------|
| `make makemessages` | Extract Django translation strings |
| `make compilemessages` | Compile Django translations |
| `make extract-i18n` | Extract JS translation strings |
| `make add-locale LOCALE=et` | Add a new locale |

### Package Management

| Target | Description |
|--------|-------------|
| `make poetry-lock` | Regenerate poetry.lock |
| `make poetry-add cmd="<package>"` | Add Python package |
| `make poetry-check` | Check lockfile, run poetry check, pip-audit |
| `make node-install` | `pnpm install` in Node container |

### API Generation

| Target | Description |
|--------|-------------|
| `make export-schema` | Export OpenAPI schema to JSON |
| `make generate-rtk-query-api` | Export + generate RTK Query API + patch + format |
| `make api` | Alias for `generate-rtk-query-api` |
| `make create-rtk-queries-api-patch` | Create patch file from current RTK Query customizations |

## Linting & Formatting Details

### Python — Ruff

Configuration in `pyproject.toml` under `[tool.ruff]`:
- **Line length**: 120
- **Selected rules**: `ALL` with significant ignore list (see pyproject.toml)
- **isort sections**: `future → stdlib → django → pytest → third-party → first-party → local`
- **Known first-party**: `accounts`, `{{cookiecutter.default_django_app}}`
- **Import convention**: `import typing as t` (enforced; `from typing import X` is banned)
- **Format style**: Double quotes, spaces (like Black)

### Python — Prospector

Run with bandit (security linter), without pep257. Uses pylint-django plugin.

### JavaScript — ESLint + Prettier

- ESLint: `pnpm lint:eslint` in Node container
- Prettier: `pnpm prettier-check-all` / `pnpm prettier-format-all`
- TypeScript: `pnpm lint:tsc`

## Package Management

### Python (Poetry)

All Poetry commands run in a Docker container via `make run-poetry-helper`:
- `make poetry-add cmd="django-extensions"` — add a package
- `make poetry-lock` — regenerate lockfile
- `make poetry-check` — validate lockfile + run pip-audit

`pyproject.toml` is at the project root. A symlink exists at `{{cookiecutter.django_folder_name}}/pyproject.toml` -> `../pyproject.toml`.
Poetry lock file: `poetry.lock` at project root, symlinked to `{{cookiecutter.django_folder_name}}/poetry.lock`.

### Node (pnpm)

- `make node-install` — install dependencies
- Commands run via `docker compose run --rm node pnpm <cmd>`

## Management Commands

Located in `{{cookiecutter.django_folder_name}}/{{cookiecutter.default_django_app}}/management/commands/`:

| Command | Description |
|---------|-------------|
| `rsa_key_pair` | Generate RSA key pair for JWT RS256 auth (prints env vars to stdout) |
| `settings` | Dump current Django settings |

Run via: `make django-manage cmd="rsa_key_pair"`

## Health Checks

- **Minimal**: `GET /_health` — returns 200 if Django is running
- **Detailed**: `GET /_health/details?token=<access_token>` — checks DB, cache, Celery, Celery Beat
- **Access token**: `DJANGO_HEALTH_CHECK_ACCESS_TOKEN` env var (default: project name)

Uses `tg_utils.health_check` + `django-health-check` with checks for:
- Database connectivity
- Cache connectivity
- Celery worker availability
- Celery Beat scheduling (timestamps checked every 60s, 5-minute delay threshold)

## CI/CD Overview

GitLab CI pipeline (`.gitlab-ci.yml`):

### Stages

1. **test** — `test-django` (lint-py, coverage-py) and `test-node` (lint-js, coverage-js) in parallel
2. **build** — `build_compose_file` (verify production build), `publish_django` + `publish_node` (push Docker images)
3. **deploy** — Ansible-managed deployment

### Deployment

- **Test environment**: Auto-deploy on `master` branch push
- **Live environment**: Deploy on git tags only
- **Sentry**: Release created before live deploy, finalized after
- **Manual deploy**: Available for test environment on any branch
- **Skip patterns**: Commits with `tests skip`, `test skip`, `[no test]`, `skip-deploy`, `no-deploy`

Infrastructure is managed via Ansible. Deploy scripts are in `scripts/deploy/`.
Terraform setup available via `make setup-terraform workspace=<name>`.
