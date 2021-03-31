from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import InfoTvView

urlpatterns = [
    path(r'<event>/infotv/', csrf_exempt(InfoTvView.as_view())),
]
