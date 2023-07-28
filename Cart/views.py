from django.shortcuts import render, redirect
from django.db.models import Q
from Menu.models import *
from .models import *
    
def home(request):
    try:
        current_user_profiledata = ProfileData.objects.get(user=request.user)
    except ProfileData.DoesNotExist:
        pass
    orders = DishOrder.objects.filter(owner=current_user_profiledata)

    if request.method == 'GET':
        total = 0
        for order in orders:
            total += order.product.price * order.quantity
            order.sum = order.product.price * order.quantity

        current_user_id = request.user.id
        contex = {
            "orders":orders,
            "total":total,
            "current_user_id": current_user_id,
        }

    elif request.method == 'POST':
        current_order = None
        try:
            current_order = Order.objects.get(Q(owner=current_user_profiledata) & Q(is_ordered=False))
        except Order.DoesNotExist:
            current_order = None

        if current_order:
            current_order.delete()

        current_order = Order.objects.create(status='Processing', owner=current_user_profiledata)
        for order in orders:
            current_order.dishes.add(order)


        data_to_pass = {"current_order": current_order}
        print(data_to_pass)
        return redirect('order')
    
    return render(request, 'Cart/home.html', contex)                        

def order(request):
        try:
            current_user_profiledata = ProfileData.objects.get(user=request.user)
        except ProfileData.DoesNotExist:
            pass

        current_order = Order.objects.get(Q(owner=current_user_profiledata) & Q(is_ordered=False))
        dish_orders = current_order.dishes.all()
        context = {"current_order": current_order,
                   "dish_orders":dish_orders
        }
        return render(request, 'Cart/order.html', context)