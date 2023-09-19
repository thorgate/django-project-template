from wagtail.admin.panels import Panel


class ReadonlyPanel(Panel):
    def __init__(
        self,
        field_name,
        template="wagtailadmin/panels/help_panel.html",
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.field_name = field_name
        self.template = template

    def clone_kwargs(self):
        kwargs = super().clone_kwargs()
        kwargs.update(
            field_name=self.field_name,
            template=self.template,
        )
        return kwargs

    class BoundPanel(Panel.BoundPanel):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self.heading = self.panel.heading
            self.template_name = self.panel.template
            self.content = f"<p>{getattr(self.instance, self.panel.field_name)}</p>"
