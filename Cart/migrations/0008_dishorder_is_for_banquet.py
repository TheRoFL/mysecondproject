# Generated by Django 4.2 on 2023-08-03 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cart', '0007_order_is_ordered'),
    ]

    operations = [
        migrations.AddField(
            model_name='dishorder',
            name='is_for_banquet',
            field=models.BooleanField(default=True),
        ),
    ]
