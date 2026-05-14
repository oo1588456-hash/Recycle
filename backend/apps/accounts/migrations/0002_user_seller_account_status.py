from django.db import migrations, models


def set_seller_statuses(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role="seller").update(seller_account_status="approved")
    User.objects.exclude(role="seller").update(seller_account_status="na")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="seller_account_status",
            field=models.CharField(
                choices=[
                    ("na", "N/A"),
                    ("pending", "Pending approval"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                ],
                db_index=True,
                default="na",
                max_length=16,
            ),
        ),
        migrations.RunPython(set_seller_statuses, migrations.RunPython.noop),
    ]
