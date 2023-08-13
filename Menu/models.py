from django.db import models



def upload_to(self, filename):
        return f"menu_images/{self.type}/{self.create_tittle2()}.png"

    
class Dish(models.Model):  

    name = models.CharField(max_length=20, blank=False, null=False, unique=True) #название блюда
    type = models.CharField(max_length=20, blank=False, null=False) #тип блюда

    brief_discription = models.TextField(blank=True, null=True) #описание блюда
    discription = models.TextField(blank=True, null=True) #описание блюда
    ingredients = models.TextField(blank=True, null=True) #ингредиенты блюда
    price = models.DecimalField(max_digits=10, decimal_places=2) #цена блюда в рублях
    calories = models.PositiveIntegerField(blank=True, null=True) #калорийность блюда
    weight = models.PositiveIntegerField(blank=True, null=True) #масса блюда в граммах
    is_vegetarian = models.BooleanField(blank=True, null=True) #вегетерианское ли
    weight_test = models.JSONField(blank=True, null=True) #масса блюда в граммах если есть множественный выбор


    rating = models.PositiveIntegerField(default=None) #калорийность блюда
    
    image = models.ImageField(upload_to=upload_to) #изображение блюда



    def __str__(self):
        return self.name
    
    tittle = ""
    def create_tittle(self):
        self.tittle = self.name.replace("_", " ")
        return self.tittle
    
    def create_tittle2(self):
        self.tittle = self.name.replace(" ", "_")
        return self.tittle