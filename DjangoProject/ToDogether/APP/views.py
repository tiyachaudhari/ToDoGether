from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (Activity,Parent_Child,Parent,Child,
                     User_task,Habit,Fish, ChildFish,
                     TankAdjustment)
from rest_framework import status
from .serializers import (ActivitySerializer,
                          ParentSerializer,ChildSerializer,
                          HabitSerializer,FishSerializer,
                          ChildFishSerializer,
                          TankAdjustmentSerializer)
from datetime import datetime
from django.utils import timezone
from django.core.mail import send_mail
from django.utils.timezone import make_aware, utc
from django.utils import timezone
import random

@api_view(['GET'])
def getRoutes(request): 
    #dictonary of API to define the routes 
    routes = [
        {
            'Endpoint': '/activities/',
            'method': 'GET',
            'body': None,
            'description': 'Returns a list of Activitys'
        },
        {
            'Endpoint': '/activities/<int:pk>/',
            'method': 'GET',
            'body': None,
            'description': 'Returns a single Activity'
        },
        {
            'Endpoint': '/activities/create/',
            'method': 'POST',
            'body': {'body':""},
            'description': 'creates a new Activity'
        },
        {
            'Endpoint': '/activities/<int:pk>/update/',
            'method': 'PUT', 
            'body': {'body':""}, 
            'description': 'updates an existing Activity description or marks it complete'
        },
        {
            'Endpoint': '/update/points/',
            'method': 'POST', 
            'body': {'body':""}, 
            'description': 'updates points'
        },
        {
            'Endpoint': '/activities/<int:pk>/delete/',
            'method': 'DELETE',
            'body': None,
            'description': 'Deletes a Activity'
        },
        {
            'Endpoint': '/parent/signup/',
            'method': 'POST',
            'body': None,
            'description': 'Creates a parent account'
        },
        {
            'Endpoint': '/child/signup/',
            'method': 'POST',
            'body': None,
            'description': 'Creates a child account'
        },
        {
            'Endpoint': '/parent/login/',
            'method': 'POST',
            'body': None,
            'description': 'Login for parent'
        },
        {
            'Endpoint': '/child/login/',
            'method': 'POST',
            'body': None,
            'description': 'Login for child'
        },
    ]
    return Response(routes) 

#Activity APIs
@api_view(['GET'])
def getActivities(request, pk):
    try:
        # Get a list of activity IDs for the specified child using ParentChildID
        activityIDs = User_task.objects.filter(ParentChildID__ChildID=pk).values_list('ActivityID', flat=True)

        # Retrieve activities associated with these activity IDs
        activities = Activity.objects.filter(ActivityID__in=activityIDs)
        habits = Habit.objects.filter(ActivityID__in=activityIDs)

        # Serialize both activities and habits
        activitySerializer = ActivitySerializer(activities, many=True)
        habitSerializer = HabitSerializer(habits, many=True)

        # Combine the serialized data
        serialized_data = {
            'activities': activitySerializer.data,
            'habits': habitSerializer.data,
        }

        return Response(serialized_data)
    except (Activity.DoesNotExist, Habit.DoesNotExist):
        return Response({"error": "Activities or Habits not found for the specified child"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def getActivity(request, pk):
    try:
        activity = Activity.objects.get(ActivityID=pk)
        activitySerializer = ActivitySerializer(activity)

        habit = Habit.objects.filter(ActivityID=pk).first()
        if habit:
            habitSerializer = HabitSerializer(habit)
            serializedData = {
                'activity': activitySerializer.data,
                'habit': habitSerializer.data,
            }
        else:
            serializedData = {
                'activity': activitySerializer.data,
            }
        return Response(serializedData)
    except Activity.DoesNotExist:
        return Response({'message': 'Activity does not exist'}, status=status.HTTP_404_NOT_FOUND)
    except Habit.DoesNotExist:
        return Response({'message': 'Habit does not exist for this Activity'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def childDetails(request,pk):
    child = get_object_or_404(Child, ChildID=pk)
    serializer = ChildSerializer(child)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def updateProfileEmoji(request, pk):
    try:
        child = get_object_or_404(Child, ChildID=pk)
        
        profileEmoji = request.data.get('ProfileEmoji')
        if profileEmoji is not None:
            child.ProfileEmoji = profileEmoji
            child.save()
            
            return Response({'message': 'ProfileEmoji updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'ProfileEmoji field is required'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def updatePoints(request):
    print("Request Data:", request.data)
    
    #retrives data from the request data
    fishID = request.data.get("FishID")
    childID = request.data.get('ChildID')
    activityID = request.data.get('ActivityID')
    foodPoints = request.data.get('FoodPoints')

    #if fishID and childID are provided, updates points based on the fish data
    if fishID and childID:
        child = get_object_or_404(Child, ChildID=childID)
        fish = get_object_or_404(Fish, FishID=fishID)

        child.TotalPoints = int(child.TotalPoints - fish.FishPrice)
        child.save()

        return Response({"message": "Points updated successfully"}, status=status.HTTP_200_OK)
    else:
        pass
    
    #if fishID and childID are not provided, updates points based on the activity data
    activity = get_object_or_404(Activity, ActivityID=activityID)
    
    points = activity.Points
    userTask = User_task.objects.filter(ActivityID=activity).first()
    
    #ensures that User_task record exists 
    if userTask is None or userTask.ParentChildID is None:
        return Response({"error": "No associated parent-child found for this activity."}, status=status.HTTP_400_BAD_REQUEST)

    #extracts child from Parent_Child record
    parent_child = userTask.ParentChildID
    child = parent_child.ChildID

    serializer = None

    #determines the type of activity and updates the points accordingly
    if activity.ActivityType == 'habit':
        serializer = HabitSerializer(activity)
        if not activity.Completed:
            child.TotalPoints -= points
        else:
            child.TotalPoints += points
    else:
        serializer = ActivitySerializer(activity)

        completionDateTime_str = request.data.get("completedDateTime")
        completionDateTime = None
        PointsToAdd = 0

        if completionDateTime_str:
            try:
                completionDateTime = datetime.fromisoformat(completionDateTime_str.rstrip('Z'))
                completionDateTime = make_aware(completionDateTime, timezone=utc)
            except ValueError:
                return Response({"error" : "Invalid completion timestamp format"}, status=status.HTTP_400_BAD_REQUEST)
            
        #determines when the activity is completed to update the points accordingly
        if activity.DueDate is not None and activity.DueTime is not None:
            dueDateTime = datetime.combine(activity.DueDate, activity.DueTime)
            if completionDateTime:
                dueDateTime = make_aware(dueDateTime, timezone=completionDateTime.tzinfo)
                print("completionDateTime:", completionDateTime)
                print("dueDateTime:", dueDateTime)
            if completionDateTime and completionDateTime == dueDateTime:
                PointsToAdd = points
            elif completionDateTime and completionDateTime < dueDateTime:
                PointsToAdd = points + 10
            elif completionDateTime:
                PointsToAdd = points - 10

        if not activity.Completed:
            child.TotalPoints -= PointsToAdd
        else:
            child.TotalPoints += PointsToAdd

    child.save()
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def updateActivity(request, pk):
    try:
        activity = get_object_or_404(Activity, ActivityID=pk)
        #gets the data from the request
        activityData = request.data
        
        #esnures the ActivityType is in the data 
        if 'ActivityType' in activityData:
            activityType = activityData['ActivityType']

            if activityType == 'task':
                #creates a serializer instance for the activity
                activitySerializer = ActivitySerializer(activity, data=activityData)
                if activitySerializer.is_valid():
                    activitySerializer.save()
                    return Response(activitySerializer.data)
                else:
                    return Response(activitySerializer.errors, status=status.HTTP_400_BAD_REQUEST)
           
            #updates the specific fields in Activity when ActivityType is "habit"
            elif activityType == 'habit':
                for field in ['ReminderDate', 'ReminderTime', 'DueDate', 'DueTime']:
                    if field in activityData:
                        setattr(activity, field, activityData[field])
                activity.save()

                try:
                    habit = Habit.objects.get(ActivityID=pk)
                    #creates a serializer instance for the habit
                    habitSerializer = HabitSerializer(habit, data=activityData)
                    if habitSerializer.is_valid():
                        habitSerializer.save()
                        return Response(habitSerializer.data)
                    else:
                        return Response(habitSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
                except Habit.DoesNotExist:
                    pass  

        activity.save()
        return Response({"message": "Invalid ActivityType provided"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def completed(request, pk):
    try:
        activity = get_object_or_404(Activity, ActivityID=pk)
    except Activity.DoesNotExist:
        return Response({"error": "Activity not found"}, status=status.HTTP_404_NOT_FOUND)

    #enusres the "Completed" field is in the request data 
    if 'Completed' in request.data:
        #updates the completed status
        activity.Completed = request.data['Completed']

        if activity.Completed:
            #updates the completion timestamp if the activity is marked as completed
            activity.CompletedDateTime = datetime.now()
        else:
            activity.CompletedDateTime = None

    activity.save()

    serializer = ActivitySerializer(activity)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def createActivity(request):
    print("Received data:", request.data)

    childID = request.data.get('ChildID')
    activity_type = request.data.get('ActivityType')

    child = get_object_or_404(Child, pk=childID)
    parent_child = Parent_Child.objects.filter(ChildID=child).first()

    serializer = ActivitySerializer(data=request.data)

    if serializer.is_valid():
        with transaction.atomic():
            activity = serializer.save()

            points = calculatePoints(activity.Effort, activity.Priority)
            activity.Points = points
            activity.save()

            #Creates a User_task record
            user_task_data = {
                'ParentChildID': parent_child,
                'ActivityID': activity,
                'HabitID': None  # Assuming no habit associated initially
            }

            user_task = User_task.objects.create(**user_task_data)

            if activity_type == 'habit':
                habit_fields = ['Frequency', 'RepeatDay', 'DailyRepeatCount', 'StartTime', 'EndTime']
                habit_data = {field: request.data.get(field) for field in habit_fields}
                habit_data['ActivityID'] = activity
                habit = Habit.objects.create(**habit_data)

                #updates the User_task record with the HabitID
                user_task.HabitID = habit
                user_task.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)
        
#calculates the activity points 
def calculatePoints(effort, priority):
    effort_points = {'low': 10, 'medium': 20, 'high': 30}
    priority_points = {'low': 5, 'medium': 10, 'high': 15}

    return effort_points.get(effort, 0) + priority_points.get(priority, 0)

@api_view(['DELETE'])
def deleteActivity(request, pk):
    try:
        #ensures atomicity
        with transaction.atomic():
            activity = get_object_or_404(Activity, ActivityID=pk)

            # Deletes related User_Task records
            user_tasks = User_task.objects.filter(ActivityID=activity.ActivityID)
            user_tasks.delete()

            # Checks if it's a Habit and deletes the Habit record if it exists
            if activity.ActivityType == 'habit':
                habit = Habit.objects.filter(ActivityID=activity)
                habit.delete()

            # Deletes the Activity itself
            activity.delete()

        return Response({'message': 'Activity and related records deleted'}, status=204)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#Login-SignUp APIs
@api_view(['POST'])
def parentSignUp(request):
    serializer = ParentSerializer(data=request.data)
    
    try:
        if serializer.is_valid():
            parent = serializer.save().ParentID
            email = serializer.save().ParentEmail
            subject = 'ParentID'
            message = f'Your Parent ID is: {parent}. You can use this Parent ID to register child accounts.'
            sender = 'mariposaco.el@gmail.com'  
            reciever = [email]
            #sends email to the extracted email with the Parent ID
            send_mail(subject, message, sender, reciever)
            response_data = {
                "message": "Parent successfully registered.",
                "ParentID": parent
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def childSignUp(request):
    parentIDs = request.data.get('ParentID', [])
    temperature = 25
    oxygenLevel = 15

    try:
        parents = []
             #Loops through the parentIDs to get parent objects
        for parentID in parentIDs:
            parent = get_object_or_404(Parent,ParentID=parentID)
            #adds the retreived parent object to the parents list
            parents.append(parent)
           
        serializer = ChildSerializer(data=request.data)
        if serializer.is_valid():
            try:
                #ensures atomicity 
                with transaction.atomic():
                    #saves the child information
                    child = serializer.save()
                    #loop through the parent objects to create Parent_Child records
                    for parent in parents:
                        Parent_Child.objects.create(ParentID=parent, ChildID=child)
                    
                    #creates a TankAdjustment record
                    TankAdjustment.objects.create(TemperatureAdjustment = temperature, 
                                                  OxygenLevelAdjustment = oxygenLevel)

                return Response({
                    "message": "Child successfully registered.",
                    "ParentIDs": parentIDs
                }, status=status.HTTP_201_CREATED)
            #error handling
            except Exception as e:
                return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def ResetEmail(request):
    #retrives the needed data from the sent data
    resetCode = request.data.get('ResetCode')
    userType = request.data.get('UserType')
    Email = request.data.get('email')
    userName = request.data.get('UserName')
    newPassword = request.data.get('NewPassword')

    if newPassword: #ensures the newPassword is not None
        if userType == 'Parent':
            user = get_object_or_404(Parent,Parent_username=userName)
            #checks if the Reset Code matches or not
            if user.ResetCode == resetCode:
                #replaces the Password with new Password
                user.ParentPassword = newPassword
                user.save()
                return Response({'message':'New Password reset'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Reset Code does not match'})    
        elif userType == 'Child':
            user = get_object_or_404(Child,Child_username=userName)
            if user.ResetCode == resetCode:
                user.ChildPassword = newPassword
                user.save()
                return Response({'message':'New Password reset'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Reset Code does not match'})
           
            
    else: #if the newPassword is None
        resetCode = ResetCode()
        if userType == 'Parent':
            #finds the user in the database 
            parent = get_object_or_404(Parent,Parent_username=userName)
            #saves the resetCode in the users record 
            parent.ResetCode = resetCode
            parent.save()
            #calls the function that sends email 
            #(passes the input email and generated reset code as parameters)
            SendEmail(Email, resetCode)
            
            return Response({'Reset code generated and sent'}, status=status.HTTP_200_OK)

        
        elif userType == 'Child':
            child = get_object_or_404(Child,Child_username=userName)
            child.ResetCode = resetCode
            child.save()
            SendEmail(Email, resetCode)
                
            return Response({'Reset code generated and sent'}, status=status.HTTP_200_OK)
    return Response({'message': 'Not the expected response'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def ResetCode():
    # Generates a random numeric 6-digit code
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def SendEmail(Email, resetCode):
    # Sends email to the user with the reset code
    subject = 'Reset Code'
    message = f'Your reset code is: {resetCode}'
    sender = 'mariposaco.el@gmail.com'  
    reciever = [Email]

    send_mail(subject, message, sender, reciever)

@api_view(['POST'])
def login(request):
    print('Request data:', request.data)
    
    #retrives the needed data from the sent data
    usertype = request.data.get('Usertype')
    username = request.data.get('Username')
    password = request.data.get('Password')

    #checks the UserType and performs authentication     
    if usertype == 'Parent':
        try:
            #checks whether the username and password exists in the db
            parent = get_object_or_404(Parent, Parent_username=username, ParentPassword=password)
            serializer = ParentSerializer(parent)
            print('User authenticated:', username)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print('Authentication failed')
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    elif usertype == 'Child':
        try:
            child = get_object_or_404(Child, Child_username=username, ChildPassword=password)
            serializer = ChildSerializer(child)
            print('User authenticated:', username)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print('Authentication failed')
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    else:
        #error handling: ensures that UserType is not missing
        print('Invalid Usertype')
        return Response({"message": "Invalid Usertype."}, status=status.HTTP_400_BAD_REQUEST)
            
@api_view(['GET'])
def RegisteredKids(request,pk):
    try:
        parent = get_object_or_404(Parent,ParentID=pk)
        children = Child.objects.filter(parent_child__ParentID=pk)
        #serialises the data 
        Childserializer = ChildSerializer(children, many=True)
        Parentserializer = ParentSerializer(parent)

        response_data = {
            'parent': Parentserializer.data,
            'Children': Childserializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#Game APIs    
@api_view(['GET'])
def getFishes(request):
    fishes = Fish.objects.all()
    serializer = FishSerializer(fishes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def childfish(request):
    serializer = ChildFishSerializer(data=request.data)

    if serializer.is_valid():
        # Get the FishID from the request data
        fishID = request.data.get('FishID')

        try:
            #Fetches the Fish object 
            fish = Fish.objects.get(FishID=fishID)
            #Gets the Life value and sets it as the RemainingLife 
            life = fish.Life
            serializer.context['RemainingLife'] = life
            serializer.save()
            return Response(serializer.data, status=201)
        except Fish.DoesNotExist:
            return Response({'error': 'Fish not found'}, status=404)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def getChildFishes(request, pk):
    try:
        #Fetches fishes associated with the given pk from ChildFish table
        childFishes = ChildFish.objects.filter(ChildID=pk)

        serializedData = []
        for child_fish in childFishes:
            #Gets the associated Fish object
            fish = child_fish.FishID

            #Serializes the Fish object and append it to the response data
            fishData = FishSerializer(fish).data
            fishData['DateOfPurchase'] = datetime.now()

            serializedData.append(fishData)
        return Response(serializedData, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def getFishStatus(request,pk):
    try:
        # Retrieve the ChildFish object corresponding to the given fish_id
        childFish = ChildFish.objects.get(FishID=pk)
        fish = childFish.FishID
        
        # Assuming ChildFish model has fields 'hungryLevel' and 'maxFoodLevel'
        fedLevel = childFish.FedLevel
        foodLevel = fish.FoodLevel
        
        # Construct and return the response data
        responseData = {
            'fedLevel': fedLevel,
            'maxFoodLevel': foodLevel
        }
        
        return Response(responseData, status=200)
    except ChildFish.DoesNotExist:
        return Response({'error': 'Fish not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def getTankAdjustments(request,pk):
        adjustments = get_object_or_404(TankAdjustment, ChildID=pk)
        serializer = TankAdjustmentSerializer(adjustments)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
def FishFood(request):
    fishID = request.data.get('FishID')
    childID = request.data.get('ChildID')
    foodPoints = request.data.get('FoodPoints')

    #checks if all the needed data is present
    if fishID and childID and foodPoints:
        try:
            fish = get_object_or_404(Fish, FishID=fishID)
            foodLevel = fish.FoodLevel

            childFish = get_object_or_404(ChildFish, ChildID=childID, FishID=fishID)
            fedLevel = childFish.FedLevel

            child = get_object_or_404(Child, ChildID=childID)
            child.TotalPoints = int(child.TotalPoints - foodPoints)
            child.save()

            # Updates fedTime to the current time
            childFish.FedTime = timezone.now()

            # Adds the FoodPoints to FedLevel
            fedLevel += foodPoints

            # Updates the FedLevel of the user's fish
            childFish.FedLevel = fedLevel
            childFish.save()

            #informs the user that the fish has been overfed
            if fedLevel > foodLevel + 5:
                overfedMessage = "Warning: Your fish has been overfed!"
            else:
                overfedMessage = None
            
            # Serializes the data
            fishSerializer = FishSerializer(fish)
            childfishSerializer = ChildFishSerializer(childFish)

            return Response({
                'FedLevel': fedLevel,
                'OverfedMessage': overfedMessage,
                'Fish': fishSerializer.data,
                'ChildFish': childfishSerializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'records not found'}, status=status.HTTP_404_NOT_FOUND)