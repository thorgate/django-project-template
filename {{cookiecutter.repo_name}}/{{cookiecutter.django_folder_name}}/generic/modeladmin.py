from wagtail.contrib.modeladmin.helpers import PermissionHelper


class NonEditable(PermissionHelper):
    def user_can_create(self, user):
        return False

    def user_can_edit_obj(self, user, obj):
        return False

    def user_can_delete_obj(self, user, obj):
        return False
