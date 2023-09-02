import json
from django.http import JsonResponse
from Menu.models import *
from Banquet.models import *
from Cart.models import *
from django.core.serializers import serialize
import re

def ChangeChosenStatus(request):
    dish_ids = request.GET.getlist('dish_ids[]', []) 
    dish_ids = map(int, dish_ids)
    dish_ids = list(dish_ids)   
    client_id = request.GET.get("client_id")

    
    filter_ = request.GET.get("action")
    response = []
    dish_ids2 = []
    dish_order_ids = {}
    dish_order_quantities = {}
    if filter_ == "dish":
        try:  
            current_client = Client.objects.get(id=client_id)
            all_client_dishes = current_client.dishes.all()
            for client_dish in all_client_dishes:
                if client_dish.product.id in dish_ids:
                    dish_ids2.append(client_dish.product.id)
                    dish_order_quantities[client_dish.id] = client_dish.quantity
                    dish_order_ids[client_dish.product.id] = client_dish.id
        except:
            pass
    elif filter_ == "menu": 
        try:
            current_client = Client.objects.get(id=client_id)
            for dish_id in dish_ids:
                if current_client.menu.id == dish_id:
                    dish_ids2.append(current_client.menu.id)
        except:
            pass
    
    response.append(dish_ids2)
    response.append(dish_order_ids)
    response.append(dish_order_quantities)
    if response:
        response = json.dumps(response)
    else:
        response = {'if_dish':False}
        response = json.dumps(response)
    
    return JsonResponse(response, safe=False)


def LoadMenu(request):
    dish_type = request.GET.get('dish-filter')
    dish_name = request.GET.get('dish-name')
    if dish_type == "all" or dish_type == "null":
        dish_type = "all"
         
    menu_samples = None
    if dish_type == 'all':
        try:
            if dish_name == "":
                current_dishes = Dish.objects.all()
            else:
                # сделать поиск по тегам
                current_dishes = Dish.objects.filter(name__icontains=dish_name)
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except:
            pass
              
    elif dish_type == 'samples':
        menu_samples = MenuSample.objects.all()

        current_dishes = None
        for menu in menu_samples:
            for current_dish in menu.dishes.all():
                current_dish.product.tittle = current_dish.product.name
                current_dish.product.name = current_dish.product.name.replace(" ", "_")

    else:
        try:
            if dish_name == "":
                current_dishes = Dish.objects.filter(type=dish_type)
            else:
                # сделать поиск по тегам
                current_dishes = Dish.objects.filter(name__icontains=dish_name)
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except:
            pass

    serialized_menu_dishes = None
    menu_dishes = []
    if menu_samples:
        current_dishes = menu_samples
        serialized_data = serialize('json', current_dishes)
        for menu_sample in MenuSample.objects.all():
            for dish_order in menu_sample.dishes.all():
                serialized_product = serialize('json', [dish_order.product])
                menu_dishes.append(json.loads(serialized_product)[0])


        serialized_menu_dishes = json.dumps(menu_dishes)

    serialized_data = serialize('json', current_dishes)

    if serialized_menu_dishes:
        combined_data = {
                "current_menu": json.loads(serialized_data),
                "current_menu_dishes": json.loads(serialized_menu_dishes)
            }
        serialized_combined_data = json.dumps(combined_data)
        return JsonResponse(serialized_combined_data, safe=False)
    else: return JsonResponse(serialized_data, safe=False)
