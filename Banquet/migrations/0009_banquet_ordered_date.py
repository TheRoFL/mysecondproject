# Generated by Django 4.2 on 2023-08-16 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Banquet', '0008_rename_clientsample_menusample'),
    ]

    operations = [
        migrations.AddField(
            model_name='banquet',
            name='ordered_date',
            field=models.DateField(blank=True, default=None, null=True),
        ),
    ]
