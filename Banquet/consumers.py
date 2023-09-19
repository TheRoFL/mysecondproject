import json
import time
from django.shortcuts import get_object_or_404
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User
from django.db.models import Q
from .views import *
from .models import *
import uuid
from django.core import serializers
class BanquetConsumer(WebsocketConsumer):
    pass