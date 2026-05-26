# Backend Patterns

## Creating a New App

1. Create the app directory under `{{cookiecutter.django_folder_name}}/`:
```
myapp/
  __init__.py
  models.py
  admin.py
  rest/
    __init__.py
    views.py
    serializers.py
    filters.py
    urls.py          # optional: if using app-scoped router
  tests/
    __init__.py
    test_views.py
  migrations/
    __init__.py
```

2. Register in `{{cookiecutter.django_folder_name}}/settings/base.py`:
```python
INSTALLED_APPS = [
    "accounts",
    "myapp",          # Add here, before third-party apps
    DEFAULT_DJANGO_APP,
    ...
]
```

3. Add URLs — either register viewsets in `{{cookiecutter.default_django_app}}/rest/urls.py` or include app URLs:
```python
path('myapp/', include('myapp.rest.urls')),
```

4. Add to ruff `known-first-party` in `pyproject.toml` (under `[tool.ruff.lint.isort]`):
```toml
known-first-party = ["accounts", "{{cookiecutter.default_django_app}}", "myapp"]
```

## Models

All models must extend `BaseModel` from `{{cookiecutter.default_django_app}}.{{cookiecutter.default_django_app}}.models`:

```python
import typing as t

from django.db import models
from django.utils.translation import gettext_lazy

from {{cookiecutter.default_django_app}}.{{cookiecutter.default_django_app}}.models import BaseModel, BaseModelQueryset, determine_max_length


class DocumentQueryset(BaseModelQueryset):
    def published(self):
        return self.filter(status="published")


class Document(BaseModel):
    STATUS_CHOICES = [
        ("draft", gettext_lazy("Draft")),
        ("published", gettext_lazy("Published")),
    ]

    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=determine_max_length(STATUS_CHOICES),
        choices=STATUS_CHOICES,
        default="draft",
    )

    objects = DocumentQueryset.as_manager()

    def __str__(self):
        return self.title
```

**What `BaseModel` provides:**
- `created` field: `DateTimeField` with `db_default=Now()`, indexed
- `updated` field: `DateTimeField` with `auto_now=True`, indexed
- Default ordering: `["-created"]`
- `BaseModelQueryset` as default manager

**`determine_max_length(choices)`**: Calculates the max length from a list of choice tuples — use it for `CharField` with choices.

## Serializers

Use `ModelSerializerMixin` for all model serializers:

```python
from rest_framework import serializers

from {{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.serializers import ModelSerializerMixin

from myapp.models import Document


class DocumentSerializer(ModelSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "title", "status"]
        # created and updated are auto-appended as read-only by ModelSerializerMixin
```

**What `ModelSerializerMixin` provides:**
- Automatically appends `created` and `updated` as read-only fields (for top-level serializers only, not nested)
- Inherits `ForRequestSchemaSerializerMixin` which generates clean request-only schemas for OpenAPI (strips read-only fields from request bodies)

**Excluding timestamps:**
```python
class DocumentSerializer(ModelSerializerMixin, serializers.ModelSerializer):
    exclude_created_timestamp = True  # Don't add created field
    exclude_updated_timestamp = True  # Don't add updated field
```

**Per-action serializers on viewsets** — use `ActionBasedSerializerMixin`:
```python
from {{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.viewsets import ActionBasedSerializerMixin, BaseViewSet

class DocumentViewSet(ActionBasedSerializerMixin, ..., BaseViewSet):
    serializer_class = DocumentSerializer
    action_based_serializer_classes = {
        "create": DocumentCreateSerializer,
        "update": DocumentUpdateSerializer,
    }
```

Avoid using Method fields on serializers if possible, as those do not generate good OpenAPI schemas. Use model properties and serializer fields instead, if applicable.

## ViewSets

All viewsets extend `BaseViewSet` from `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.viewsets`:

```python
from rest_framework import mixins
from rest_framework.permissions import IsAuthenticated

from {{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.viewsets import ActionBasedSerializerMixin, BaseViewSet

from myapp.models import Document
from myapp.rest.filters import DocumentFilterSet
from myapp.rest.serializers import DocumentSerializer, DocumentCreateSerializer


class DocumentViewSet(
    ActionBasedSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    BaseViewSet,
):
    serializer_class = DocumentSerializer
    action_based_serializer_classes = {
        "create": DocumentCreateSerializer,
    }
    permission_classes = [IsAuthenticated]
    filterset_class = DocumentFilterSet

    def get_queryset(self):
        return Document.objects.all()
```

**What `BaseViewSet` provides (pre-configured):**
- `filter_backends = [BaseFilterBackend]` (DjangoFilterBackend subclass with extra action support)
- `pagination_class = CustomPageNumberPagination`
- `renderer_classes = [CamelCaseJSONRenderer]`
- `parser_classes = [CamelCaseJSONParser]`
- `filterset_class = BaseFilterSet`

**Available mixins:**
- `ActionBasedSerializerMixin` — per-action serializer classes via `action_based_serializer_classes` dict
- `ActionBasedQuerysetMixin` — per-action querysets via `action_based_querysets` dict
- `ExtraFilteredActionsMixin` — per-action filter classes via `extra_filtered_actions` dict

**File upload endpoints**: `BaseViewSet` only includes `CamelCaseJSONParser`. For endpoints accepting file uploads, set `parser_classes = [CamelCaseMultiPartParser]` from `djangorestframework_camel_case.parser`. If extending `GenericViewSet` directly (not `BaseViewSet`), you must set parser classes explicitly.

## Filters

All filtersets extend `BaseFilterSet` from `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.filters`:

```python
from {{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.filters import BaseFilterSet

from myapp.models import Document


class DocumentFilterSet(BaseFilterSet):
    search_fields = ["title"]           # Fields searchable via ?search= param
    sorting_fields = ["title"]          # Fields sortable via ?sort= param

    class Meta:
        model = Document
        fields = ["status"]
```

**What `BaseFilterSet` provides automatically:**
- `search` filter: icontains search across all `search_fields` (removed if `search_fields` is empty)
- `sort` filter: choice-based sorting. Auto-generates choices:
  - `creationTimeAsc`/`creationTimeDesc` (if model has `created`)
  - `lastModificationTimeAsc`/`lastModificationTimeDesc` (if model has `updated`)
  - `{fieldName}Asc`/`{fieldName}Desc` for each field in `sorting_fields` (camelCased)
- `created` date range filter (DateTimeFromToRangeFilter)
- `last_modified` date range filter (DateTimeFromToRangeFilter)

**Additional options:**
- `include_id_in = True` — adds `{pk_field}_in` filter for filtering by list of IDs
- `extra_sort = ["id"]` — tiebreaker fields appended to all sort orderings (default: `["id"]`)
- `disable_sort = True` — disables all sorting

**Status-based sorting** — for sorting by position in a choices tuple instead of alphabetically:
```python
class DocumentFilterSet(BaseFilterSet):
    sorting_fields = ["status"]
    status_field_name = "status"
    status_choices_name = "STATUS_CHOICES"

    @classmethod
    def sort_by_status_asc(cls, queryset):
        return cls._sort_by_status(queryset, cls.SORT_ASC)

    @classmethod
    def sort_by_status_desc(cls, queryset):
        return cls._sort_by_status(queryset, cls.SORT_DESC)
```

**`PrimaryKeyInFilter`**: A `BaseInFilter` + `CharFilter` for filtering by comma-separated primary keys.

**Multi-value `in` filters**: When a filter should accept multiple values (e.g. filtering by several names at once), use `BaseInFilter` with `QueryArrayWidget`. The frontend RTK Query client serializes arrays by repeating the query parameter (`?name=Alice&name=Bob`), not as CSV. `QueryArrayWidget` parses this format on the Django side:

```python
from django_filters import BaseInFilter
from django_filters.widgets import QueryArrayWidget

name = BaseInFilter(
    field_name="name",
    lookup_expr="in",
    widget=QueryArrayWidget,
)
```

## URL Registration

Use `BaseRouter` from `{{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.routers`:

```python
# In {{cookiecutter.default_django_app}}/rest/urls.py — register on the main router:
from myapp.rest.views import DocumentViewSet

router.register(r"documents", DocumentViewSet, basename="document")
```

Or create an app-scoped router and include it:
```python
# myapp/rest/urls.py
from {{cookiecutter.default_django_app}}.rest.{{cookiecutter.default_django_app}}.routers import BaseRouter
from myapp.rest.views import DocumentViewSet

router = BaseRouter()
router.register(r"documents", DocumentViewSet, basename="document")
urlpatterns = router.urls

# {{cookiecutter.default_django_app}}/rest/urls.py — add include:
path('myapp/', include('myapp.rest.urls')),
```

**`BaseRouter`**: Extends `DefaultRouter` with optional trailing slash (`/?` regex — both `/api/documents` and `/api/documents/` work).

**`CustomLookupMixin`**: Override lookup regex on a viewset for non-standard URL patterns (e.g. composite keys).

## Celery Tasks

Tasks live in `<app>/tasks.py` and use the Celery app from `{{cookiecutter.default_django_app}}.celery`:

```python
import logging

from {{cookiecutter.default_django_app}}.celery import app

logger = logging.getLogger(__name__)


@app.task
def process_document(document_id: int):
    logger.info("Processing document %s", document_id)
    # ... task logic
```

Register periodic tasks in `settings/base.py`:
```python
CELERYBEAT_SCHEDULE = {
    ...
    "process-documents": {
        "task": "myapp.tasks.process_document",
        "schedule": 60 * 30,  # every 30 minutes
    },
}
```

**Existing tasks:**
- `{{cookiecutter.default_django_app}}.tasks.default_task` — no-op test task (runs every 5 min)
- `{{cookiecutter.default_django_app}}.tasks.cleanup_old_sessions` — clears expired Django sessions + vacuums table (daily at 2:45 AM)

## Signed Resource Access

For granting time-limited, token-based access to specific resources (e.g. file downloads without auth headers):

1. Mix `SignedAccessResourceMixin` into your model
2. Use `HasSignedResourceToken` as a permission class on the viewset
3. Generate tokens via `HasSignedResourceToken.create_token_parameters(obj)`

Located in `accounts/rest/signed_resource.py`. Tokens are HS512-signed JWTs valid for 1 hour by default.

## Management Commands

**Existing commands** (in `{{cookiecutter.default_django_app}}/management/commands/`):
- `rsa_key_pair` — generates RSA key pair for JWT RS256 authentication
- `settings` — dumps current Django settings

**Adding new commands:** Create `<app>/management/commands/<command_name>.py` following standard Django management command pattern.

## S3 Storage

Two storage classes in `{{cookiecutter.default_django_app}}/storages.py`:
- `MediaStorage` — public-read ACL, for publicly accessible uploads
- `PrivateMediaStorage` — private ACL, for restricted file access

Both use `settings.MEDIAFILES_LOCATION` as the S3 prefix. Enabled in production via `cloud.py` setting `DEFAULT_FILE_STORAGE`.
