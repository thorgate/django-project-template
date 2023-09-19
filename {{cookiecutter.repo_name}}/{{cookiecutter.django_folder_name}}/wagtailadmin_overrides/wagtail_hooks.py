"""
Wagtail default dashboard overwrites.

See https://docs.wagtail.org/en/stable/reference/hooks.html#admin-modules
"""
from django.templatetags.static import static
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from wagtail.contrib.modeladmin.options import (
    modeladmin_register,
    ModelAdminGroup,
)
from wagtail.documents.permissions import (
    permission_policy as document_permission_policy,
)
from wagtail.images.permissions import permission_policy as image_permission_policy
from wagtail.admin.menu import Menu
from wagtail.contrib.modeladmin.menus import GroupMenuItem


@hooks.register("insert_global_admin_css")
def global_admin_css():
    return format_html('<link rel="stylesheet" href="{}">', static("/wagtailadmin/css/admin-theme.css"))


# Below is a bit silly code to reorganize a sidebar menu.
# What is does is groups images, documents items into sub menu.
# And hides previous root menu items.


class ImagesMenuItem(MenuItem):
    def is_shown(self, request):
        return image_permission_policy.user_has_any_permission(
            request.user, ["add", "change", "delete"]
        )


class DocumentsMenuItem(MenuItem):
    def is_shown(self, request):
        return document_permission_policy.user_has_any_permission(
            request.user, ["add", "change", "delete"]
        )


class MediaAdminGroup(ModelAdminGroup):
    menu_label = "Media"
    menu_icon = "media"
    menu_order = 200

    def get_submenu_items(self):
        return [
            ImagesMenuItem(
                _("Images"),
                reverse("wagtailimages:index"),
                name="images",
                icon_name="image",
                order=1,
            ),
            DocumentsMenuItem(
                _("Documents"),
                reverse("wagtaildocs:index"),
                name="documents",
                icon_name="doc-full-inverse",
                order=2,
            ),
        ] + super().get_submenu_items()

    def get_menu_item(self):
        # original method doesn't like it when there's no items() value, and will return None which break WT
        submenu = Menu(items=self.get_submenu_items())
        return GroupMenuItem(self, self.get_menu_order(), submenu)

modeladmin_register(MediaAdminGroup)


@hooks.register("construct_main_menu")
def hide_media_menu_items_from_main_menu(request, menu_items):
    menu_items[:] = [
        item for item in menu_items if item.name not in ("images", "documents", "reports")
    ]


