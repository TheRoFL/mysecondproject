from django.shortcuts import render, redirect
from .models import Dish

def home(request, dish_type=None):
    if dish_type == None:
        try:
            current_dishes = Dish.objects.all()
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/')
        
        contex = {"current_dishes":current_dishes}
        return render(request, 'Menu/home.html', contex)
    else:
        try:
            current_dishes = Dish.objects.filter(type=dish_type)
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/menu')
    
        contex = {
            "dish_type": dish_type,
            "current_dishes": current_dishes,
        }
        return render(request, 'Menu/home.html', contex)
    
def details(request, dish_name=None):
    current_dish = Dish.objects.get(name=dish_name)
    current_dish.tittle = current_dish.name
    current_dish.name = current_dish.name.replace(" ", "_")
    contex = {"current_dish": current_dish}
    return render(request, 'Menu/details.html', contex)