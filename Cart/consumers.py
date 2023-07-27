import json
from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db.models import Q
from .views import *
from .models import *
import uuid


class CartSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Генерируем уникальный идентификатор клиента
        self.client_id = str(uuid.uuid4())
        # Подписываем клиента на его уникальный канал
        await self.channel_layer.group_add(self.client_id, self.channel_name)

    async def disconnect(self, close_code):
        # Отписываем клиента от его уникального канала при отключении
        await self.channel_layer.group_discard(self.client_id, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        response = data["message"]

        dish_id = data["id"]
        try:
            dish_ordered = await sync_to_async(get_object_or_404)(Dish, id=dish_id)
        except Dish.DoesNotExist:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Dish not found'}))
        
        current_user_id = data["current_user_id"]
        try:
            current_user_profiledata = await sync_to_async(get_object_or_404)(ProfileData, user_id=current_user_id)
        except ProfileData.DoesNotExist:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'ProfileData not found'}))

        try:
            dish_order_exists = await DishOrder.objects.filter(Q(product=dish_ordered) & Q(owner=current_user_profiledata)).afirst()

            if not dish_order_exists:
                new_dish_order = await sync_to_async(DishOrder.objects.create)(
                product=dish_ordered,
                quantity=1,
                owner=current_user_profiledata
                )
            else:
                dish_order_exists.quantity += 1
                await dish_order_exists.save_async()
        except Exception as e:
            print(e)


        await self.send_response(response)

    async def send_response(self, response):
        # Отправка ответа пользователю через WebSocket
        await self.send(text_data=json.dumps(response))

class NotificationConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "CartSocket"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        from_contact = data["from"]
        to_contact = data["to"]
        message = data["content"]
        content = {"from_contact": from_contact, "to_contact": to_contact, "message": message}

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": content}
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))
