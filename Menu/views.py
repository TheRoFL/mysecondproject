from django.shortcuts import render

def home(request):
    return render(request, 'Menu/home.html')