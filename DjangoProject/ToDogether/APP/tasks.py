from datetime import datetime, timedelta, time
from .models import Habit, Activity, User_task

def DailyHabits():
    #Queries habits that need to be created based on specific conditions
    habits = Habit.objects.filter( Frequency='daily')

    for habit in habits: 
        habitID = habit.HabitID
        if habit.DailyRepeatCount is not None:
            if habit.DailyRepeatCount == 1:

                newActivity = Activity.objects.create(
                    ActivityType = 'habit',
                    Description = habit.ActivityID.Description,
                    ReminderDate = datetime.now().date(),
                    ReminderTime = habit.ActivityID.ReminderTime, 
                    DueDate = datetime.now().date(),
                    DueTime = time(23, 59, 0),
                    Effort = habit.ActivityID.Effort,
                    Priority = habit.ActivityID.Priority,
                    Points = habit.ActivityID.Points,
                )
                
                #Gets the ActivityID of the new Activity
                newActivityID = newActivity.pk

                #Creates a new habit record
                newHabit = Habit.objects.create(
                    ActivityID=newActivityID,
                    DailyRepeatCount=habit.DailyRepeatCount,
                )

                #Gets the HabitID of the new Habit
                newHabitID = newHabit.pk

                #finds the associated user_task table
                userTask = User_task.objects.get(HabitID__HabitID=habitID)

                #Creates a UserTask entry
                User_task.objects.create(
                    HabitID = newHabitID,
                    ActivityID = newActivityID,
                    ParentChildID = userTask.ParentChildID,
                )
            
            elif habit.DailyRepeatCount > 1:
                #extracts time and handle None value
                def get_time_from_datetime(dt):
                    return dt.time() if isinstance(dt, datetime) else None

                #Extracts the start and end time
                startTime = get_time_from_datetime(habit.StartTime)
                endTime = get_time_from_datetime(habit.EndTime)

                if startTime and endTime is not None:
                    #Calculates the time difference between start and end time
                    startDateTime = datetime.combine(datetime.today(), startTime)
                    endDateTime = datetime.combine(datetime.today(), endTime)

                    TimeDiff = endDateTime - startDateTime

                    #Calculates the interval between each occurrence
                    interval = TimeDiff.total_seconds() / habit.DailyRepeatCount

                    #Calculates due time for each repetition
                    duetimes = []
                    currentTime = startDateTime
                    for _ in range(habit.DailyRepeatCount):
                        duetimes.append(currentTime.time())
                        currentTime += timedelta(seconds=interval)

                    
                    for duetime in duetimes:
                        dueTime = duetime
                        reminderTime = duetime - time(minute=10)

                        #Creates an associated activity for the habit
                        newDailyActivity = Activity.objects.create(
                            ActivityType = 'habit',
                            Description = habit.ActivityID.Description,
                            ReminderDate = datetime.now().date(),
                            ReminderTime = reminderTime,
                            DueDate = datetime.now().date(),
                            DueTime = dueTime,
                            Effort = habit.ActivityID.Effort,
                            Priority = habit.ActivityID.Priority,
                            Points = habit.ActivityID.Points,
                        )

                        newDailyActivityID = newDailyActivity.pk

                        #Creates new habit
                        newDailyHabit = Habit.objects.create(
                            ActivityID = newDailyActivity,
                            StartTime = habit.StartTime,
                            EndTime = habit.EndTime,
                            DailyRepeatCount = habit.DailyRepeatCount,
                        )

                        newDailyHabitID = newDailyHabit.pk

                        #finds the associated user_task table
                        userTask = User_task.objects.get(HabitID__HabitID=habitID)

                        #Creates a UserTask entry
                        User_task.objects.create(
                            HabitID = newDailyHabitID,
                            ActivityID = newDailyActivityID,
                            ParentChildID = userTask.ParentChildID,
                        )
        
def WeeklyHabits():
    habits = Habit.objects.filter( Frequency='weekly')

    for habit in habits:
        habitID = habit.HabitID
        repeatDays = habit.RepeatDay 
        dueTime = habit.ActivityID.DueTime
        
        if repeatDays and dueTime is not None:
            #Converts days to lowercase for comparison
            repeatdays = [day.lower() for day in repeatDays]
            #Gets the lowercase name of the current day
            currentDay = datetime.now().strftime('%A').lower()

            reminderTime = (datetime.combine(datetime.today(), dueTime) 
                            - timedelta(minutes = 10)).time()

            #Checks if the current day is in the list of RepeatDay
            if currentDay in repeatdays:
                 #Creates an associated activity for the habit
                newWeeklyActivity = Activity.objects.create(
                    ActivityType = 'habit',
                    Description = habit.ActivityID.Description,
                    ReminderDate = datetime.now().date(),
                    ReminderTime = reminderTime,
                    DueDate = datetime.now().date(),
                    DueTime = habit.ActivityID.DueTime,
                    Effort = habit.ActivityID.Effort,
                    Priority = habit.ActivityID.Priority,
                    Points = habit.ActivityID.Points,
                )

                newWeeklyActivityID = newWeeklyActivity.pk

                newWeeklyHabit = Habit.objects.create(
                    ActivityID = newWeeklyActivityID,
                    RepeatDay = repeatDays,
                )

                newWeeklyHabitID = newWeeklyHabit.pk

                #finds the associated user_task table
                userTask = User_task.objects.get(HabitID__HabitID=habitID)
                
                User_task.objects.create(
                        HabitID = newWeeklyHabitID,
                        ActivityID = newWeeklyActivityID,
                        ParentChildID = userTask.ParentChildID,
                    )

DailyHabits()
WeeklyHabits()