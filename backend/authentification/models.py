from django.db import models
import time
from rest_framework import status
from rest_framework.response import Response
from django.db.models.signals import  post_save, pre_save
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.dispatch import Signal
from django.core.validators import validate_email
instance_update = Signal()
from django.core.management import call_command
from django.contrib.auth.hashers import make_password, check_password
import uuid
from threading import Thread
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from .manager import UserManager  #, Command
from .validation import *
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import getpass
from .helpers import *
from datetime import datetime
from auditlog.models import AuditlogHistoryField
from auditlog.registry import auditlog
def get_secure_input(prompt):
    return getpass.getpass(prompt)



class THEME_MODULE(models.Model):
    USERID_THEME_OPT = models.CharField(max_length=6, primary_key=True)
    THEME_TYPE = models.CharField(max_length=50, unique=True)
    MODEL_1 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_2 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_3 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_4 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_5 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_6 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_7 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_8 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_9 = models.CharField(max_length=50, null=False, blank=False)
    MODEL_10 = models.CharField(max_length=50, null=False, blank=False)
    def __str__(self):
        return self.THEME_TYPE 
    class Meta:
        db_table = 'THEME_MODULE'


class User_login_Data(AbstractBaseUser, PermissionsMixin):
    # def theme_choices():
    #     themes = THEME_MODULE.objects.values_list('THEME_TYPE', flat=True)
    #     prefixes = ["UU_", "AU_"]
    #     choice = [(f"{prefix}{theme}", f"{prefix}{theme}") for prefix in prefixes for theme in themes]
    #     return choice
    
    USER_TYPE_CHOICES = (
    ('GU', 'General-User'),
    ('SU', 'Superuser-User'),
    ('AU', 'Admin-User'),
    ('UU', 'Athorizised-User')
)
    
    USER_APRO_CHOICE =(
    ('APPROVED', 'User-APPROVED'),
    ('REJECTED', 'User-REJECTED'),
    ('BLOCKED', 'User-BLOCKED'), #INPROGRESS
    ('DELETE', 'User-DELETE'),
    ('INPROGRESS', 'INPROGRESS'),
    ('REPLACE', 'REPLACE'),
    ('PENDING', 'PENDING')
    )
    ADMIN_CHOICE =(
    ("WCADMIN", "WCADMIN"),
    ("UDADMIN", "UDADMIN")
    )
    USERID = models.CharField(max_length=6, primary_key=True) 
    USERNAME = models.CharField(max_length=20, unique=True, null=False, blank=False, validators=[validate_no_dot])
    PASSWORD = models.CharField(max_length=150,null=False, blank=False, validators=[validate_password])
    USER_TYPE = models.CharField(max_length=2, choices=USER_TYPE_CHOICES, default='GU')#
    EMAIL = models.EmailField(_("email address"),max_length=100, unique=True)
    MOBILE_NO = models.CharField(max_length=10,null=True, blank=True)
    SU_APRO_STAT = models.CharField(max_length=20,choices=USER_APRO_CHOICE,null=True, blank=True)#
    AU_APRO_STAT = models.CharField(max_length=20,choices=USER_APRO_CHOICE,null=True, blank=True)#
    APRO_DATE = models.DateTimeField(null=True)
    SU_APRO_REM = models.CharField(max_length=100, null=True, blank=True)
    AU_APRO_REM = models.CharField(max_length=100, null=True, blank=True)
    # Q1_ID = models.IntegerField(null=True)
    # Q2_ID = models.IntegerField(null=True)
    # Q1_AN = models.CharField(max_length=20, null=True) 
    # Q2_AN = models.CharField(max_length=20, null=True)
    THEME_OPT = models.ForeignKey(THEME_MODULE, to_field='USERID_THEME_OPT', on_delete=models.CASCADE, related_name='THEME_MODULE_set', null=True,blank=True ) #models.ForeignKey(zipinfo, to_field='zip_code', on_delete=models.CASCADE, related_name='zipinfo_set')
    CREATION_DATE = models.DateTimeField(default=timezone.now, blank=True)
    ADMIN_TYPE = models.CharField(max_length=100, null=True, blank=True, choices=ADMIN_CHOICE)
    USERNAME_FIELD = "USERNAME"
    REQUIRED_FIELDS = ["EMAIL","PASSWORD"]
    first_name = None
    last_name = None
    password = None
    last_login = None
    is_superuser =None
    # objects = UserManager()
    history = AuditlogHistoryField()
    def check_password(self, raw_password):
        return self.PASSWORD == raw_password 
    def __str__(self):
        return self.USERNAME
    def save(self, *args, **kwargs):
        if self.USER_TYPE == 'SU':
            if User_login_Data.objects.filter(USER_TYPE='SU').exists() and not User_login_Data.objects.filter(USERID=self.USERID, USER_TYPE='SU').exists():
                raise ValidationError(_('A Superuser already exists. Only one Superuser is allowed.'))
        # elif 
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'Login_Main_Data'


class Users_login_Details_Data(models.Model):
    GENDER_CHOICES = (
    ('Male', 'MALE'),
    ('Female', 'female'),
    ('Transgender', 'Transgender'),
    ('Other', 'other')
)
    USERID = models.OneToOneField(User_login_Data, to_field='USERID', on_delete=models.CASCADE, related_name='logindata') #create one column user_id in this table
    FIRST_NAME = models.CharField(max_length=20, null=True)#
    MIDDLE_NAME = models.CharField(max_length=20, null=True, blank=True)
    LAST_NAME = models.CharField(max_length=20, null=True)#
    GENDER = models.CharField(max_length=20, null=True, blank=True, choices=GENDER_CHOICES)#20
    DOB = models.DateField(null=True)
    ORGANIZATION = models.CharField(max_length=100, null=True)#100#
    DESIGNATION = models.CharField(max_length=50,null=True)
    ADDRESS_1 = models.CharField(max_length=100, null=True, blank=True)
    ADDRESS_2 = models.CharField(max_length=100, null=True, blank=True)
    CITY = models.CharField(max_length=50, null=True)
    STATE = models.CharField(max_length=50, null=True)
    COUNTRY = models.CharField(max_length=50, null=True)
    PIN_CODE = models.CharField(max_length=6, null=True, blank=True)
    UU_REM = models.CharField(max_length=200, null=True, blank=True)
    LAN_LINE = models.CharField(max_length=15, null=True, blank=True) #, validators=[validate_numeric]
    ALT_EMAIL = models.EmailField(max_length=100, null=True, blank=True)
    OFF_LOCA = models.CharField(max_length=50, null=True, blank=True)#50
    
    def __str__(self):
        return self.USERID_id or "No Name"
    
    class Meta:
        db_table = 'Profile_Main_Data'
    

class password_table(models.Model):
    USERID = models.OneToOneField(User_login_Data, to_field='USERID', on_delete=models.CASCADE, null=True) #create one column user_id in this table
    forget_password_token = models.CharField(max_length=100,default=None, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return self.USERID_id or "No Name"
        # return str(self.user.pk)
    

class MODUL_VIEW_PERMISSION(models.Model):
    USERID = models.OneToOneField(User_login_Data, to_field='USERID', on_delete=models.CASCADE, unique=True, related_name='VIEW_PERMISSION')
    AU_ID = models.CharField(max_length=6)
    THEME_MODULE = models.ForeignKey(THEME_MODULE, to_field='USERID_THEME_OPT', on_delete=models.CASCADE,  related_name='VIEW_Thims')
    MODEL_1 = models.BooleanField(null=True, blank=True)
    MODEL_2 = models.BooleanField(null=True, blank=True)
    MODEL_3 = models.BooleanField(null=True, blank=True)
    MODEL_4 = models.BooleanField(null=True, blank=True)
    MODEL_5 = models.BooleanField(null=True, blank=True)
    MODEL_6 = models.BooleanField(null=True, blank=True)
    MODEL_7 = models.BooleanField(null=True, blank=True)
    MODEL_8 = models.BooleanField(null=True, blank=True)
    MODEL_9 = models.BooleanField(null=True, blank=True)
    MODEL_10 = models.BooleanField(null=True, blank=True)
    class Meta:
        db_table = 'MODUL_VIEW_PERMISSION'



class UserSession(models.Model):
    user = models.ForeignKey(User_login_Data, on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"{self.user.USERNAME} - {self.login_time} to {self.logout_time}"

class contact_us(models.Model):
    customer_mail = models.EmailField(null=True, blank=True)
    customer_mobile_no = models.CharField(max_length=20,null=True, blank=True)
    catagory = models.CharField(max_length=100, null=True, blank=True)
    comment = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100, null=True)


def time_function(id):
    recur = 0
    try:
        while True:
            x = password_table.objects.get(USERID_id=id)
            current_time = timezone.localtime(timezone.now())
            created_time = timezone.localtime(x.created_at)
            time_difference = current_time - created_time
            total_seconds = int(time_difference.total_seconds())
            remaining_seconds = max(0, 300 - total_seconds)
            if recur == 2:
                try:
                    x.forget_password_token = None 
                    x.delete()
                    break
                except Exception as e:
                    break
            if remaining_seconds > 0:
                time.sleep(remaining_seconds)
                # x.refresh_from_db()
                # recur += 1
                # return time_function(id)
                pass
            else:
                recur += 1
                pass
                # return time_function(id)
            
    except Exception as e:
        pass




class Myclass(Thread):
    def __init__(self, n):
        super().__init__()
        self.n = n
    def run(self):
        # time.sleep(30)
        try:
            time_function(self.n)
            # x = password_table.objects.get(USERID_id=self.n)
            # x.forget_password_token = None 
            # print("FORGET PASSWORD INSTANCE DELETE")
            # x.delete()
        except password_table.DoesNotExist:
            print(f"password_table object Deleted")

class Mysecond(Thread):
    def __init__(self, EMAIL, s, USERNAME, THEME_OPT, SU_EMAIL=None):
        super().__init__()
        self.EMAIL = EMAIL
        self.s = s
        self.USERNAME = USERNAME
        self.THEME_OPT = THEME_OPT
        self.SU_EMAIL = SU_EMAIL  # Include Super User email

    def run(self):
        try:
            # Sending the email to both USER and SU (if SU_EMAIL is not None)
            send_UU_model_permission_bravo(self.EMAIL, self.s, self.USERNAME, self.THEME_OPT, self.SU_EMAIL)
            pass
        except Exception as e:
            return Response({"error":str(e)}, status=status.HTTP_400_BAD_REQUEST)



# class permission_mail(Thread):
#     def __init__(self, n):
#         super().__init__()
#         self.n = n
#     def run(self):
#         try:
#             x = password_table.objects.get(USERID_id=self.n)
#             x.forget_password_token = None 
#             print("FORGET PASSWORD INSTANCE DELETE")
#             x.delete()
#         except password_table.DoesNotExist:
#             print(f"password_table object Deleted")


@receiver(post_save, sender = password_table)
def call_pass(sender, instance, created, **kwargs):
    val = instance.USERID_id # this is use for extract value from instance of primary key
    print(val)
    if not created:
        instance_update.send(sender=password_table, instance=instance)
        try:
            x = password_table.objects.get(USERID_id=instance.USERID_id)
            if x.forget_password_token == None:
                pass
            else:
                t1=Myclass(instance.USERID_id)
                t1.start()
        except password_table.DoesNotExist:
            print(f"password_table object Deleted")

# @receiver(post_save, sender = password_table)
# def call_pass(sender, instance, created, **kwargs):

@receiver(post_save, sender=MODUL_VIEW_PERMISSION)
def call_pass(sender, instance, created, **kwargs):
    val = instance.USERID_id  # Extract value from instance's primary key
    if not created:
        instance_update.send(sender=MODUL_VIEW_PERMISSION, instance=instance)
        try:
            x = MODUL_VIEW_PERMISSION.objects.get(USERID=val)
            print(x)
            y = THEME_MODULE.objects.get(USERID_THEME_OPT=x.THEME_MODULE_id)
            result_dict = {getattr(y, f"MODEL_{i}"): getattr(x, f"MODEL_{i}") for i in range(1, 11)} # Create a dict for the models with permissions
            
            permission_granted = [key for key, value in result_dict.items() if value is True] # Get the keys where permission is True
            
            if not permission_granted: # If no permissions are granted, set a default message
                s = "No Models pemission."
            else:
                s = ", ".join(permission_granted)  # Combine granted permissions
            
            # Get user details
            k = User_login_Data.objects.get(USERID=instance.USERID_id)
            EMAIL = k.EMAIL
            USERNAME = k.USERNAME
            THEME_OPT = k.THEME_OPT.THEME_TYPE  # Assuming THEME_OPT is part of User_login_Data

            # Retrieve Super User's email
            su_user = User_login_Data.objects.filter(USER_TYPE="SU", SU_APRO_STAT="APPROVED").first()
            SU_EMAIL = su_user.EMAIL if su_user else None

            # Send email based on approval statuses
            if k.SU_APRO_STAT == "APPROVED" and k.AU_APRO_STAT == "APPROVED":
                if k.AU_APRO_STAT == "APPROVED" and s:
                    t1 = Mysecond(EMAIL, s, USERNAME, THEME_OPT, SU_EMAIL)  # Pass the Super User's email
                    t1.start()
                    print("FINISHED")
                    pass
                else:
                    pass
            else:
                pass

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)


class Logs_LogEntry(models.Model):
    level = models.CharField(max_length=50)
    message = models.TextField()
    pathname = models.CharField(max_length=255)
    func_name = models.CharField(max_length=255)
    line_no = models.IntegerField()
    exc_info = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    # response_status = models.IntegerField(null=True, blank=True)  # New field for response status
    # response_data = models.TextField(null=True, blank=True)  # New field for response data










auditlog.register(User_login_Data, mask_fields=['PASSWORD'])

# auditlog.register(password_table)



# @auditlog.register(YourModel)


class Testclass(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=10)  # GET, POST, etc.    path = models.TextField()    request_headers = models.JSONField()    request_body = models.TextField(blank=True, null=True)
    response_status_code = models.IntegerField()
    response_headers = models.JSONField()
    response_body = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'HTTP Requests and Responses'  # For readability in admin panel



class UserLoginActivity(models.Model):
    # Login Status
    SUCCESS = 'S'
    FAILED = 'F'

    LOGIN_STATUS = ((SUCCESS, 'Success'),
                           (FAILED, 'Failed'))

    login_IP = models.GenericIPAddressField(null=True, blank=True)
    login_datetime = models.DateTimeField(auto_now=True)
    login_username = models.CharField(max_length=40, null=True, blank=True)
    status = models.CharField(max_length=1, default=SUCCESS, choices=LOGIN_STATUS, null=True, blank=True)
    user_agent_info = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'user_login_activity'
        verbose_name_plural = 'user_login_activities'






from django.contrib.gis.db import models

class AuderelaTable(models.Model):
    name = models.TextField()
    geom = models.GeometryField(srid=4326)  # Supports all geometry types

    def __str__(self):
        return self.name
    
class SpatialData(models.Model):
    task_id = models.CharField(max_length=255, unique=True)
    properties = models.JSONField()  # Store non-geometry attributes
    geometry = models.GeometryField()  # Stores spatial data (Point, LineString, Polygon, etc.)

    def __str__(self):
        return self.task_id
