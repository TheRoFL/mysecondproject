from django.shortcuts import render

from Menu.models import *
from .models import *
    
def home(request):

    try:
        current_user_profiledata = ProfileData.objects.get(user=request.user)
    except ProfileData.DoesNotExist:
        pass
    orders = DishOrder.objects.filter(owner=current_user_profiledata)

    contex = {
        "orders":orders
    }

    return render(request, 'Cart/home.html', contex)