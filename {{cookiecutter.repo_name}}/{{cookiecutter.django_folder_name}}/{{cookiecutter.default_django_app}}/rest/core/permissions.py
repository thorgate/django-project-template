from rest_framework.permissions import IsAdminUser, SAFE_METHODS


class IsAdminUserOrReadOnly(IsAdminUser):
    """
    Allows updates to admin users, and access to any authenticated users.
    """

    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)
        if is_admin:
            return True

        return request.user.is_authenticated and request.method in SAFE_METHODS
