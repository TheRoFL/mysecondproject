from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('ordering/', views.ordering),
    path('json/', views.forJsonResopnses)
]