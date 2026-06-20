#connects the database to the admin page (of the django rest framework) 

from django.contrib import admin
from .models import Parent,Child,Parent_Child,Activity,Habit,User_task,Fish,ChildFish,TankAdjustment

admin.site.register(Parent)
admin.site.register(Child)
admin.site.register(Parent_Child)
admin.site.register(Activity)
admin.site.register(Habit)
admin.site.register(User_task)
admin.site.register(Fish)
admin.site.register(ChildFish)
admin.site.register(TankAdjustment)