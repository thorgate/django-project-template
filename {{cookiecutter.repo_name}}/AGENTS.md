# Project Template — Agent Guide

## Architecture Overview

| Layer | Stack |
|-------|-------|
| Backend | Django 5.2+ / DRF 3.15 / Python {{cookiecutter.python_version}} |
| Frontend | Next.js 13 (Pages Router) / React 18 / TypeScript / RTK Query / Tailwind |
| Infrastructure | Docker Compose: postgres {{cookiecutter.postgres_version}}, redis 7, celery worker+beat, mailhog |
| Auth | Email-based (no username), JWT via SimpleJWT (Bearer tokens) |

## Directory Structure

```
{{cookiecutter.django_folder_name}}/
  {{cookiecutter.default_django_app}}/                     # Default Django app (ROOT_URLCONF, celery, wsgi)
    {{cookiecutter.default_django_app}}/models.py          # BaseModel, BaseModelQueryset, determine_max_length
    rest/
      {{cookiecutter.default_django_app}}/viewsets.py      # BaseViewSet, ActionBased*Mixins, ExtraFilteredActionsMixin
      {{cookiecutter.default_django_app}}/serializers.py   # ModelSerializerMixin, ForRequestSchemaSerializerMixin
      {{cookiecutter.default_django_app}}/filters.py       # BaseFilterSet, PrimaryKeyInFilter
      {{cookiecutter.default_django_app}}/pagination.py    # CustomPageNumberPagination
      {{cookiecutter.default_django_app}}/routers.py       # BaseRouter, CustomLookupMixin
      {{cookiecutter.default_django_app}}/schema_generator.py  # AutoSchema for drf-spectacular
      urls.py               # API router registration + URL includes
    urls.py                 # Top-level URL config (api/, adminpanel/, _health)
    tasks.py                # Celery tasks
    storages.py             # MediaStorage, PrivateMediaStorage (S3)
  accounts/                 # User model, auth views, JWT endpoints
    models.py               # User (email as USERNAME_FIELD), UserManager
    jwt/urls.py             # /api/auth/token/, token/refresh/, token/verify/
    rest/views.py           # UserViewSet, SignUpView, ForgotPassword, etc.
    rest/signed_resource.py # SignedAccessResourceMixin, HasSignedResourceToken
  settings/                 # base.py -> local.py / test.py / local_test.py / cloud.py
  conftest.py               # Global pytest fixtures (user, admin, superuser, etc.)
app/                        # Next.js frontend
pyproject.toml              # Python deps (Poetry), ruff/pytest/coverage config
Makefile                    # All dev/test/lint/deploy commands
docker-compose.yml          # Dev services
```

## Critical Conventions

- **BaseModel**: All models extend `{{cookiecutter.default_django_app}}.{{cookiecutter.default_django_app}}.models.BaseModel` — auto `created`/`updated` timestamps, default ordering `-created`
- **BaseViewSet**: All viewsets extend `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.viewsets.BaseViewSet` — pre-wired camelCase renderer/parser, pagination, filters
- **ModelSerializerMixin**: All serializers use `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.serializers.ModelSerializerMixin` — auto-appends read-only `created`/`updated` fields
- **BaseFilterSet**: All filters extend `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.filters.BaseFilterSet` — search, sorting, date ranges built-in
- **CamelCase API**: Write snake_case in Python; auto-converted by renderer/parser/middleware. Filter params are also camelCase
- **Email auth**: `User.USERNAME_FIELD = "email"` — no username field exists
- **JWT in production, Session in tests**: Production uses `JWTAuthentication` (Bearer tokens); test settings swap to `SessionAuthentication`
- **Typing convention**: `import typing as t` (enforced by ruff; `from typing import X` is banned)
- **URL registration**: Register viewsets in `{{cookiecutter.default_django_app}}/rest/urls.py` router, or create app-scoped `rest/urls.py` and include it

## Essential Commands

| Command | Description |
|---------|-------------|
| `make docker` | Build and start all services, follow logs |
| `make setup` | Full project setup (Docker build, migrate, node install, API gen) |
| `make test` | Run all tests (JS + Python) |
| `make test-py` | Run Python tests only (`cmd=` to pass extra args) |
| `make test-js` | Run JavaScript tests only |
| `make coverage` | Run all tests with coverage |
| `make quality` | Full lint check (ruff + prospector + prettier + eslint + poetry-check) |
| `make lint` | Lint only (no poetry-check) |
| `make fmt` | Auto-format all code (ruff + prettier + eslint) |
| `make migrate` | Run Django migrations |
| `make makemigrations` | Create new migrations (auto-formats after) |
| `make django-manage cmd=<cmd>` | Run any manage.py command |
| `make shell` | Django shell |
| `make django-shell` | Bash shell in Django container |
| `make export-schema` | Export OpenAPI schema to JSON |
| `make generate-rtk-query-api` | Export schema + generate RTK Query API client |
| `make create-rtk-queries-api-patch` | Create patch file for RTK Query customizations |
| `make psql` | Open psql in postgres container |

## Dev Ports

| Service | Port |
|---------|------|
| Django | 8000 |
| Next.js | 3000 |
| Mailhog | 8025 |

## URL Structure

| Path | Purpose |
|------|---------|
| `/api/` | DRF API root |
| `/api/auth/token/` | JWT obtain (POST email + password) |
| `/api/auth/token/refresh/` | JWT refresh |
| `/api/auth/token/verify/` | JWT verify |
| `/api/user/me` | Current user details |
| `/api/user/signup` | User registration |
| `/api/schema/swagger-ui/` | Swagger UI |
| `/api/schema/redoc/` | ReDoc |
| `/adminpanel/` | Django admin |
| `/_health` | Health check (minimal) |
| `/_health/details` | Health check (detailed, requires access token) |

## Settings Architecture

Settings inheritance: `base.py` -> `local.py` -> `test.py` -> `local_test.py` (for tests), `base.py` -> `cloud.py` (for production).

- Env vars loaded via `environs` (see `.env.example` for all vars)
- Production mode: import from `settings.cloud` (sets `DEBUG=False`, enables S3, file logging)
- Test mode: `settings.local_test` sets `IS_UNITTEST=True`, swaps JWT for SessionAuthentication, uses console email backend
- `DJANGO_SETTINGS_MODULE` defaults to `settings.local` (in celery.py and pytest config)

## Detailed Guides

- [Backend Patterns](docs/agent-guides/backend-patterns.md) — Models, viewsets, serializers, filters, URLs, Celery
- [API & Frontend Integration](docs/agent-guides/api-and-frontend-integration.md) — CamelCase, pagination, auth flow, OpenAPI, RTK Query
- [Testing Guide](docs/agent-guides/testing-guide.md) — Fixtures, test patterns, running tests
- [Project Operations](docs/agent-guides/project-operations.md) — Docker, Makefile, settings, linting, CI/CD
