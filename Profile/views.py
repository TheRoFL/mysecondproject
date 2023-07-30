from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect

from .models import ProfileData
from .forms import ProfileForm

def home(request):
    try:
        try:
            currentuser = User.objects.get(username=request.user)
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