from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from decimal import Decimal

from Menu.models import *
from .models import *

@login_required(login_url='/login/')
def home(request):
    try:
        current_user_profiledata = ProfileData.objects.get(user=request.user)
    except ProfileData.DoesNotExist:
        pass
    dish_orders = DishOrder.objects.filter(owner=current_user_profiledata, is_for_banquet=False)

    if request.method == 'GET':
        total = 0
        for order in dish_orders:
            total += order.product.price * order.quantity
            order.sum = order.product.price * order.quantity

        current_user_id = request.user.id
        contex = {
            "orders":dish_orders,
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
        for dish_order in dish_orders:
            current_order.dishes.add(dish_order)

        return redirect('ordering')
    
    return render(request, 'Cart/home.html', contex)    
                    
@login_required(login_url='/login/')
def order(request):
    try:
        current_user_profiledata = ProfileData.objects.get(user=request.user)
    except ProfileData.DoesNotExist:
        pass

    try:
        current_order = Order.objects.get(Q(owner=current_user_profiledata) & Q(is_ordered=False))
        dish_orders = current_order.dishes.all()
        context = {"current_order": current_order,
                "dish_orders":dish_orders
            }
    except Order.DoesNotExist:
        current_order = None
        dish_orders = None
        context = {"current_order": None,
                "dish_orders":None
            } 
    

    if request.method == 'POST':
        delivery_time = request.POST.get("delivery_time")
        delivery_address = request.POST.get("delivery_address")
        delivery_date = request.POST.get("delivery_date")
        order_comments = request.POST.get("order_comments")

        current_order.delivery_time = str(delivery_date + " " + delivery_time)
        current_order.address = str(delivery_address)
        current_order.wishes = str(order_comments)
        current_order.order_date = current_order.order_date  + timedelta(hours=5)

        for dish_order in current_order.dishes.all():
            current_order.cost = dish_order.product.price * dish_order.quantity
            
        current_order.bonuses = current_order.cost * Decimal('0.05')
        current_order.is_ordered = True
        current_order.status = "Processing"
        current_order.save()

        context = {"current_order": current_order,
                "dish_orders":dish_orders, 
                "ordered": True
            }
        return render(request, 'Cart/ordering.html', context)


    return render(request, 'Cart/ordering.html', context)