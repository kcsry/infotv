# -- encoding: UTF-8 --
import requests
from django.core.management.base import BaseCommand
from infotv.models import Datum


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--location-id", default=649360, type=int)
        parser.add_argument("--app-id", help="OpenWeatherMap App ID", type=str)

    def handle(self, location_id, app_id, **options):
        if not app_id:
            raise ValueError("app_id required")
        resp = requests.get(
            url="http://api.openweathermap.org/data/2.5/weather",
            params={"id": location_id, "appid": app_id}
        )
        resp.raise_for_status()
        datum, _ = Datum.objects.get_or_create(event_slug=None, key="weather")
        datum.value = resp.json()
        datum.save()
