from django.db import migrations, models


def forwards(apps, schema_editor):
    ProductListing = apps.get_model("products", "ProductListing")
    ProductListing.objects.filter(currency="PKR").update(currency="GBP")


def backwards(apps, schema_editor):
    ProductListing = apps.get_model("products", "ProductListing")
    ProductListing.objects.filter(currency="GBP").update(currency="PKR")


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name="productlisting",
            name="currency",
            field=models.CharField(default="GBP", max_length=8),
        ),
    ]
