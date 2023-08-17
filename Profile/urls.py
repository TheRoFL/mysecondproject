from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home),
    path('profile_creation/', views.profile_creation),
    path('orders/', views.orders, name='orders'),
]