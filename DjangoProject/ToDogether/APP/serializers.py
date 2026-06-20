#serialises the data (querysets) into python data types which can be rendered into json easily

from rest_framework.serializers import ModelSerializer
from .models import (Activity,Parent,Child,Parent_Child,
                     User_task,Habit,Fish,ChildFish,
                     TankAdjustment)
from rest_framework import serializers

class ParentSerializer(ModelSerializer):
    class Meta:
        model = Parent
        #serialises all the fields in the specified table
        fields = '__all__'

class ChildSerializer(ModelSerializer):
    class Meta:
        model = Child
        fields = '__all__'

class ParentChildSerializer(ModelSerializer):
    class Meta:
        model = Parent_Child
        fields = '__all__'

class ActivitySerializer(ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class HabitSerializer(ModelSerializer):
    class Meta:
        model = Habit 
        fields = '__all__'

class UserTaskSerializer(ModelSerializer):
    class Meta:
        model = User_task 
        fields = '__all__'

class FishSerializer(serializers.ModelSerializer):
    #makes sure the url is included in the serialised data of the 'FishImage' field of the the Fish table
    FishImage = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = Fish 
        fields = '__all__'

class ChildFishSerializer(ModelSerializer):
    class Meta:
        model = ChildFish
        fields = '__all__'

class TankAdjustmentSerializer(ModelSerializer):
    class Meta:
        model = TankAdjustment
        fields = '__all__'