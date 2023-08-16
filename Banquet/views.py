from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.serializers import serialize
import json
from Menu.models import *
from .models import *


def home(request, dish_type=None, clientId=None):
    clientId = request.GET.get('editting-clientId')
    if clientId == "null":
        clientId=None
    dish_type = request.GET.get('dish-filter')
    if dish_type == "all" or dish_type == "null":
        dish_type = None
    try:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        pass
    
    try:
        banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    except Banquet.DoesNotExist:
        banquet = Banquet.objects.create(owner=current_user_profiledata, is_ordered=False)

    
    if dish_type == None:
        try:
            current_dishes = Dish.objects.all()
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/')
        
        contex = {"current_dishes":current_dishes, "banquet":banquet}
        
    elif dish_type == 'samples':
        menu_samples = MenuSample.objects.all()

        current_dishes = None
        for menu in menu_samples:
            for current_dish in menu.dishes.all():
                current_dish.product.tittle = current_dish.product.name
                current_dish.product.name = current_dish.product.name.replace(" ", "_")

            
        contex = {
            "dish_type": dish_type,
            "current_dishes": menu_samples,
            "banquet":banquet
        }
      
    else:
        try:
            current_dishes = Dish.objects.filter(type=dish_type)
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/banquet')
      
        contex = {
            "dish_type": dish_type,
            "current_dishes": current_dishes,
            "banquet":banquet
        }


    if clientId:
        try:
            current_client = Client.objects.get(id=clientId)
            contex["current_client"] =  current_client
        except Client.DoesNotExist:
            pass
     
    serialized_menu_dishes = None
    menu_dishes = []
    if not current_dishes:
        current_dishes = menu_samples
        serialized_data = serialize('json', current_dishes)
        for menu_sample in menu_samples:
            menu_dishes.append(serialize('json', menu_sample.dishes.all()))

        serialized_menu_dishes = json.dumps(menu_dishes)
        
    # if not current_dishes:
    #     current_dishes = MenuSample.objects.all()
    #     serialized_data = serialize('json', current_dishes)
    #     for menu_sample in MenuSample.objects.all():
    #         dish_queryset = menu_sample.dishes.all()
    #         print(dish_queryset)
    #         product_queryset = dish_queryset.values('product')
    #         print(product_queryset)
    #         serialized_products = serialize('json', product_queryset)

    #         menu_dishes.append(serialized_products)
    #     serialized_menu_dishes = json.dumps(menu_dishes)
        


    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        serialized_data = serialize('json', current_dishes)

        if serialized_menu_dishes:
            combined_data = {
                    "current_menu": json.loads(serialized_data),
                    "current_menu_dishes": json.loads(serialized_menu_dishes)
                }
            serialized_combined_data = json.dumps(combined_data)
            print(serialized_combined_data)
            return JsonResponse(serialized_combined_data, safe=False)
        else: return JsonResponse(serialized_data, safe=False)
    else:
        menu_samples = MenuSample.objects.all()
        contex["menu_samples"] = menu_samples
        return render(request, 'Banquet/home.html', contex)    


def ordering(request):
    try:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        pass


    try:
        current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    except Banquet.DoesNotExist:
         pass
    
    

    param1 = request.GET.get('param1')
    param2 = request.GET.get('param2')
    
    # Ваш код для обработки параметров
    
    # Пример: вернуть данные в формате JSON
    response_data = {
        'message': 'Параметры успешно обработаны.',
        'param1': param1,
        'param2': param2
    }
    
    
    current_banquet = Banquet.objects.filter(owner=current_user_profiledata, is_ordered=False)
    
    contex = {
        'current_banquet':current_banquet
        }
    
    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        serialized_data = serialize('json', current_banquet)
        return JsonResponse(serialized_data, safe=False)
    else:
        return render(request, 'Banquet/ordering.html', contex)       