# Generated by Django 5.1.7 on 2025-03-31 01:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0004_user_last_login_ip_user_profile_picture_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='profile_picture',
        ),
    ]
