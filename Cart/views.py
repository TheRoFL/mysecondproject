from django.shortcuts import render

from Menu.models import *
from .models import *
    
def home(request):

    if request.method == 'POST':
        print(request)

    try:
        current_user_profiledata = ProfileData.objects.get(user=request.user)
    except ProfileData.DoesNotExist:
        pass
    orders = DishOrder.objects.filter(owner=current_user_profiledata)


    total = 0
    for order in orders:
        total += order.product.price * order.quantity
        order.sum = order.product.price * order.quantity

    current_user_id = request.user.id
    print(current_user_id)
    contex = {
        "orders":orders,
        "total":total,
        "current_user_id": current_user_id
    }

    return render(request, 'Cart/home.html', contex)