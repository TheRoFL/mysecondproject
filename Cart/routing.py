from django.urls import re_path

from . import consumers
from Banquet.consumers import BanquetConsumer as myBanquetConsumer

websocket_urlpatterns = [
    re_path(r"ws/CartSocket/$", consumers.CartSocketConsumer.as_asgi()),
    
    re_path(r"ws/notification/$", consumers.NotificationConsumer.as_asgi()),
    re_path(r"ws/CartEditingSocket/$", consumers.CartEditingSocketConsumer.as_asgi()),

    re_path(r"ws/BanquetEditingSocket/$", myBanquetConsumer.as_asgi()),
]