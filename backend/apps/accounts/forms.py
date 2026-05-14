from django.contrib.admin.forms import AdminAuthenticationForm


class StaffEmailLoginForm(AdminAuthenticationForm):
    """Django admin still names the credential field `username`; our USERNAME_FIELD is `email`."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].label = "Email address"
        self.fields["username"].widget.attrs.setdefault("placeholder", "useradmin@recycle.com")
