# Generated by Django 4.2 on 2023-08-01 15:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cart', '0007_order_is_ordered'),
        ('Banquet', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='banquet',
            name='is_ordered',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='client',
            name='dishes',
            field=models.ManyToManyField(blank=True, to='Cart.dishorder'),
        ),
    ]