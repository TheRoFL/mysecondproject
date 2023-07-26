from django.db import models

from Menu.models import Dish
from Profile.models import ProfileData


class DishOrder(models.Model):
    product = models.ForeignKey(Dish, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return f"Заказ {self.product.name} в количестве {self.quantity} штук"
    
class Order(models.Model):
    dishes = models.ManyToManyField(DishOrder)
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)
    cost = models.PositiveIntegerField()
    bonuses = models.PositiveIntegerField()
    discount = models.PositiveIntegerField()
    order_date = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=50, default=None)
    wishes = models.CharField(max_length=150, default=None)
    
    delivery_time = models.DateTimeField(default=None)

    def __str__(self):
        return f"Заказ {self.id} - {self.order_date}"