# -- encoding: UTF-8 --
from django.utils.encoding import force_text

from infotv.views import InfoTvView


def test_view(rf):
    # This is a silly test.
    request = rf.get("/")
    response = InfoTvView.as_view()(request=request, event="basjdnasdf")
    assert "var Options = {" in force_text(response.content)
