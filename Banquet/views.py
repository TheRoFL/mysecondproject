from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.decorators import login_required

from Menu.models import *
from .models import *


def home(request, dish_type=None, clientId=None):
    clientId = request.GET.get('editting-clientId')
    if clientId == "null":
        clientId=None
    dish_type = request.GET.get('dish-filter')
    if dish_type == "all":
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



    menu_samples = ClientSample.objects.all()
    contex["menu_samples"] = menu_samples

    return render(request, 'Banquet/home.html', contex)    