from django.conf import settings
from whitenoise.middleware import WhiteNoiseMiddleware


class MediaWhiteNoiseMiddleware(WhiteNoiseMiddleware):
    """WhiteNoise that also serves the (repo-committed) media files at /media/.

    Serves MEDIA_ROOT the same fast way as /static/ (straight from the WSGI
    middleware, no full Django view stack) and applies cache headers so the
    browser doesn't re-fetch product images on every navigation.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_files(settings.MEDIA_ROOT, prefix='media')