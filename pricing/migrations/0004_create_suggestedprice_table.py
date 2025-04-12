# Replace XXXX with the actual migration number generated

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0001_initial'),  # Make sure this matches your actual profiles migration
        ('pricing', '0003_alter_suggestedprice_table'),  # Replace with your previous pricing migration
    ]

    operations = [
        migrations.CreateModel(
            name='SuggestedPrice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('psychologist', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='suggested_price', to='profiles.psychologistprofile')),
            ],
            options={
                'verbose_name': 'Suggested Price',
                'verbose_name_plural': 'Suggested Prices',
                'db_table': 'pricing_suggestedprice',
            },
        ),
    ]