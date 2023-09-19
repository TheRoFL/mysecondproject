# Generated by Django 4.2 on 2023-09-09 13:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Banquet', '0017_alter_menusample_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='menusample',
            name='name',
            field=models.CharField(default='Название', max_length=50),
        ),
        migrations.AlterField(
            model_name='menusample',
            name='type',
            field=models.CharField(choices=[('Новогоднее', 'Новогоднее'), ('Свадебное', 'Свадебное'), ('День рождения', 'День рождения')], default=None, max_length=50, null=True),
        ),
    ]