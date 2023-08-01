from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q


from Menu.models import *
from .models import *

def home(request):
    try:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        pass
    
    try:
        banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    except Banquet.DoesNotExist:
         banquet = Banquet.objects.create(owner=current_user_profiledata, is_ordered=False)

    contex = {"banquet":banquet}
    return render(request, 'Banquet/home.html', contex)    