# Generated by Django 4.2.7 on 2025-04-12 21:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("profiles", "0015_alter_psychologistprofile_options_and_more"),
        ("pricing", "0004_create_suggestedprice_table"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="suggestedprice",
            options={},
        ),
        migrations.AddField(
            model_name="suggestedprice",
            name="user",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="suggestedprice",
            name="psychologist",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="profiles.psychologistprofile",
            ),
        ),
        migrations.AlterModelTable(
            name="suggestedprice",
            table=None,
        ),
    ]
