from django.core.management.base import BaseCommand, CommandError
import sys
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from authentification.models import User_login_Data, password_table
from authentification.models import *
from authentification.serializers import User_login_Data_serialiser112
import random
from django.core.mail import send_mail
from django.conf import settings
import string
from datetime import datetime, timedelta
import secrets
# import time

from authentification.views import create_custom_token
from django.contrib.auth.hashers import make_password
class Command(BaseCommand):
    help = 'Create a token in the auth_token table'

    def generate_10_digit_code(self):
        # Generate a random 10-digit number
        return ''.join(secrets.choice(string.digits) for i in range(10))
    
    def username(self):
        # Generate a random 10-digit number
        while True:
            USERNAME = input('Please enter an username of SuperUser: ')
            data_to_validate = {'USERNAME': USERNAME}
            serializer = User_login_Data_serialiser112(data=data_to_validate)
            try:
                validated_username = serializer.validate_field('USERNAME', data_to_validate['USERNAME'])      #validated_username = serializer.validate_field('USERNAME', data_to_validate['USERNAME'])
                print(f'Validated USERNAME: {validated_username}')
                break
            except Exception as e:
                print(f'Validation error: {e}')
            
        return USERNAME


    def email_validation(self):
        # Generate a random 10-digit number
        while True:
            EMAIL = input('Please enter an email address to send the setup link of SuperUser: ').lower()
            data_to_validate = {'EMAIL': EMAIL}
            serializer = User_login_Data_serialiser112(data=data_to_validate)
            try:
                validated_email = serializer.validate_field('EMAIL', data_to_validate['EMAIL'])      #validated_username = serializer.validate_field('USERNAME', data_to_validate['USERNAME'])
                break
            except Exception as e:
                print(f'Validation error: {e}')
        return EMAIL

    def handle(self, *args, **kwargs):
        # Check if any users exist
        # url = f'{settings.BASE_URL}/superuser/'  # Replace with your actual URL
        # print("urlllllllllllll", url)
        if not User_login_Data.objects.filter(USER_TYPE='SU').exists():
            self.stdout.write(self.style.WARNING('No superuser found.'))
            USERNAME = self.username()
            EMAIL =self.email_validation()
            # special_chars = "!@#$%^&*"
            # letters = string.ascii_letters
            # digits = string.digits
            # password_list = [random.choice(special_chars), random.choice(letters), random.choice(digits)]
            # remaining_length = 13
            # password_list.extend(random.choice(letters + digits + special_chars) for _ in range(remaining_length))
            # random.shuffle(password_list)
            PASSWORD =''.join(random.choice(string.digits) for _ in range(6))
            print(PASSWORD, len(PASSWORD))
            import time
            SU_Singup_link_bravo(EMAIL=EMAIL,USERNAME= USERNAME, PASSWORD= PASSWORD)
            created_at = time.time()
            count_varification = 0
            while True:
                current_time = time.time()
                if count_varification == 3:
                    self.stdout.write(self.style.SUCCESS('Stopping The Server Exceed Limit Of Submitting PINCODE...')) #sys.exit(0)
                    sys.exit(0)
                time_difference  = current_time - created_at 
                if time_difference  < 300:
                    varify_password = input('Please Enter Token To Varify SuperUser: ')
                else:
                    self.stdout.write(self.style.SUCCESS('Stopping The Server Time Over...'))
                    sys.exit(0)
                if varify_password == PASSWORD:
                    break
                else:
                    count_varification += 1
            current_time =  timezone.now() #+ datetime.timedelta(minutes=5)
            time= int(current_time.timestamp())
            exp = int((current_time + timedelta(minutes=15)).timestamp())
            special_chars = "!@#$%^&*"
            letters = string.ascii_letters
            digits = string.digits
            password_list = [random.choice(special_chars), random.choice(letters), random.choice(digits)]
            remaining_length = 5
            password_list.extend(random.choice(letters + digits + special_chars) for _ in range(remaining_length))
            random.shuffle(password_list)
            PASSWORD_SU = ''.join(password_list)
            print(PASSWORD_SU,  len(PASSWORD_SU))
            token_SU = create_custom_token(USERNAME=USERNAME, EMAIL=EMAIL,USER_TYPE = "SU", PASSWORD_SU= PASSWORD_SU, exp = exp, time = time)
            SU_Singup_registerlink_bravo(EMAIL=EMAIL, USERNAME=USERNAME,  token_id= token_SU)
            permission  = THEME_MODULE.objects.all()
            if permission:
                permission.delete()
            entry = [
                THEME_MODULE(USERID_THEME_OPT="000001", THEME_TYPE="MARS", MODEL_1="ARCHIVAL",MODEL_2="RETRIVAL", MODEL_3="SEARCH", MODEL_4="MODEL_4",MODEL_5="MODEL_5", MODEL_6="MODEL_6", MODEL_7="MODEL_7",MODEL_8="MODEL_8", MODEL_9="MODEL_9", MODEL_10="MODEL_10"),
                THEME_MODULE(USERID_THEME_OPT="000002", THEME_TYPE="AGRICULTURE", MODEL_1="NDVI",MODEL_2="STACK", MODEL_3="CLASSIFICATION", MODEL_4="MODEL_4",MODEL_5="MODEL_5", MODEL_6="MODEL_6", MODEL_7="MODEL_7",MODEL_8="MODEL_8", MODEL_9="MODEL_9", MODEL_10="MODEL_10"),
                THEME_MODULE(USERID_THEME_OPT="000003", THEME_TYPE="WATER", MODEL_1="NDWI",MODEL_2="FLOOD", MODEL_3="DROUGH", MODEL_4="MODEL_4",MODEL_5="MODEL_5", MODEL_6="MODEL_6", MODEL_7="MODEL_7",MODEL_8="MODEL_8", MODEL_9="MODEL_9", MODEL_10="MODEL_10"),
                THEME_MODULE(USERID_THEME_OPT="000004", THEME_TYPE="MINING", MODEL_1="SITE_MONITORING",MODEL_2="ILLEGAL_MINING_DETECTION", MODEL_3="STOCKPILE_MONITORING", MODEL_4="MODEL_4",MODEL_5="MODEL_5", MODEL_6="MODEL_6", MODEL_7="MODEL_7",MODEL_8="MODEL_8", MODEL_9="MODEL_9", MODEL_10="MODEL_10"),
                THEME_MODULE(USERID_THEME_OPT="000005", THEME_TYPE="DEFENCE", MODEL_1="MILITARY_STRATEGIC_PLANNING",MODEL_2="SPACE_TRAFFIC_MANAGEMENT", MODEL_3="PLANETARY_EXPLORATION", MODEL_4="MODEL_4",MODEL_5="MODEL_5", MODEL_6="MODEL_6", MODEL_7="MODEL_7",MODEL_8="MODEL_8", MODEL_9="MODEL_9", MODEL_10="MODEL_10")
            ]
            THEME_MODULE.objects.bulk_create(entry) 
            # self.stdout.write(self.style.SUCCESS(f'Token created: {PASSWORD}'))
        else:
            self.stdout.write(self.style.WARNING('Users already exist. Skipping token creation.'))
        
        # url = f'{settings.BASE_URL}/superuser/'

        


        
