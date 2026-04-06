"""
Initial migration for the catalog domain app.
Maps to existing database tables created by the marketplace app.
"""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('category', models.CharField(choices=[('scrap_metals', 'خردة ومعادن'), ('electronics', 'إلكترونيات وأجهزة'), ('furniture', 'أثاث وديكور'), ('cars', 'سيارات للبيع'), ('real_estate', 'عقارات'), ('books', 'كتب'), ('other', 'أخرى')], max_length=20)),
                ('condition', models.CharField(choices=[('new', 'New'), ('like-new', 'Like New'), ('good', 'Good'), ('fair', 'Fair')], default='good', max_length=10)),
                ('status', models.CharField(choices=[('active', 'Active'), ('sold', 'Sold'), ('pending', 'Pending'), ('inactive', 'Inactive')], default='active', max_length=10)),
                ('location', models.CharField(max_length=200)),
                ('phone_number', models.CharField(blank=True, default='', max_length=20)),
                ('is_auction', models.BooleanField(default=False)),
                ('detected_item', models.CharField(blank=True, default='', help_text='YOLO detected class name for agent matching', max_length=100)),
                ('auction_end_time', models.DateTimeField(blank=True, null=True)),
                ('views_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'products',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['category', 'status'], name='products_categor_idx'),
                    models.Index(fields=['-created_at'], name='products_created_idx'),
                ],
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='products/')),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='catalog.product')),
            ],
            options={
                'db_table': 'product_images',
                'ordering': ['order', '-is_primary'],
            },
        ),
        migrations.CreateModel(
            name='Wishlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlisted_by', to='catalog.product')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlist', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'wishlists',
                'ordering': ['-created_at'],
                'unique_together': {('user', 'product')},
            },
        ),
    ]
