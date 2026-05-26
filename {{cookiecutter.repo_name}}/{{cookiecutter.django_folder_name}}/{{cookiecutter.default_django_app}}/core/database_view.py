import typing as t

from django.db import DEFAULT_DB_ALIAS, models


class DatabaseView(models.Model):
    # Class names of views that are needed for this view
    dependencies: set[str] = set()

    # Collection of columns each of which will be indexed in this view (for faster lookups and access). Values in the
    # columns do not have to be unique.
    view_indexes: t.ClassVar[t.Collection[str]] = []

    # You need to also define columns of your view in the subclass. Keep in mind, that Django assumes that every model
    # has a single column unique primary key. This means:
    # * if you do not define one of the fields explicitly as `primary_key=True`, then django will add `id` column for
    #   you, and if the view queryset doesn't have `id` column any read query will result in DB error
    # * if you define some field as `primary_key=True` django will assume it is unique (so if it is, for example,
    #   ForeignKey field, django will effectively convert it to OneToOne field which may not be what you want).
    #
    # The simplest workaround for this for views that don't have a single column with unique values is to just
    # annotate the materialized view queryset with id=models.Value(None), creating the `id` column Django expects and
    # populating it with NULLs (which is okay since we never intend to use it anyway).


    class Meta:
        abstract = True
        managed = False
        # db_table is not overridden, as we take advantage of django automatically generating the table name for us
        # in the code that creates the views.

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        raise RuntimeError("Can't perform UPDATE or INSERT on database view.")

    @classmethod
    def get_view_queryset(cls) -> models.QuerySet:
        """Composes and returns a queryset that will be materialized as view."""
        raise NotImplementedError()

    @classmethod
    def drop_view(cls):
        """Drops (removes) the view from DB."""
        # NB: CASCADE and IF EXISTS are important for current implementation of `drop_all_materialized_views`
        # to work correctly
        with cls.get_compiler().connection.cursor() as cursor:
            cursor.execute(
                f"DROP VIEW IF EXISTS {cls._meta.db_table} CASCADE",
            )

    @classmethod
    def get_compiler(cls):
        return cls.get_view_queryset().query.get_compiler(DEFAULT_DB_ALIAS)

    @classmethod
    def create_view_from_queryset(cls):
        """Creates (or re-creates, if exists) the view in DB.

        Caveat: if there are views that depend on this view, they will be dropped and will not be re-created. For this
        reason, this method should not be used manually and should always be called from `create_all_materialized_views`
        unless you really know what you are doing.
        """
        if cls._meta.abstract:
            return

        compiler = cls.get_compiler()
        view_query_sql, params = compiler.as_sql()

        sql = f"CREATE OR REPLACE VIEW {cls._meta.db_table} AS {view_query_sql};"

        with compiler.connection.cursor() as cursor:
            cursor.execute(sql, params)

    @staticmethod
    def _iterate_over_subclasses():
        """
        Generator that yields all subclasses of DatabaseView, in such order that dependant views are always yielded
        after the views they depend on (Raises RuntimeError if such order can not be determined)
        """
        subclasses = DatabaseView.__subclasses__()
        processed: set[str] = set()

        while len(processed) < len(subclasses):
            # Counts number of views processed in this dependency level to break the loop in case of invalid dependency
            # graph
            count = 0

            for subclass in subclasses:
                subclass_name = subclass.__name__
                # Skip the processed one
                if subclass_name in processed:
                    continue

                # Skip views that can not be processed since their dependencies are still unprocessed
                if not subclass.dependencies.issubset(processed):
                    continue

                yield subclass
                processed.add(subclass_name)
                count += 1

            # If on this outer loop iteration no views have been processed, then status is invalid and
            # dependency graph needs fixing
            if count == 0:
                conflicting_view_names = ", ".join(
                    {subclass.__name__ for subclass in DatabaseView.__subclasses__()}.difference(processed)
                )
                raise RuntimeError(
                    f"Circular or invalid dependency for database views {conflicting_view_names}."
                )

    @staticmethod
    def create_all_views():
        """Create all Database Views."""
        for subclass in DatabaseView._iterate_over_subclasses():
            subclass.create_view_from_queryset()

    @staticmethod
    def drop_all_views():
        """
        Drop all Database Views

        This needs to be done in reverse order, so that we don't drop the views that provide data to dependant views
        before the respective dependant views.
        """
        for subclass in reversed(list(DatabaseView._iterate_over_subclasses())):
            subclass.drop_view()


def pre_migrate(*args, **kwargs):
    DatabaseView.drop_all_views()


def post_migrate(*args, **kwargs):
    DatabaseView.create_all_views()
