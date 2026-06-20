from django.db import models
from django.core.validators import MinLengthValidator

class Parent(models.Model):
    ParentID = models.AutoField(primary_key=True)
    Parent_FirstName = models.CharField(max_length=200)
    Parent_SurName = models.CharField(max_length=200)
    Parent_username = models.CharField(
        max_length=22,                   
        validators=[MinLengthValidator(limit_value=6)],
        unique=True
    )
    ParentEmail = models.EmailField(unique=True)
    ParentPassword = models.CharField(
        max_length=22,
        validators=[MinLengthValidator(limit_value=10)],
        null=False
        )
    ResetCode = models.CharField(null=True, max_length=6)
    children = models.ManyToManyField('Child', through='Parent_Child', related_name='parents')

class Child(models.Model):
    ChildID = models.AutoField(primary_key=True)
    Child_FirstName = models.CharField(max_length=200)
    Child_SurName = models.CharField(max_length=200)
    Child_username = models.CharField(
        max_length=22,
        validators=[MinLengthValidator(limit_value=6)],
        unique=True
    )
    ChildPassword = models.CharField(
        max_length=22,
        validators=[MinLengthValidator(limit_value=10)],
        null=False
        )
    ProfileEmoji = models.TextField(null=True)
    TotalPoints = models.IntegerField(default=0)
    ResetCode = models.CharField(null=True, max_length=6)
    fishes = models.ManyToManyField('Fish', through='ChildFish', related_name='children_fishes')

class Parent_Child(models.Model):
    Parent_ChildID = models.AutoField(primary_key=True)
    ChildID = models.ForeignKey(Child, on_delete=models.CASCADE)
    ParentID = models.ForeignKey(Parent, on_delete=models.CASCADE)

class Activity(models.Model):
    choices = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    activity_choices = (
        ('task', 'Task'),
        ('habit', 'Habit'),
    )
    ActivityID = models.AutoField(primary_key=True)
    ActivityType = models.CharField(
        max_length=10,
        choices=activity_choices,
        default='task'
    )
    Description = models.TextField()
    Completed = models.BooleanField(null=True, default=False)
    CompletedDateTime = models.DateTimeField(null=True)
    ReminderDate = models.DateField(null=True)
    ReminderTime = models.TimeField(null=True)
    Effort = models.CharField(
        max_length=10,
        choices=choices,
        default='low'
    )
    Priority = models.CharField(
        max_length=10,
        choices=choices,
        default='low'
    )
    DueDate = models.DateField(null=True)
    DueTime = models.TimeField(null=True)
    Points = models.IntegerField(default=0)

class Habit(models.Model):
    frequency_choices = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    )

    HabitID = models.AutoField(primary_key=True)
    ActivityID = models.ForeignKey(Activity, on_delete=models.CASCADE)
    Frequency = models.CharField(
        max_length=10,
        choices=frequency_choices,
        null=True
    )
    RepeatDay = models.CharField(max_length=21,null=True,blank=True)
    DailyRepeatCount = models.IntegerField(null=True)
    StartTime = models.TimeField(null=True)
    EndTime = models.TimeField(null=True)

class User_task(models.Model):
    User_taskID = models.AutoField(primary_key=True)
    ParentChildID = models.ForeignKey(Parent_Child, on_delete=models.CASCADE, null=True)
    ActivityID = models.ForeignKey(Activity, on_delete=models.CASCADE)
    HabitID = models.ForeignKey(Habit, on_delete=models.CASCADE, null=True)

class Fish(models.Model):
    FishID = models.AutoField(primary_key=True)
    FishName = models.CharField(max_length=200)
    FishPrice = models.DecimalField(max_digits=10, decimal_places=2)
    FishImage = models.ImageField(upload_to='media/')  
    FoodLevel = models.IntegerField(default=0)
    Life = models.IntegerField(default=0)

class ChildFish(models.Model):
    ChildFishID = models.AutoField(primary_key=True)
    ChildID = models.ForeignKey('Child', on_delete=models.CASCADE)
    FishID = models.ForeignKey('Fish', on_delete=models.CASCADE)
    FedLevel = models.IntegerField(default=0)
    FedTime = models.DateTimeField(null=True,blank=True)
    DateOfPurchase = models.DateTimeField(null=True)
    RemainingLife = models.IntegerField(default=0)

class TankAdjustment(models.Model):
    AdjustmentID = models.AutoField(primary_key=True)
    ChildID = models.ForeignKey('Child', on_delete=models.CASCADE)
    TemperatureAdjustment = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    OxygenLevelAdjustment = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    WaterChange = models.BooleanField(default=False)
    TemperatureAdjustmentTime = models.DateTimeField(auto_now_add=True)
    OxygenAdjustmentTime = models.DateTimeField(auto_now_add=True)
    WaterChangeTime = models.DateTimeField(auto_now_add=True)
   
