from django.conf import settings


worker_hijack_root_logger = False

broker_url = settings.REDIS_CELERY_URL
broker_transport_options = {"fanout_prefix": True}

result_backend = settings.REDIS_CELERY_URL

timezone = "UTC"

beat_schedule = settings.CELERYBEAT_SCHEDULE
