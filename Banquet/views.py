from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.serializers import serialize
from django.core.mail import send_mail
import json
from datetime import timedelta
from decimal import Decimal
from Menu.models import *
from .models import *

@login_required(login_url='/login/')
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
        return redirect("/profile")
    
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
        for menu_sample in MenuSample.objects.all():
            for dish_order in menu_sample.dishes.all():
                serialized_product = serialize('json', [dish_order.product])
                menu_dishes.append(json.loads(serialized_product)[0])


        serialized_menu_dishes = json.dumps(menu_dishes)
        
           
    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        serialized_data = serialize('json', current_dishes)

        if serialized_menu_dishes:
            combined_data = {
                    "current_menu": json.loads(serialized_data),
                    "current_menu_dishes": json.loads(serialized_menu_dishes)
                }
            serialized_combined_data = json.dumps(combined_data)
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

    current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        hours_quantity = request.GET.get("hours")
        if hours_quantity:
            total = current_banquet.total_price() + current_banquet.calculate_waiters() * int(hours_quantity) * 400
            response = {"total": total}
        else: response = None
        response = json.dumps(response)
        return JsonResponse(response, safe=False)
    
    if request.method == "POST":
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)

        current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
        delivery_addres = request.POST.get("delivery_addres")
        delivery_time = request.POST.get("delivery_time")  # Получение данных из формы
        date = request.POST.get("delivery_date")  # Получение даты заказа
        comment = request.POST.get("order_comments")  
        duration = request.POST.get("duration_time")  
        hours_quantity = request.POST.get("duration_time")  

        current_banquet.addres = delivery_addres
        current_banquet.delivery_time = delivery_time
        current_banquet.comment = comment
        current_banquet.duration = timedelta(hours=int(duration))
        current_banquet.date = date
        current_banquet.ordered_date = date
        cost = current_banquet.total_price() + current_banquet.calculate_waiters()  * int(hours_quantity) * 400
        current_banquet.cost = Decimal(cost)
        current_banquet.bonuses = cost * 0.01
        current_banquet.is_ordered = True
        current_banquet.save()
        current_user_profiledata.bonuses += current_banquet.bonuses  
        current_user_profiledata.save()

        subject = 'Вам заказали банкет'
        message = f'{request.user.email} заказал банкет'
        from_email = 'theroflx@yandex.ru'
        recipient_list = ['theroflx@yandex.ru']
        send_mail(subject, message, from_email, recipient_list)

        subject = 'Банкет'
        message = 'Вы заказали банкет'
        from_email = request.user.email
        recipient_list = [request.user.email]
        send_mail(subject, message, from_email, recipient_list)

        return render(request, 'Banquet/ordering.html')       
    

    occupied_dates = []
    current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    workers = int(current_banquet.quantity_count() / 20)
    if workers == 0:
        current_banquet.workers = 1
    else: current_banquet.workers = workers

    all_banquets = Banquet.objects.filter(is_ordered=True)
    for banquet in all_banquets:
        occupied_dates.append(banquet.ordered_date.strftime('%Y-%m-%d'))


    for client in current_banquet.clients.all():
        if client.menu is None and client.dishes.all().count() == 0:
              current_banquet.clients.remove(client)

    total = current_banquet.total_price()  + current_banquet.calculate_waiters() * 3 * 400
    contex = {
        'current_banquet':current_banquet,
        'occupied_dates':occupied_dates,
        'total':total
        }
    

    return render(request, 'Banquet/ordering.html', contex)       


def forJsonResopnses(request):
    dish_ids = request.GET.getlist('dish_ids[]', []) 
    dish_ids = map(int, dish_ids)
    dish_ids = list(dish_ids)   
    client_id = request.GET.get("client_id")

    response = []
    try:
        current_client = Client.objects.get(id=client_id)
        all_client_dishes = current_client.dishes.all()
        for client_dish in all_client_dishes:
            if client_dish.product.id in dish_ids:
                response.append(client_dish.product.id)
    except:
        pass
    

    if response:
        response = json.dumps(response)
    else:
        response = {'if_dish':False}
        response = json.dumps(response)
    
    return JsonResponse(response, safe=False)

    
    
