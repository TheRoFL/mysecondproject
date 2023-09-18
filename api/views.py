import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from Menu.models import *
from Banquet.models import *
from Cart.models import *
from django.core.serializers import serialize
from django.db.models import Q

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

def ChangeChosenStatusAdditional(request):
    dish_ids = request.GET.getlist('dish_ids[]', []) 
    dish_ids = map(int, dish_ids)
    dish_ids = list(dish_ids)   
    username_id = request.GET.get("username_id")
    try:
        current_user = User.objects.get(id=username_id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        pass
    

    response = []
    dish_ids2 = []
    dish_order_ids = {}
    dish_order_quantities = {}

    try:  
        current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
        all_client_banquet = current_banquet.additional.all()
        for client_dish in all_client_banquet:
            if client_dish.product.id in dish_ids:
                dish_ids2.append(client_dish.product.id)
                dish_order_quantities[client_dish.id] = client_dish.quantity
                dish_order_ids[client_dish.product.id] = client_dish.id
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
    menu_filter = request.GET.get('menu-filter')
    if dish_type == "all" or dish_type == "null":
        dish_type = "all"
         
    menu_samples = None
    if dish_type == 'all':
        try:
            if dish_name == "":
                current_dishes = Dish.objects.all()
            else:
                # сделать поиск по тегам
                current_dishes = Dish.objects.filter(Q(name__icontains=dish_name) |
                                                     Q(name_tags__icontains=dish_name))
            for current_dish in current_dishes: 
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except:
            pass
              
    elif dish_type == 'samples':
        if menu_filter:
            if dish_name != "":
                 menu_samples = MenuSample.objects.filter(Q(type=menu_filter) &
                                                          Q(name_tags__icontains=dish_name)|
                                                          Q(name__icontains=dish_name) )
            else:
                menu_samples = MenuSample.objects.filter(type=menu_filter)
            current_dishes = None
            if menu_samples == None:
                menu_samples = MenuSample.objects.all()
            for menu in menu_samples:
                for current_dish in menu.dishes.all():
                    current_dish.product.tittle = current_dish.product.name
                    current_dish.product.name = current_dish.product.name.replace(" ", "_")
        else:
            if dish_name != "":
                 menu_samples = MenuSample.objects.filter(Q(name_tags__icontains=dish_name) |
                                                          Q(name__icontains=dish_name))
            else:
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
                current_dishes = Dish.objects.filter((Q(name__icontains=dish_name) |
                                                     Q(name_tags__icontains=dish_name)) &
                                                     Q(type__icontains=dish_type))
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

    if current_dishes == None:
        current_dishes = []
    serialized_data = serialize('json', current_dishes)

    if serialized_menu_dishes:
        combined_data = {
                "current_menu": json.loads(serialized_data),
                "current_menu_dishes": json.loads(serialized_menu_dishes)
            }
        serialized_combined_data = json.dumps(combined_data)
        return JsonResponse(serialized_combined_data, safe=False)
    else: return JsonResponse(serialized_data, safe=False)

def QauntityStatusMod(request):
    dish_id = request.GET.get("dish_id")
    client_id = request.GET.get("client_id")

    current_dish = Dish.objects.get(id=dish_id)
    current_client = Client.objects.get(id=client_id)

    current_quantity = 0
    current_dish_order_id = None
    dish_name = None
    for dish_order in current_client.dishes.all():
        if dish_order.product.id == current_dish.id:
            current_quantity = dish_order.quantity
            current_dish_order_id = dish_order.id
            dish_name = dish_order.product.name
            break

    response = json.dumps({
        "current_quantity": current_quantity,
        "current_dish_order_id": current_dish_order_id,
        "dish_id":dish_id, 
        "dish_name":dish_name
        })

    return JsonResponse(response, safe=False)