# Testing Guide

## Running Tests

| Command | Description |
|---------|-------------|
| `make test` | Run all tests (JS + Python) |
| `make test-py` | Run Python tests |
| `make test-py cmd="-k test_name"` | Run specific Python test(s) |
| `make test-py cmd="myapp/tests/test_views.py"` | Run tests in specific file |
| `make test-py cmd="myapp/tests/test_views.py::TestClass::test_method"` | Run single test |
| `make test-js` | Run JavaScript tests |
| `make test-js cmd="--watchAll"` | Run JS tests in watch mode |
| `make coverage` | Run all tests with coverage reports |
| `make coverage-py` | Python coverage only |
| `make coverage-js` | JavaScript coverage only |

## Python Test Setup

- **Test runner**: pytest + pytest-django
- **Settings module**: `settings.local_test` (configured in `pyproject.toml` under `[tool.pytest.ini_options]`)
- **Settings chain**: `base.py` -> `local.py` -> `test.py` -> `local_test.py`
- **`--reuse-db`**: Enabled by default — reuses test database between runs for speed
- **Auth in tests**: `SessionAuthentication` (not JWT) — set in `settings/test.py`
- **Email backend**: Console (no actual emails sent)
- **`IS_UNITTEST = True`**: Set in test settings, used to conditionally enable test-only URL routes

### pytest Configuration (from `pyproject.toml`)

```
addopts: --strict-markers --junit-xml=report.xml --reuse-db --doctest-modules --cov=. --cov-report=...
DJANGO_SETTINGS_MODULE: settings.local_test
markers: django_db, parametrize, unit
norecursedirs: settings, migrations, .data, app, node_modules
python_files: test_*.py, tests/*.py, tests.py
```

## Authentication in Tests

Tests use `SessionAuthentication`, so authenticate with `force_login`:

```python
import pytest


@pytest.mark.django_db
def test_list_documents(django_client, user):
    django_client.force_login(user)
    response = django_client.get("/api/documents/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_unauthenticated_access(django_client):
    response = django_client.get("/api/documents/")
    assert response.status_code == 403
```

**Note**: The `django_client` fixture returns a Django `Client` instance. Use `force_login(user)` to authenticate — no need to deal with tokens.

## Global Fixtures

Defined in `{{cookiecutter.django_folder_name}}/conftest.py` using `model_bakery`:

| Fixture | Description |
|---------|-------------|
| `django_client` | Django test `Client` instance (wraps pytest-django's `client`) |
| `user` | Regular user (`is_staff=False`) |
| `other_user` | Another regular user (`is_staff=False`) |
| `admin` | Staff user (`is_staff=True`) |
| `superuser` | Superuser (`is_staff=True, is_superuser=True`) |
| `api_client` | DRF `APIClient` authenticated as `user` |
| `sudo_api_client` | DRF `APIClient` authenticated as `superuser` |

All user fixtures are created via `baker.make(django_user_model, ...)`.

## Creating Test Data

Use `model_bakery` for test data:

```python
from model_bakery import baker


@pytest.mark.django_db
def test_document_list(django_client, user):
    documents = baker.make("myapp.Document", _quantity=5)

    django_client.force_login(user)
    response = django_client.get("/api/documents/")
    assert response.json()["totalCount"] == 5


@pytest.mark.django_db
def test_document_with_specific_data(django_client, user):
    document = baker.make("myapp.Document", title="Test Doc", status="published")

    django_client.force_login(user)
    response = django_client.get(f"/api/documents/{document.id}/")
    assert response.json()["title"] == "Test Doc"
```

## Test File Organization

```
myapp/
  tests/
    __init__.py
    conftest.py         # App-specific fixtures
    test_views.py       # API/view tests
    test_models.py      # Model tests
    test_tasks.py       # Celery task tests
```

- Always use `@pytest.mark.django_db` for tests that access the database
- Place app-specific fixtures in `<app>/tests/conftest.py`
- Name test files `test_*.py`

## Available Test Libraries

| Library | Purpose |
|---------|---------|
| `pytest` + `pytest-django` | Test framework + Django integration |
| `model_bakery` | Test data factories (`baker.make()`) |
| `factory-boy` | Alternative test data factories |
| `freezegun` | Time mocking (`@freeze_time("2024-01-01")`) |
| `pytest-mock` | Mock fixtures (`mocker.patch(...)`) |
| `responses` | Mock HTTP requests |
| `hypothesis` + `hypothesis[django]` | Property-based testing |
| `flaky` | Retry flaky tests (`@flaky(max_runs=3)`) |
| `moto` | Mock AWS services (S3, SNS, etc.) |
| `pytest-datadir` | Test data directory fixtures |
| `pytest-regressions` | Regression testing (snapshot-style) |
| `pytest-asyncio` | Async test support |

## JavaScript Tests (Stub)

- **Framework**: Jest + Testing Library
- **Run**: `make test-js`
- **Coverage**: `make coverage-js`
- **Watch mode**: `make test-node-watch`

Detailed frontend testing guide is TODO.
