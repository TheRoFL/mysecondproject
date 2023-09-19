from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .forms import LoginForm
from django.shortcuts import render
from django.http import JsonResponse

def home(request):
    if not request.session or not request.session.session_key:
        request.session.save()

    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        print(request.GET)
        email_to_check = request.GET.get("email")
        email_to_check = User.objects.filter(email=email_to_check)

        if email_to_check:
            response = {"response": "email_exists"}
        else: response = None
        return JsonResponse(response, safe=False)
    else:
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
                request = str(request)
                redirect_to = request[33:len(request) - 3]
                if (redirect_to):
                    return redirect(redirect_to)
                else:
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
            return redirect("/")
    
            
    else:
        return render(request,'main/register.html')
