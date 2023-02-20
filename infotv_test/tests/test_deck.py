import json

import pytest
from django.test.client import RequestFactory
from django.test.utils import override_settings
from django.utils.encoding import force_str

from infotv.views import InfoTvView

EXAMPLE_DECK_DATA = {
    "decks": {
        "default": [
            {
                "duration": 1,
                "content": "# test",
                "type": "text",
                "id": "s24t7h1n0q"
            },
            {
                "duration": 1,
                "src": "https://placehold.it/304x220",
                "type": "image",
                "id": "s2534m3sqo"
            },
            {
                "duration": 1,
                "type": "nownext",
                "id": "s2533iqgbo"
            }
        ],
        "testdeck": [
            {
                "type": "text",
                "duration": 1,
                "id": "s29nhihhe8",
                "content": "slide in testdeck"
            }
        ]
    },
    "eep": None
}


def get_deck_post_request():
    return RequestFactory().post("/", {"action": "post_deck", "data": json.dumps(EXAMPLE_DECK_DATA)})


@pytest.mark.django_db
def test_post_deck(rf, settings):
    settings.INFOTV_POLICY_CLASS = "infotv.policy.AnythingGoesPolicy"
    request = get_deck_post_request()
    last_deck_id = 0
    for _x in range(3):
        response = InfoTvView.as_view()(request=request, event="dsfargeg")
        assert response.status_code == 200
        deck_id = json.loads(force_str(response.content))["id"]
        assert deck_id > last_deck_id
        last_deck_id = deck_id
    response = InfoTvView.as_view()(request=rf.get("/", {"action": "get_deck"}), event="dsfargeg")
    deck_data = json.loads(force_str(response.content))
    assert deck_data["id"] == last_deck_id
    assert deck_data["data"] == EXAMPLE_DECK_DATA


@pytest.mark.django_db
def test_get_bogus_event_deck(rf):
    response = InfoTvView.as_view()(request=rf.get("/", {"action": "get_deck"}), event="dkfjstwr4iunm")
    assert json.loads(force_str(response.content))["id"] == "missing"


@pytest.mark.django_db
def test_post_deck_auth():
    request = get_deck_post_request()
    with override_settings(INFOTV_POLICY_CLASS="infotv.policy.BasePolicy"):
        response = InfoTvView.as_view()(request, event="dsfargeg")
        assert response.status_code == 401
