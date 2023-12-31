# Generated by Django 4.2 on 2023-07-26 13:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cart', '0002_order_owner'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='address',
            field=models.CharField(default=None, max_length=50),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_time',
            field=models.DateTimeField(default=None),
        ),
        migrations.AddField(
            model_name='order',
            name='wishes',
            field=models.CharField(default=None, max_length=150),
        ),
    ]
