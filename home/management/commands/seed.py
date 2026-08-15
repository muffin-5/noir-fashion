from django.core.management.base import BaseCommand
from django.core.management import call_command

from home.models import Categories


class Command(BaseCommand):
    help = 'Seed demo data (categories + products) if the database is empty.'

    def handle(self, *args, **options):
        if Categories.objects.exists():
            self.stdout.write(self.style.WARNING('Data already present - skipping seed.'))
            return
        call_command('loaddata', 'seed.json')
        self.stdout.write(self.style.SUCCESS('Seeded demo data (categories + products).'))