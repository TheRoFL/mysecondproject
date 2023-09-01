from django.urls import path
from . import views

urlpatterns = [
    path('ChangeChosenStatus/', views.ChangeChosenStatus),
    path('LoadMenu/', views.LoadMenu),
]