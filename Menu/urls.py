from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home),
    path('dishes/<str:dish_name>/', views.details),
    path('<str:dish_type>/', views.home),
]