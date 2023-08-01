from django.db import models

from Menu.models import Dish
from Cart.models import DishOrder
from Profile.models import ProfileData


class Client(models.Model):
    dishes = models.ManyToManyField(DishOrder)
    type = models.CharField(max_length=50)




# class Banquet(models.Model):
#     clients = models.ManyToManyField(Client)
#     type = models.CharField(max_length=50)

