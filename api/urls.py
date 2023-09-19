from django.urls import path
from . import views

urlpatterns = [
    path('ChangeChosenStatus/', views.ChangeChosenStatus),
    path('ChangeChosenStatusAdditional/', views.ChangeChosenStatusAdditional),
    path('LoadMenu/', views.LoadMenu),
    path('QauntityStatusMod/', views.QauntityStatusMod),
    path('ChangeBanquetData/', views.ChangeBanquetData),
]