# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-08-07 10:53
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hxldash', '0020_auto_20190807_1031'),
    ]

    operations = [
        migrations.AlterField(
            model_name='biteconfig',
            name='mapOptions',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bite', to='hxldash.MapBite'),
        ),
        migrations.AlterField(
            model_name='dashboardconfig',
            name='bites',
            field=models.ManyToManyField(related_name='dash', to='hxldash.BiteConfig'),
        ),
        migrations.AlterField(
            model_name='dashboardconfig',
            name='dataTable',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='dash', to='hxldash.DataTable'),
        ),
        migrations.AlterField(
            model_name='tablefield',
            name='dataTable',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tableField', to='hxldash.DataTable'),
        ),
    ]
