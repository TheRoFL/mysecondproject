import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from Menu.models import *
from Banquet.models import *
from Cart.models import *
from django.core.serializers import serialize
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from .views import *
from Banquet.models import *

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
    sorted_by = request.GET.get('sorted_by')
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
    serialized_data_dict = json.loads(serialized_data)
    
    if sorted_by != "none" and sorted_by != "":
        if (dish_type != "samples"):
            serialized_data_dict = sorted(serialized_data_dict, key=lambda x: (x["fields"][sorted_by]))
            serialized_data = json.dumps(serialized_data_dict)

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

def ChangeBanquetData(request):
    additional_response = {}
    data = request.POST
    data = json.dumps(data)
    data = json.loads(data)
 
    print(data)

    action = data["action"]
    current_user_id = int(data["current_user_id"])
    try:
        current_user = User.objects.get(id=current_user_id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except Exception as e:
        # print(e) 
        pass

    try:
        if action == "added_client":
            clientName = data["clientName"]
            clientCount = data["clientCount"]

            try:
                current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            except Exception as e:
                print(e)       

            if current_banquet:
                pass
            else:
                current_banquet = Banquet.objects.create(type=clientName, owner=current_user_profiledata)

            new_client = Client.objects.create(type=clientName, quantity=clientCount)
            current_banquet.clients.add(new_client)
            response = {    "action":"client_added",
                            "type":new_client.type, 
                            'client_name': new_client.type,
                            "quantity":new_client.quantity, 
                            "client_id": new_client.id
                        }
            
            response = json.dumps(response)
     
            return JsonResponse(response, safe=False)

        elif action == "client_quantity_update":
            quantity = data["quantity"] 
            current_client_id = data["client_id"]

            if quantity != None:
                current_client= Client.objects.get(id=current_client_id)

                current_client.quantity = int(quantity)
                current_client.save()
                current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
                
                response = {"action":"client_quantity_changed",
                            "new_quantity":current_client.quantity, 
                            "client_id": current_client.id,
                            "banquet_id":current_banquet.id,
                            "client_total_price":current_client.menu_and_orders_price_count(),
                            "client_order_price":current_client.price_count(),
                            "total_banquet_price":current_banquet.total_price() 
                            }
                
                response = json.dumps(response)
                return JsonResponse(response, safe=False)
            
        elif action == "client_delete":
            client_id = data["client_id"]
            try:
                current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
                current_client = Client.objects.get(id=client_id)
                current_client_id = current_client.id
                for dish_order in current_client.dishes.all():
                    dish_order.delete()
                current_client.delete()

                response = {
                    "action":"client_deleted",
                    'client_id': current_client_id,
                    'current_banquet_id':current_banquet.id,
                    'total_banquet_price': current_banquet.total_price()
                    }

                response = json.dumps(response)
                return JsonResponse(response, safe=False)
            except:
                response = json.dumps("Error")
                return JsonResponse(response, safe=False)
         
        elif action == "client_menu_delete":
                client_id = data["client_id"]
                menu_id = data["menu_id"]
                current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

                current_client= Client.objects.get(id=client_id)
                current_client_id = current_client.id

                current_client.menu = None
                current_client.save()

                response = {
                    "action":"client_menu_deleted",
                    'client_id': current_client_id,
                    "menu_id":menu_id,
                    'current_banquet_id':current_banquet.id,
                    'order_total_price': current_client.total_client_price(),
                    'client_total_price': current_client.menu_and_orders_price_count(), #считает сумму клиента без меню
                    'total_banquet_price': current_banquet.total_price()
                    }
                response = json.dumps(response)
                return JsonResponse(response, safe=False)

        elif action == "added_dish":
            current_dish_id = data["current_dish_id"]
            current_client_id = data["current_client_id"]
            
            current_dish = get_object_or_404(Dish, id=current_dish_id)
            current_client = get_object_or_404(Client, id=current_client_id)

            is_first = current_client.dishes.all()
            if is_first: is_first = False
            else: is_first = True

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

            current_dish_order_data = {
                    'id': current_dishorder.id,
                    'quantity': current_dishorder.quantity,
                    'price': current_dishorder.price_count()
            }

            current_dish_data = {
                'id': current_dish.id,
                'name': current_dish.name,
                'tittle': current_dish.name,
                'description': current_dish.discription,
                'ingredients': current_dish.ingredients,
                'price': float(current_dish.price),
                'weight': current_dish.weight,
                'image': current_dish.image.url,
                'sostav':current_dish.ingredients,
                'type':current_dish.type,
            }
            current_dish_data = json.dumps(current_dish_data)
            current_dish_order_data = json.dumps(current_dish_order_data)

            response = {'client_id': current_client_id,
                        'current_dish_id': current_dish_id,
                        'current_dish_order_id': current_dishorder.id,
                        'current_dish_data': current_dish_data,
                        'current_dish_order_data': current_dish_order_data,
                        'current_dish_order_name': current_dishorder.product.name,
                        'is_first': is_first,
                        'current_banquet_id': current_banquet.id,
                        'client_dishOrder_quantity': current_dishorder.quantity,
                        'client_dishOrder_price_count':current_dishorder.price_count(),
                        'order_total_price': current_client.total_client_price(),
                        'client_total_price': current_client.menu_and_orders_price_count(), #считает сумму клиента без меню
                        'total_banquet_price': current_banquet.total_price()
                    }
            
            response.update(additional_response)
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "menu_add":
            current_client_id = data["current_client_id"]
            current_menu_id = data["current_menu_id"]

            current_menu = get_object_or_404(MenuSample, id=current_menu_id)
            current_client = get_object_or_404(Client, id=current_client_id)
                
                            
            current_client.menu = current_menu
            current_client.save()

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            current_menu_name = current_menu.name
            current_menu_dishes = []
            for current_dish in current_menu.dishes.all():
                current_dish_data = {
                    'id': current_dish.product.id,
                    'name': current_dish.product.name,
                    'tittle': current_dish.product.name,
                    'description': current_dish.product.discription,
                    'ingredients': current_dish.product.ingredients,
                    'price': float(current_dish.product.price),
                    'weight': current_dish.product.weight,
                    'image': current_dish.product.image.url,
                    'sostav':current_dish.product.ingredients,
                    'type':current_dish.product.type,
                }
                current_dish_data = json.dumps(current_dish_data)
                current_menu_dishes.append(current_dish_data)

            current_menu_dishes = json.dumps(current_menu_dishes)

            response = {
                        'action': "menu_added",
                        'client_id': current_client_id,
                        'current_banquet_id': current_banquet.id,
                        'current_menu_dishes': current_menu_dishes,
                        'current_menu_name': current_menu_name,
                        'current_menu_id': current_menu.id,
                        'menu_total_price_count':current_menu.all_dishes_price(),
                        'order_total_price': current_client.total_client_price(),
                        'client_total_price': current_client.menu_and_orders_price_count(),
                        'total_banquet_price': current_banquet.total_price()
                    }
            
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "menu_add_sep":
            current_client_id = data["current_client_id"]
            current_menu_id = data["current_menu_id"]

            current_menu = get_object_or_404(MenuSample, id=current_menu_id)
            current_client = get_object_or_404(Client, id=current_client_id)

            all_dishorders = []
            for menu_dish in current_menu.dishes.all():
                current_dish_order = DishOrder.objects.create(product=menu_dish.product,
                                                                    quantity=1,
                                                                    is_for_banquet=True, 
                                                                    owner=current_user_profiledata)
                    
                all_dishorders.append(current_dish_order)


            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

            final_response = []
            if all_dishorders:
                for dishorder in all_dishorders:
                    current_dishorder = None
                    current_dish = get_object_or_404(Dish, id=dishorder.product.id)
                    for current_client_dish_order in current_client.dishes.all():      
                        if current_client_dish_order.product.id == current_dish.id:
                            current_dishorder = current_client_dish_order
                            

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

                    is_first = current_client.dishes.all()
                    if is_first: is_first = False
                    else: is_first = True
                    current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
                    current_client.dishes.add(current_dishorder)
                    current_client.save()
                    current_client_id = current_client.id
                    current_dish_id = current_dish.id
                    
                    current_dish_order_data = {
                        'id': current_dishorder.id,
                        'quantity': current_dishorder.quantity,
                        'price': current_dishorder.price_count()
                    }

                    current_dish_data = {
                        'id': current_dish.id,
                        'name': current_dish.name,
                        'tittle': current_dish.name,
                        'description': current_dish.discription,
                        'ingredients': current_dish.ingredients,
                        'price': float(current_dish.price),
                        'weight': current_dish.weight,
                        'image': current_dish.image.url,
                        'sostav':current_dish.ingredients,
                        'type':current_dish.type,
                    }
                    current_dish_data = json.dumps(current_dish_data)
                    current_dish_order_data = json.dumps(current_dish_order_data)

                    response = {
                                'client_id': current_client_id,
                                'current_dish_id': current_dish_id,
                                'current_dish_order_id': current_dishorder.id,
                                'current_dish_data': current_dish_data,
                                'current_dish_order_data': current_dish_order_data,
                                'current_dish_order_name': current_dishorder.product.name,
                                'is_first': is_first,
                                'current_banquet_id': current_banquet.id,
                                'client_dishOrder_quantity': current_dishorder.quantity,
                                'client_dishOrder_price_count':current_dishorder.price_count(),
                                }

                    response.update(additional_response)
                    response = json.dumps(response)
                    final_response.append(response)
                    # return JsonResponse(response, safe=False)
            
            for dish_to_del in all_dishorders:
                dish_to_del.delete()
                
            response = {
                'action': 'menu_sep_added',
                'all_dishes':final_response,
                'current_banquet_id':current_banquet.id,
                'client_id':current_client.id,
                'order_total_price': current_client.total_client_price(),
                'client_total_price': current_client.menu_and_orders_price_count(),
                'total_banquet_price': current_banquet.total_price()
            }
            response = json.dumps(response)
            return JsonResponse(response, safe=False)
        
        elif action == "dish_order_delete":
            current_order_id = data["order_id"]
            current_order = get_object_or_404(DishOrder, id=current_order_id)
            my_current_client_id = data["client_id"]
            new_current_client = get_object_or_404(Client, id=my_current_client_id)
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            current_order.delete()

            orders_left = new_current_client.dishes.all()
            if not orders_left:
                orders_left = json.dumps(False)
            else: orders_left = json.dumps(True)

            response = {"action":"order_deleted", 
                        "order_id": current_order_id,
                        'orders_left':orders_left,
                        'order_total_price': new_current_client.total_client_price(),
                        'client_total_price': new_current_client.menu_and_orders_price_count(),
                        'client_id':my_current_client_id,
                        'current_banquet_id':current_banquet.id,
                        'total_banquet_price':current_banquet.total_price()
                        }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "dish_order_delete_new":
            current_dish_id = data["order_id"]
            current_dish = Dish.objects.get(id=current_dish_id)
            all_dishorders = DishOrder.objects.filter(product=current_dish)
            my_current_client_id = data["client_id"]
            new_current_client = get_object_or_404(Client, id=my_current_client_id)

            current_order_id = None
            for dishorder in all_dishorders:
                if dishorder in new_current_client.dishes.all():
                    current_order_id = dishorder.id
                    dishorder.delete()

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            


            response = {"action":"order_deleted", 
                        "order_id": current_order_id,
                        'order_total_price': new_current_client.total_client_price(),
                        'client_total_price': new_current_client.menu_and_orders_price_count(),
                        'client_id':my_current_client_id,
                        'current_banquet_id':current_banquet.id,
                        'total_banquet_price':current_banquet.total_price()
                        }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "client_name_update":
            type = data["name"] 
            current_user_id = data["current_user_id"]
            current_client_id = data["client_id"]

            try:
                current_user = User.objects.get(id=current_user_id)
                current_user_profiledata = ProfileData.objects.get(user=current_user)
            except ProfileData.DoesNotExist:
                pass
            
            current_client= Client.objects.get(id=current_client_id)

            current_client.type = type
            current_client.save()

            response = {"action":"client_name_changed",
                        "new_name":current_client.type, 
                        "client_id": current_client.id,
                    }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "additional_order_increase":
            current_dish_order_id = data["order_id"]       
            current_client_id = data["current_client_id"]      
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            current_client = get_object_or_404(Client, id=current_client_id)
            current_dish_order.quantity += 1
            current_dish_order.save()

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            response = {"action":"additional_order_increased",
                        "client_id": current_client.id,
                        'current_dish_order_id':current_dish_order.id,
                        'new_quantity':current_dish_order.quantity,
                        'current_banquet_id':current_banquet.id,
                        'current_dish_order_price_count':current_dish_order.price_count(),
                        'order_total_price': current_client.total_client_price(),
                        'client_total_price': current_client.menu_and_orders_price_count(), #считает сумму клиента без меню
                        'total_banquet_price': current_banquet.total_price()
                    }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "additional_order_decrease":
            current_dish_order_id = data["order_id"]  
            current_client_id = data["current_client_id"]      
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            current_client = get_object_or_404(Client, id=current_client_id)
            current_dish_order.quantity -= 1
            current_dish_order.save()


            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

            if current_dish_order.quantity > 0:
                response = {"action":"additional_order_increased",
                            "client_id": current_client.id,
                            'current_dish_order_id':current_dish_order.id,
                            'new_quantity':current_dish_order.quantity,
                            'current_banquet_id':current_banquet.id,
                            'current_dish_order_price_count':current_dish_order.price_count(),
                            'order_total_price': current_client.total_client_price(),
                            'client_total_price': current_client.menu_and_orders_price_count(), #считает сумму клиента без меню
                            'total_banquet_price': current_banquet.total_price()
                    }
                
                response = json.dumps(response)
                return JsonResponse(response, safe=False)
            else:


                response = {"action":"order_deleted", 
                            "order_id": current_dish_order.id,
                            'dish_id':current_dish_order.product.id,
                            'dish_name':current_dish_order.product.name,
                            'order_total_price': current_client.total_client_price(),
                            'client_total_price': current_client.menu_and_orders_price_count(),
                            'client_id':current_client.id,
                            'current_banquet_id':current_banquet.id,
                            'total_banquet_price':current_banquet.total_price()
                            }
                current_dish_order.delete()
                orders_left = current_client.dishes.all()
                if not orders_left:
                    orders_left = json.dumps(False)
                else: orders_left = json.dumps(True)
                response["orders_left"] = orders_left
                response = json.dumps(response)
                return JsonResponse(response, safe=False)

        elif action == "client_additional_clear":
            current_client_id = data["client_id"]      
            current_client = get_object_or_404(Client, id=current_client_id)

            for dish in current_client.dishes.all():
                dish.delete()

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            response = {
                            "action":"client_additional_cleared", 
                            'client_id':current_client.id,
                            'current_banquet_id':current_banquet.id,
                            'order_total_price': current_client.total_client_price(),
                            'client_total_price': current_client.menu_and_orders_price_count(),
                            'total_banquet_price':current_banquet.total_price()
                        }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "added_dish_additional":
            current_dish_id = data["current_dish_id"]
            
            current_dish = get_object_or_404(Dish, id=current_dish_id)
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

            current_dishorder = None
            for current_additional_dish_order in current_banquet.additional.all():
                if current_additional_dish_order.product.id == current_dish.id:
                    current_dishorder = current_additional_dish_order
                    break

            is_first = current_banquet.additional.all()
            if is_first: is_first = False
            else: is_first = True
            try:
                if not current_dishorder:
                    current_dishorder = DishOrder.objects.create(
                    product=current_dish,
                    quantity=1,
                    owner=current_user_profiledata
                    )
                    current_banquet.additional.add(current_dishorder)
                    current_banquet.save()
                    additional_response['action'] = "new_additional_dish_added"
                else:
                    current_dishorder.quantity += 1
                    current_dishorder.save()
                    additional_response['action'] = "additional_dish_added"
            except Exception as e:
                print(e)

            current_dish_order_data = {
                        'id': current_dishorder.id,
                        'quantity': current_dishorder.quantity,
                        'price': current_dishorder.price_count()
                    }

            current_dish_data = {
                'id': current_dish.id,
                'name': current_dish.name,
                'tittle': current_dish.name,
                'description': current_dish.discription,
                'ingredients': current_dish.ingredients,
                'price': float(current_dish.price),
                'weight': current_dish.weight,
                'image': current_dish.image.url,
                'sostav':current_dish.ingredients,
                'type':current_dish.type,
            }
            current_dish_data = json.dumps(current_dish_data)
            current_dish_order_data = json.dumps(current_dish_order_data)


            response = {
                        'current_dish_id': current_dish_id,
                        'is_first': is_first,
                        'current_dish_order_id': current_dishorder.id,
                        'current_dish_data': current_dish_data,
                        'current_dish_order_data': current_dish_order_data,
                        'current_dish_order_name': current_dishorder.product.name,
                        'additional_price':current_banquet.total_price_additional(),
                        'current_banquet_id': current_banquet.id,
                        'client_dishOrder_quantity': current_dishorder.quantity,
                        'client_dishOrder_price_count':current_dishorder.price_count(),
                        'total_banquet_price': current_banquet.total_price()
                    }
            
            response.update(additional_response)
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "banquet_additional_clear":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            for dish in current_banquet.additional.all():
                dish.delete()

            
            response = {
                            "action":"banquet_additional_cleared", 
                            'current_banquet_id':current_banquet.id,
                            'additinal_price':current_banquet.total_price_additional(),
                            'total_banquet_price': current_banquet.total_price()
                        }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "additional_order_increase_additional":
            current_dish_order_id = data["order_id"]         
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            current_dish_order.quantity += 1
            current_dish_order.save()

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            response = {
                            "action":"additional_order_increased_additional",
                            'current_dish_order_id':current_dish_order.id,
                            'new_quantity':current_dish_order.quantity,
                            'additinal_price':current_banquet.total_price_additional(),
                            'current_banquet_id':current_banquet.id,
                            'current_dish_order_price_count':current_dish_order.price_count(),
                            'total_banquet_price': current_banquet.total_price()
                        }
            
            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "additional_order_decrease_additional":
            current_dish_order_id = data["order_id"]    
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            current_dish_order.quantity -= 1
            current_dish_order.save()


            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)

            if current_dish_order.quantity > 0:
                response = {"action":"additional_order_decreased_additional",
                            'current_dish_order_id':current_dish_order.id,
                            'new_quantity':current_dish_order.quantity,
                            'additinal_price':current_banquet.total_price_additional(),
                            'current_banquet_id':current_banquet.id,
                            'current_dish_order_price_count':current_dish_order.price_count(),
                            'total_banquet_price': current_banquet.total_price()
                    }
                
                response = json.dumps(response)
                return JsonResponse(response, safe=False)
            else:
                response = {"action":"order_deleted", 
                            "order_id": current_dish_order.id,
                            'dish_id':current_dish_order.product.id,
                            'dish_name':current_dish_order.product.name,
                            'additinal_price':current_banquet.total_price_additional(),
                            'current_banquet_id':current_banquet.id,
                            'total_banquet_price':current_banquet.total_price()
                            }
                current_dish_order.delete()

                orders_left = current_banquet.additional.all()
                if not orders_left:
                    orders_left = json.dumps(False)
                else: orders_left = json.dumps(True)
                response["orders_left"] = orders_left

                response = json.dumps(response)
                return JsonResponse(response, safe=False)

        elif action == "additional_order_quantity_change":
            current_dish_order_id = data["order_id"]         
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            new_quantity = data["new_quantity"]  
            if new_quantity != 0:
                current_dish_order.quantity = int(data["new_quantity"])
                current_dish_order.save()


                response = {
                                "action":"additional_order_increased_additional",
                                'current_dish_order_id':current_dish_order.id,
                                'new_quantity':current_dish_order.quantity,
                                'current_banquet_id':current_banquet.id,
                                'additinal_price':current_banquet.total_price_additional(),
                                'current_dish_order_price_count':current_dish_order.price_count(),
                                'total_banquet_price': current_banquet.total_price()
                            }
                
                response = json.dumps(response)
                return JsonResponse(response, safe=False)

            elif new_quantity == 0:
                response = {"action":"order_deleted", 
                            'dish_id':current_dish_order.product.id,
                            "order_id": current_dish_order.id,
                            'current_banquet_id':current_banquet.id,
                            'additinal_price':current_banquet.total_price_additional(),
                            'total_banquet_price':current_banquet.total_price()
                            }

                current_dish_order.delete()
                is_left = current_banquet.additional.all()
                if is_left: is_left = "true"
                else: is_left = "false"
                response["orders_left"] = is_left
                response["current_banquet_additional_price"] = current_banquet.total_price_additional(),
                response['total_banquet_price'] = current_banquet.total_price()

                response = json.dumps(response)
                return JsonResponse(response, safe=False)
            
        elif action == "additional_order_delete":
            current_dish_order_id = data["order_id"]         
            current_dish_order = get_object_or_404(DishOrder, id=current_dish_order_id)
            

            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            
            response = {
                            "action":"additional_order_deleted",
                            'current_dish_order_id':current_dish_order.id,
                            'new_quantity':current_dish_order.quantity,
                            'current_banquet_id':current_banquet.id,
                        }
            current_dish_order.delete()
            is_left = current_banquet.additional.all()
            if is_left: is_left = True
            else: is_left = False
            response["is_left"] = is_left
            response["current_banquet_additional_price"] = current_banquet.total_price_additional(),
            response['total_banquet_price'] = current_banquet.total_price()

            response = json.dumps(response)
            return JsonResponse(response, safe=False)

        elif action == "order_surname_update":
                current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
                current_user_profiledata.surname = data["surname"]
                current_user_profiledata.save()

                response = json.dumps("ok")
                return JsonResponse(response, safe=False)

        elif action == "order_surname_update":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_user_profiledata.surname = data["surname"]
            current_user_profiledata.save()

            response = json.dumps("ok")
            return JsonResponse(response, safe=False)

        elif action == "order_name_update":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_user_profiledata.name = data["name"]
            current_user_profiledata.save()

            response = json.dumps("ok")
            return JsonResponse(response, safe=False)

        elif action == "order_patronymic_update":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_user_profiledata.patronymic = data["patronymic"]
            current_user_profiledata.save()

            response = json.dumps("ok")
            return JsonResponse(response, safe=False)

        elif action == "order_phone_update":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_user_profiledata.number = data["phone"]
            current_user_profiledata.save()   

            response = json.dumps("ok")
            return JsonResponse(response, safe=False)

        elif action == "order_email_update":
            current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
            current_user_profiledata.email = data["email"]
            current_user_profiledata.save() 

            response = json.dumps("ok")
            return JsonResponse(response, safe=False)  
    
    except:
        response = json.dumps("Error")
        JsonResponse(response, safe=False)
