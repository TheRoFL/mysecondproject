from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from datetime import date


class ProfileData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=20,blank=False, null=False)
    surname = models.CharField(max_length=20, blank=False, null=False)

    SEX_CHOICES = (('m', 'Male'),('f', 'Female'))
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=False, null=False)

    birthdate = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=50,blank=True, null=True)
    address = models.CharField(max_length=50,blank=True, null=True)
    
    bonuses = models.IntegerField(default=0, blank=True, null=True)
    age = models.IntegerField(default=18, blank=False, null=False)
    
    def __str__(self):
        return self.user.username

    def calculate_age(self):
        birth = str(self.birthdate)
        year, month, day = map(int, birth.split('-'))
        birthdate = date(year, month, day)
        today = date.today()
        Age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
        
        return Age
