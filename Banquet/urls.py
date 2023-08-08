from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('ordering/', views.ordering),
    path('<str:dish_type>/', views.home),
]