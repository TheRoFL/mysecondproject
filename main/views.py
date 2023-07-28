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
from .forms import UserRegistrationForm, UserRegistrationFormNew
from django.urls import reverse
from django_email_verification import send_email

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

def home(request):
    return render(request, 'main/home.html')

def LogoutUser(request):
    logout(request)
    return redirect('homepage')

    if request.method == 'POST':
       form = UserCreationForm(request.POST)
       if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            username = user.username
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Login already exists')
            else:
                user.save()
                login(request, user)
                return redirect('homepage')     

    else:
        form = UserCreationForm()

    contex = {'form' : form}
    return render(request, 'main/login_register.html', contex)

def register(request):
    if request.method == 'POST':
        user_form = UserRegistrationForm(request.POST)
        if user_form.is_valid():
           
            new_user = user_form.save(commit=False)
            new_user.set_password(user_form.cleaned_data['password'])
            if User.objects.filter(username=new_user.username).exists():
                messages.error(request, 'Login already exists')
            new_user.save()
            return render(request,
            'main/register_done.html',
            {'new_user': new_user})
    else:
        user_form = UserRegistrationForm()
    return render(request,'main/register.html',{'user_form': user_form})



# def register_user(request):
#     form = UserRegistrationFormNew()

#     if request.method == 'POST':
#         form = UserRegistrationFormNew(request.POST)

#         if form.is_valid():
#             form.save(commit=False)
#             user_email = form.cleaned_data['email']
#             user_username = form.cleaned_data['username']
#             user_password = form.cleaned_data['password1']

#             # Create new user
#             user = User.objects.create_user(username=user_username, email=user_email, password=user_password)

#             # Make user unactive until they click link to token in email
#             user.is_active = False 
#             send_email(user)
#             print("Mail is sent")

#             return HttpResponseRedirect(reverse('login'))

#     return render(request, 'registration/register.html', {'form':form})

