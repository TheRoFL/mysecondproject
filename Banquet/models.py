from django.db import models

from Cart.models import DishOrder
from Profile.models import ProfileData


class Client(models.Model):
    dishes = models.ManyToManyField(DishOrder, blank=True)
    quantity = models.PositiveIntegerField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return "Меню " + "''" + str(self.type) + "''" + " на " + str(self.quantity) + " человек"
    
    total = 0
    def price_count(self):
        for dish in self.dishes.all():
            self.total += int(dish.price_count())
        return self.total
    
    def total_price_count(self):
        self.total = 0
        self.price_count()
        return self.total * self.quantity
    

class Banquet(models.Model):
    clients = models.ManyToManyField(Client)
    type = models.CharField(max_length=50)
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)

    is_ordered = models.BooleanField(default=False)

    quantity = 0
    def quantity_count(self):
        self.quantity = 0
        for client in self.clients.all():
            self.quantity += client.quantity
        return self.quantity
        
    def __str__(self):
        self.quantity_count()
        return self.type + " на " + str(self.quantity) + " человек"
    
    total = 0
    def total_price(self):
        for client in self.clients.all():
            self.total += client.total_price_count()
        return self.total 
    
class ClientSample(models.Model):
    dishes = models.ManyToManyField(DishOrder)
    quantity = models.PositiveIntegerField()
    type = models.CharField(max_length=50)

    description = models.TextField()
    rating = models.PositiveIntegerField()

    def __str__(self):
        return "Меню " + "''" + str(self.type) + "''" 
    
    total = 0
    def price_count(self):
        for dish in self.dishes.all():
            self.total += int(dish.price_count())
        return self.total
    
    def total_price_count(self):
        self.total = 0
        self.price_count()
        return self.total * self.quantity
    