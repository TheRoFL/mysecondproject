from django.db import models

from Cart.models import DishOrder
from Profile.models import ProfileData
from Menu.models import Dish

class ClientSampleDishOrder(models.Model):
    product = models.ForeignKey(Dish, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()


    def __str__(self):
        if self.quantity == 1:
            return f"{self.product.name} в количестве {self.quantity} единицы"
        else:
            return f"{self.product.name} в количестве {self.quantity} единиц"
        

    def print_order(self):
        return f"{self.product.name} x {self.quantity} шт. = {self.quantity * self.product.price} руб."

    def price_count(self):
        return int(self.product.price) * self.quantity
    
class MenuSample(models.Model):
    dishes = models.ManyToManyField(ClientSampleDishOrder)
    quantity = models.PositiveIntegerField()
    type = models.CharField(max_length=50)

    description = models.TextField()
    rating = models.PositiveIntegerField()

    def __str__(self):
        return "Меню " + "''" + str(self.type) + "''" 
    
    total = 0
    #стоимость меню
    def all_dishes_price(self):
        self.total = 0
        for dish in self.dishes.all():
            self.total += int(dish.price_count())
        return self.total
    
    
class Client(models.Model):
    dishes = models.ManyToManyField(DishOrder, blank=True)
    menu = models.ForeignKey(MenuSample, null=True, blank=True, default=None, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return "Меню " + "''" + str(self.type) + "''" + " на " + str(self.quantity) + " человек"
    
    total = 0
    #цена для 1 клиента без меню
    def price_count(self):
        for dish in self.dishes.all():
            self.total += int(dish.price_count())
        return self.total
    
    #цена для всех клиентов без меню
    def total_price_count(self):
        self.total = 0
        self.price_count()
        return self.total * self.quantity
    
    #цена для всех клиентов с меню
    def menu_and_orders_price_count(self):
        menu_price = 0
        if self.menu:
            menu_price = self.menu.all_dishes_price()
        return self.total_price_count() + menu_price * self.quantity
    
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
            self.total += client.menu_and_orders_price_count()
        return self.total 
    