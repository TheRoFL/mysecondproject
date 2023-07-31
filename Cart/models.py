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
            return f"{self.product.name} в количестве {self.quantity} единицы"
        else:
            return f"{self.product.name} в количестве {self.quantity} единиц"
    
    
class Order(models.Model):
    dishes = models.ManyToManyField(DishOrder)
    STATUS_CHOICES = (('Processing', 'Processing '),('Shipped', 'Shipped '),
                      ('Delivered', 'Delivered  '),('Cancelled', 'Cancelled '),('On Hold', 'On Hold '))
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=None)
    owner = models.ForeignKey(ProfileData, on_delete=models.CASCADE, default=None)
    cost = models.PositiveIntegerField(blank=True, null=True)
    bonuses = models.PositiveIntegerField(blank=True, null=True)
    discount = models.PositiveIntegerField(blank=True, null=True)
    order_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    address = models.CharField(max_length=50, default=None, blank=True, null=True)
    wishes = models.CharField(max_length=150, default=None, blank=True, null=True)
    
    delivery_time = models.DateTimeField(default=None, blank=True, null=True)

    is_ordered = models.BooleanField(blank=True, null=True, default=False)
    def __str__(self):
        str = f"Заказ {self.id} от {self.order_date}"
        
        return str[0:len(str)-22]