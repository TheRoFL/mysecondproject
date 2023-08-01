from django.db import models

from Cart.models import DishOrder
from Profile.models import ProfileData


class Client(models.Model):
    dishes = models.ManyToManyField(DishOrder, blank=True)
    quantity = models.PositiveIntegerField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return "Меню " + "''" + str(self.type) + "''" + " на " + str(self.quantity) + " человек"

class Banquet(models.Model):
    clients = models.ManyToManyField(Client)
    type = models.CharField(max_length=50)
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)

    is_ordered = models.BooleanField(default=False)

    __quantity = 0
    def quantity_count(self):
        for client in self.clients.all():
            self.__quantity += client.quantity
        
    def __str__(self):
        self.quantity_count()
        return self.type + " на " + str(self.__quantity) + " человек"