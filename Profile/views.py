from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import ProfileData
from .forms import ProfileForm
from Cart.models import *

@login_required(login_url='/login/')
def home(request, user_name):
    try:
        try:
            currentuser = User.objects.get(username=user_name)
        except User.DoesNotExist:
            currentuser = None  
        currentprofile = ProfileData.objects.get(user=currentuser)
    except ProfileData.DoesNotExist:
        currentprofile = None
        return redirect("profile_creation/")

    context = {
            'currentprofile': currentprofile,
        }

    return render(request, 'Profile/home.html', context)

def profile_creation(request):
    Profile_form = ProfileForm()
    currentuserid = request.user.id
    if request.method == 'GET':
        contex = {'Profile_form': Profile_form}
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES)
          
        if form.is_valid():
            profile = form.save(commit=False)
            profile.user_id = currentuserid
            profile.save()
            return redirect("/profile")
        else: return HttpResponse("Форма не валидна1")

    return render(request, 'Profile/profile_creation.html', contex)

@login_required(login_url='/login/')
def orders(request, user_name):
    currentprofile = ProfileData.objects.get(user=request.user)
    all_orders = Order.objects.filter(owner=currentprofile, is_ordered=True)
    context = {
            'all_orders': all_orders,
        }

    return render(request, 'Profile/orders.html', context)