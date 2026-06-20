from django.urls import path 
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.getRoutes, name='routes'),
    path('child/<int:pk>/', views.childDetails, name='child-details'),
    path('data/<int:pk>/update/',views.updateProfileEmoji, name="updating the child profiles "),
    path('activity/<int:pk>/', views.getActivity, name="activity"),
    path('activities/<int:pk>/', views.getActivities, name="activties"),
    path('activities/create/', views.createActivity, name="create-activity"),
    path('activities/<int:pk>/update/', views.completed, name="update-activity"),
    path('activities/<int:pk>/update/2/', views.updateActivity, name="update-activity"),
    path('update/points/', views.updatePoints,name='update-points'),
    path('activities/<int:pk>/delete/', views.deleteActivity, name="delete-activity"),
    path('signup/parent/', views.parentSignUp, name='signup'),
    path('signup/child/', views.childSignUp, name='signup'),
    path('reset/data/', views.ResetEmail, name='Reset-email'),
    path('login/', views.login, name='login'),
    path('parents/<int:pk>/children/', views.RegisteredKids, name='Registered Kids'),
    path('fishes/', views.getFishes, name='get-fishes'),
    path('child/fish/', views.childfish, name='Child-Fish'),
    path('child/<int:pk>/fishes/', views.getChildFishes, name='get-fishes-child'),
    path('child/<int:pk>/adjustments/', views.getTankAdjustments, name='get-adjustments'),
    path('fish/feed/', views.FishFood, name='manage-fish-feed'),
    path('child/fish/<int:pk>/status', views.getFishStatus, name='manage-fish-feed'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
