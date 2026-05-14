from django.db import migrations, models


def forwards(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    Order.objects.filter(currency="PKR").update(currency="GBP")


def backwards(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    Order.objects.filter(currency="GBP").update(currency="PKR")


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name="order",
            name="currency",
            field=models.CharField(default="GBP", max_length=8),
        ),
    ]
