from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = 'Run a raw SQL query against the configured database and print results.'

    def add_arguments(self, parser):
        parser.add_argument('sql', help='SQL query to run, e.g. "SHOW TABLES"')

    def handle(self, *args, **options):
        sql = options['sql']
        with connection.cursor() as cursor:
            try:
                cursor.execute(sql)
            except Exception as exc:
                raise CommandError(f'Query failed: {exc}')
            cols = [c[0] for c in cursor.description] if cursor.description else None
            rows = cursor.fetchall()
        if cols is None:
            self.stdout.write(f'OK ({cursor.rowcount} rows affected).')
            return
        width = max(len(str(c)) for c in cols)
        self.stdout.write(' | '.join(f'{c:<{width}}' for c in cols))
        self.stdout.write('-' * (width * len(cols) + 3 * (len(cols) - 1)))
        for row in rows:
            self.stdout.write(' | '.join(f'{str(v):<{width}}' for v in row))
        self.stdout.write(self.style.SUCCESS(f'\n{len(rows)} row(s).'))