import django_settings_export


# Monkeypatch django_settings_export to allow access to entire dict
class BetterExportedSettings(django_settings_export.ExportedSettings):
    def items(self):
        return self.__dict__.items()


django_settings_export.ExportedSettings = BetterExportedSettings

settings_export = django_settings_export.settings_export
