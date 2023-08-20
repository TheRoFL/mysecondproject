from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from .forms import LoginForm, UserRegistrationForm
from django.shortcuts import render
from django.http import JsonResponse
from .forms import UserRegistrationForm, UserRegistrationFormNew
from django.urls import reverse
import json

def home(request):
    return render(request, 'main/home.html')

def login_user(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(request,
            username=cd['username'],
            password=cd['password'])
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect("/")
            else:
                return HttpResponse('Disabled account')
        else:
            return HttpResponse('Invalid login')
    else:
        form = LoginForm()
    return render(request, 'registration/login.html', {'form': form})

def LogoutUser(request):
    logout(request)
    return redirect('homepage')

def register(request):
    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        try:
            if_user = User.objects.get(username=request.GET.get("username"))
            response = {"response": "login_unvailable"}
        except User.DoesNotExist:
            response = {"response":"login_available"}
        return JsonResponse(response, json_dumps_params={'ensure_ascii': False})

    if request.method == 'POST':
        current_login = request.POST.get("login")
        password = request.POST.get("password")
        new_user = User.objects.create(username=current_login, password=password, email=current_login)
        new_user.set_password(password)
        new_user.save()
        user = authenticate(username=current_login, password=password)
        if user is not None:
            login(request, user)
            return redirect("/profile")
    
            
    else:
        return render(request,'main/register.html')
