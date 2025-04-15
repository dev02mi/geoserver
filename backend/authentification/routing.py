from django.urls import path,re_path
from . import consumers

websocket_urlpatterns = [
    # path("ws/gis/", consumers.GISConsumer.as_asgi()),
    re_path(r'ws/gis/$', consumers.GISConsumer.as_asgi()),
    
]
