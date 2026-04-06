"""
Initial migration for the ai_agents domain app.
Maps to existing database tables created by the marketplace app.
"""
import django.core.validators
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
            name='UserAgent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('target_item', models.CharField(help_text="Raw YOLO class name to watch for (e.g., 'washing_machine', 'scrap_metal')", max_length=50)),
                ('max_budget', models.DecimalField(decimal_places=2, help_text='Maximum amount the agent is allowed to bid', max_digits=10, validators=[django.core.validators.MinValueValidator(1)])),
                ('requirements_prompt', models.TextField(blank=True, default='', help_text="User's natural language requirements (e.g., 'Toshiba 10kg good condition')")),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='agents', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'user_agents',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['target_item', 'is_active'], name='user_agents_target_idx'),
                ],
            },
        ),
    ]
