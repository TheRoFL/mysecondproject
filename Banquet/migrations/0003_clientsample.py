# Generated by Django 4.2 on 2023-08-03 22:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cart', '0008_dishorder_is_for_banquet'),
        ('Banquet', '0002_banquet_is_ordered_alter_client_dishes'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientSample',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField()),
                ('type', models.CharField(max_length=50)),
                ('description', models.TextField()),
                ('rating', models.PositiveIntegerField()),
                ('dishes', models.ManyToManyField(to='Cart.dishorder')),
            ],
        ),
    ]
