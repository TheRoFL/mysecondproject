# Generated by Django 4.2 on 2023-09-02 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cart', '0010_alter_dishorder_owner'),
        ('Banquet', '0015_banquet_is_approved'),
    ]

    operations = [
        migrations.AddField(
            model_name='banquet',
            name='additional',
            field=models.ManyToManyField(to='Cart.dishorder'),
        ),
    ]
