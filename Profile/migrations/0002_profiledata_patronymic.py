# Generated by Django 4.2 on 2023-08-17 13:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Profile', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profiledata',
            name='patronymic',
            field=models.CharField(default='Отчество', max_length=20),
        ),
    ]
