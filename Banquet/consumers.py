import json
from django.shortcuts import get_object_or_404
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User
from django.db.models import Q
from .views import *
from .models import *
import uuid

class BanquetConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        # Генерируем уникальный идентификатор клиента
        self.client_id = str(uuid.uuid4())
        # Подписываем клиента на его уникальный канал
        self.channel_layer.group_add(self.client_id, self.channel_name)

    def disconnect(self, close_code):
        # Отписываем клиента от его уникального канала при отключении
        self.channel_layer.group_discard(self.client_id, self.channel_name)

    # Receive message from WebSocket
    def receive(self, text_data):
        additional_response = {}
        data = json.loads(text_data)
        print(data)
        action = data["action"]
        current_user_id = data["current_user_id"]
        try:
            current_user = User.objects.get(id=current_user_id)
            current_user_profiledata = ProfileData.objects.get(user=current_user)
        except ProfileData.DoesNotExist:
            pass

        if action == "added_client":
            clientName = data["clientName"] 
            clientCount = data["clientCount"] 

            try:
                current_user = User.objects.get(id=current_user_id)
                current_user_profiledata = ProfileData.objects.get(user=current_user)
            except ProfileData.DoesNotExist:
                pass
            
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

            if current_banquet:
                pass
            else:
                current_banquet = Banquet.objects.create(type=clientName, owner=current_user_profiledata)

            new_client = Client.objects.create(type=clientName, quantity=clientCount)
            current_banquet.clients.add(new_client)
            response = {"action":"client_added", "type":new_client.type, "quantity":new_client.quantity, "client_id": new_client.id}
            self.send_response(response)

        elif action == "client_quantity_update":
            quantity = data["quantity"] 
            current_client_id = data["client_id"]

            try:
                current_user = User.objects.get(id=current_user_id)
                current_user_profiledata = ProfileData.objects.get(user=current_user)
            except ProfileData.DoesNotExist:
                pass
            
            current_client= Client.objects.get(id=current_client_id)

            current_client.quantity = quantity
            current_client.save()
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            response = {"action":"client_quantity_changed",
                        "new_quantity":current_client.quantity, 
                        "client_id": current_client.id,
                        "banquet_id":current_banquet.id,
                        "client_total_price":current_client.total_price_count(),
                        "client_order_price":current_client.price_count(),
                        "total_banquet_price":current_banquet.total_price() 
                        }
            
            self.send_response(response)
            
        elif action == "client_delete":
            client_id = data["client_id"]

            try:
                current_user = User.objects.get(id=current_user_id)
                current_user_profiledata = ProfileData.objects.get(user=current_user)
            except ProfileData.DoesNotExist:
                pass
            
            current_client= Client.objects.get(id=client_id)
            current_client_id = current_client.id
            current_client.delete()
            response = {"action":"client_deleted", "client_id": current_client_id}
            self.send_response(response)
  
        elif action == "added_dish":
            current_dish_id = data["current_dish_id"]
            current_client_id = data["current_client_id"]
            
            current_dish = get_object_or_404(Dish, id=current_dish_id)
            current_client = get_object_or_404(Client, id=current_client_id)

            current_dishorder = None
            for current_client_dish_order in current_client.dishes.all():
                if current_client_dish_order.product.id == current_dish.id:
                    current_dishorder = current_client_dish_order
                    break

            try:
                if not current_dishorder:
                    current_dishorder = DishOrder.objects.create(
                    product=current_dish,
                    quantity=1,
                    owner=current_user_profiledata
                    )
                    additional_response['action'] = "new_dish_added"
                else:
                    current_dishorder.quantity += 1
                    current_dishorder.save()
                    additional_response['action'] = "dish_added"
            except Exception as e:
                print(e)

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_client.dishes.add(current_dishorder)
            current_client.save()

            response = {'client_id': current_client_id,
                        'current_dish_id': current_dish_id,
                        'current_dish_order_id': current_dishorder.id,
                        'current_dish_order_name': current_dishorder.product.name,
                        'current_banquet_id': current_banquet.id,
                        'client_dishOrder_quantity': current_dishorder.quantity,
                        'client_dishOrder_price_count':current_dishorder.price_count(),
                        'order_total_price': current_client.price_count(),
                        'client_total_price': current_client.total_price_count(),
                        'total_banquet_price': current_banquet.total_price()}
            
            response.update(additional_response)
            
            self.send_response(response)

        elif action == "dish_order_delete":
            print(data)
            current_order_id = data["order_id"]
            current_order = get_object_or_404(DishOrder, id=current_order_id)
            my_current_client_id = data["clientId"]
            new_current_client = get_object_or_404(Client, id=my_current_client_id)
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            current_order.delete()

            response = {"action":"order_deleted", 
                        "order_id": current_order_id,
                        'order_total_price': new_current_client.price_count(),
                        'client_total_price': new_current_client.total_price_count(),
                        'clientId':my_current_client_id,
                        'banqet_id':current_banquet.id,
                        'total_banquet_price':current_banquet.total_price()
                        }
            
            self.send_response(response)

    def send_response(self, response):
        # Отправка ответа пользователю через WebSocket
        self.send(text_data=json.dumps(response))