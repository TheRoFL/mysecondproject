from django.db import models

from Menu.models import Dish
from Profile.models import ProfileData
from asgiref.sync import sync_to_async

class DishOrder(models.Model):
    product = models.ForeignKey(Dish, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)

    async def save_async(self, *args, **kwargs):
        await sync_to_async(self.save)(*args, **kwargs)


    async def delete_dish_ordered_async(self):
        try:
            await self.delete()
        except self.DoesNotExist:
            raise Exception("DishOrdered not found")
        except Exception as e:
            raise Exception("Error occurred while deleting DishOrdered")



    def __str__(self):
        if self.quantity == 1:
            return f"Заказ {self.product.name} в количестве {self.quantity} единицы"
        else:
            return f"Заказ {self.product.name} в количестве {self.quantity} единиц"
    
    
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