from django.shortcuts import render

def home(request, dish_name=None):
    if dish_name == None:
        contex = {}
        return render(request, 'Menu/home.html', contex)
    else:
         contex = {"dish_name": dish_name}
         return render(request, 'Menu/home.html', contex)