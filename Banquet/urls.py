from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('<str:dish_type>/', views.home),
]