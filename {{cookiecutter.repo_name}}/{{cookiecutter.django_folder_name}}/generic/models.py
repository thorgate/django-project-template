from model_utils.models import TimeStampedModel, UUIDModel


class BaseModel(UUIDModel, TimeStampedModel):
    """
    Base model for this project.
    It has these fields:
    - id (which is unique UUID)
    - created
    - modified
    - is_removed (also has a manager which hides deleted objects)
    - owned_by (Organization to which this object belongs to)
    """

    class Meta:
        abstract = True
