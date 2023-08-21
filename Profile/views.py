from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import json
from .models import ProfileData
from .forms import ProfileForm
from Cart.models import *
from Banquet.models import *

@login_required(login_url='/login/')
def home(request):
    try:
        try:
            currentuser = User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            currentuser = None  
        currentprofile = ProfileData.objects.get(user=currentuser)
    except ProfileData.DoesNotExist:
        currentprofile = None
        return redirect("profile_creation/")

    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        name = request.GET.get("name")
        surname = request.GET.get("surname")
        number = request.GET.get("number")
        patronymic = request.GET.get("patronymic")
        currentprofile.name = name
        currentprofile.surname = surname
        currentprofile.number = number
        currentprofile.patronymic = patronymic
        currentprofile.save()

        response = {"ok":"ok"}
        response = json.dumps(response)
        return JsonResponse(response, safe=False)
    else:
        context = {'currentprofile': currentprofile,}
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
def orders(request):
    currentprofile = ProfileData.objects.get(user=request.user)
    all_orders = Banquet.objects.filter(owner=currentprofile, is_ordered=True)
    context = {
            'all_orders': all_orders,
        }

    return render(request, 'Profile/orders.html', context)