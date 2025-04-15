from django.shortcuts import render,redirect, HttpResponse 
from django.http import HttpResponse
from django.db.models import Q, Subquery
from django.core.exceptions import ObjectDoesNotExist
import datetime
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.http import HttpRequest
from django.contrib import messages
from django.core.mail import send_mail
import uuid
from datetime import datetime, timedelta
from django.db.models import F
from django.forms.models import model_to_dict  #imp for module to dict #
from rest_framework import status, permissions
from .models import User_login_Data,Users_login_Details_Data,password_table
from .serializers import *
from rest_framework.response import Response
from .helpers import send_forget_password_mail
from .helpers import *
from django.contrib.auth.hashers import make_password, check_password
# Create your views here.
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.contrib.auth.decorators import user_passes_test
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from auditlog.registry import auditlog
from django.db import transaction
SECRET_KEY = settings.SECRET_KEY
import random
from django.http import Http404
from datetime import date, datetime
# from auditlog.registry import auditlog
import string
from auditlog.context import set_actor
import jwt
import datetime
from django.conf import settings
import io
from rest_framework import generics


def fty(request):
    return render(request, 'authentification/home.html')
def is_equivalent(val1, val2):
    # Treat None and empty string as equivalent
    return (val1 is None or val1 == '') and (val2 is None or val2 == '') or val1 == val2
### login api

class Third(Thread):
    def __init__(self, EMAIL, token, USERNAME, USER_TYPE):
        super().__init__()
        self.EMAIL = EMAIL
        self.token = token
        self.USERNAME = USERNAME
        self.USER_TYPE = USER_TYPE
    def run(self):
        try:
            result = User_login_Data.objects.get(USERNAME=self.USERNAME)

            if result.USER_TYPE == "AU":
                ad = result.ADMIN_TYPE  # Assuming ADMIN_TYPE field exists in result
                admin_type_short = (ad[0:2] if ad else "")+"AU" 
                user_type_display = admin_type_short
            else:
                user_type_display = result.USER_TYPE  
            send_forget_password_mail_admin_brevo(self.EMAIL, self.token, self.USERNAME, user_type_display)
            
        except Exception as e:
            print(f"Error occurred: {str(e)}")



def convert_dates_to_strings(d):
    for key, value in d.items():
        if "DOB" == key:
            if value:
                if isinstance(value, (date, datetime)):
                    d[key] = value.strftime('%Y-%m-%d')
            else:
                return d
    return d

def thim_check_value(data):
    try:
        theme_type = data.get("THEME_OPT")
        if theme_type:

            thim = theme_type[3:]  # Example: Extract part of the THEME_TYPE value
            theme_type_exists = THEME_MODULE.objects.filter(THEME_TYPE=thim).exists()
            if theme_type_exists:
                return data  # Return the data if theme type exists
            else:
                raise ValueError("You Can Not Use This THEME") # Return an error message
        else:
            return data  # Return an error if THEME_TYPE is missing
    except Exception as e:
        raise ValueError(str(e))


def create_custom_token(**kwarg):
    token = jwt.encode(kwarg, SECRET_KEY, algorithm='HS256')
    print("token",token)
    return token

def token_unhash(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except Exception as e:
        raise ValueError(str(e))

@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def forget_password(request):
    if request.method =="GET":
        USERNAME = request.GET.get("USERNAME")
        try:
            obj = User_login_Data.objects.get(USERNAME=request.GET.get("USERNAME"))
            if obj.USER_TYPE == "AU" and obj.SU_APRO_STAT=="APPROVED":
                return Response({"USER_TYPE": obj.USER_TYPE, "EMAIL":obj.EMAIL, "USERID":obj.USERID, "USERNAME":obj.USERNAME}, status=status.HTTP_200_OK)
            elif obj.USER_TYPE == "UU":
                if obj.AU_APRO_STAT=="APPROVED" and obj.SU_APRO_STAT=="APPROVED":
                    return Response({"USER_TYPE": obj.USER_TYPE, "EMAIL":obj.EMAIL, "USERID":obj.USERID, "USERNAME":obj.USERNAME}, status=status.HTTP_200_OK)
                else:
                    return Response({"errors": "You Have No Authority To Forget Password "}, status=status.HTTP_403_FORBIDDEN)
            elif obj.USER_TYPE == "SU":
                return Response({"USER_TYPE": obj.USER_TYPE, "EMAIL":obj.EMAIL, "USERID":obj.USERID, "USERNAME":obj.USERNAME}, status=status.HTTP_200_OK)
            elif obj.USER_TYPE == "GU" and obj.SU_APRO_STAT=="APPROVED":
                return Response({"USER_TYPE": obj.USER_TYPE, "EMAIL":obj.EMAIL, "USERID":obj.USERID, "USERNAME":obj.USERNAME}, status=status.HTTP_200_OK)
            else:
                return Response({"errors": "You Have No Authority To Forget Password"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors":"User Not Exist"}, status=status.HTTP_400_BAD_REQUEST)
    
    elif  request.method == "POST":
        user_info = request.data
        print(user_info)
        serializer = forget_pass_seria(data=user_info)
        if serializer.is_valid():
            x = serializer.validated_data['USERNAME']
            try:
                result = User_login_Data.objects.get(USERNAME=x)
                if result is None:
                    return Response({"errors":"User Not Present"}, status=status.HTTP_400_BAD_REQUEST)
                # q1 = result.Q1_AN
                # q2 = result.Q2_AN
                # if result.USER_TYPE=="UU":
                #     if not (q1 == user_info.get("Q1_AN").lower() and q2 == user_info.get("Q2_AN").lower()):
                #         return Response({"errors":"Please Provide Correct ANSWER"}, status=status.HTTP_403_FORBIDDEN)
                # if result.USER_TYPE == "AU" or result.USER_TYPE == "UU":
                if  result.USER_TYPE=="AU" and result.SU_APRO_STAT != "APPROVED":
                    return Response({"errors":"You Are Not Authorised To Forget Password"}, status=status.HTTP_400_BAD_REQUEST)
                token = ''.join(random.choice(string.digits) for _ in range(6))
                profile_obj, created = password_table.objects.get_or_create(USERID=result)
                if created:
                    profile_obj.forget_password_token = make_password(token)
                else:    
                    profile_obj.forget_password_token = make_password(token)
                    profile_obj.created_at = timezone.now()
                profile_obj.save()
                t1=Third(result.EMAIL, token, result.USERNAME, result.USER_TYPE)
                t1.start()
                    
                    # send_forget_password_mail_admin(result.EMAIL , token, result.USERNAME)
                return Response({"Message":"Please Cheak Email For Token", "token": token, "USERID":profile_obj.USERID_id, "time":5}, status=status.HTTP_200_OK)
                # else:
                #     return Response({"errors":"Invalid Response"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"errror":str(e)}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'errors': 'Method Not Allowed'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def update_password(request):
    if request.method == "GET":
        x = request.GET.get("token")
        y = request.GET.get("USERID")
        try:
            obj = password_table.objects.get(USERID_id=y)   #status=status.HTTP_400_BAD_REQUEST, status=status.HTTP_403_FORBIDDEN,status=status.HTTP_404_NOT_FOUND
            if check_password(x, obj.forget_password_token):
                current_time = timezone.localtime(timezone.now())
                created_time = timezone.localtime(obj.created_at)
                time_difference = current_time - created_time
                total_seconds = int(time_difference.total_seconds())
                remaining_seconds = max(0, 300 - total_seconds)
                minutes, seconds = divmod(remaining_seconds, 60)
                return Response({"Message": "Match The Credential", "time":{minutes:seconds}}, status=status.HTTP_200_OK)
            else:
                return Response({"errors": "Do Not Match The Credential"}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    elif request.method == "PATCH":
        password_data = request.data  #token, NEW_PASSWORD, PASSWORD
        keys_to_required = ["USERID", "token", "NEW_PASSWORD", "PASSWORD"]
        password_data_1 = {key: value for key, value in password_data.items() if key  in keys_to_required}
        try:
            obj = password_table.objects.get(USERID_id=password_data_1.get("USERID"))
            if check_password(password_data_1.get("token"), obj.forget_password_token):
                obj = password_table.objects.get(USERID_id = password_data_1.get("USERID"))
                USERID = obj.USERID_id
                obj = User_login_Data.objects.get(USERID = USERID) 
    
            else:
                  return Response({"errors": "Do Not Match The Credential"}, status=status.HTTP_200_OK)
        except:
            return Response({"errors":"Link Expired"}, status=status.HTTP_403_FORBIDDEN)
        if password_data_1.get("NEW_PASSWORD") != password_data_1.get("PASSWORD"):
            return Response({"errors":"Password Field Not Match"}, status=status.HTTP_403_FORBIDDEN)
        serializer = User_login_Data_serialiser112(data= {"PASSWORD":password_data_1.get("PASSWORD")})   #resource, data=request.data, partial=True
        try:
            validated_PASSWORD = serializer.validate_field('PASSWORD', password_data_1.get("PASSWORD"))      #validated_username = serializer.validate_field('USERNAME', data_to_validate['USERNAME'])
            # print("validated_PASSWORD", validated_PASSWORD)
            # break
        # except Exception as e:
        #     return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
    # Format the errors to a readable response
            formatted_errors = {key: value for key, value in e.detail.items()}
            return Response({"errors": formatted_errors}, status=status.HTTP_400_BAD_REQUEST)
        PASSWORD = make_password(validated_PASSWORD)
        User_login_Data.objects.filter(USERID=USERID).update(PASSWORD=PASSWORD, APRO_DATE = timezone.now())
        # password_change_mail(obj.EMAIL, obj.USERNAME)
        return Response({"Message":"Sucessfully Password Change", "data": validated_PASSWORD}, status=status.HTTP_200_OK)
    return Response({'errors':"Method Not Allow"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def register_general(request): #active
    if request.method =="GET":
        try:
            if request.user.USER_TYPE == "SU" or request.user.USER_TYPE == "AU":
                user = User_login_Data.objects.all().filter(USER_TYPE="GU").exclude(SU_APRO_STAT="DELETE")
            elif request.user.USER_TYPE == "GU":
                user = User_login_Data.objects.filter(USERNAME=request.user.USERNAME)
            else:
                return Response({"errors":"You Are Not Authorised"}, status=status.HTTP_403_FORBIDDEN)
            serializer_b = User_login_Data_serialiser112(user, many=True).data

            data_list = [
            {
            "USERNAME": i.get("USERNAME"),
            "EMAIL": i.get("EMAIL"),
            "MOBILE_NO": i.get("MOBILE_NO"),
            "USERID": i.get("USERID"),
             "CREATION_DATE": i.get("CREATION_DATE"),
            "USER_TYPE": i.get("USER_TYPE"),
            "SU_APRO_STAT": i.get("SU_APRO_STAT"),
            "APRO_DATE": i.get("APRO_DATE")
                }
                    for i in serializer_b
                ]
            return Response({"message": data_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return  Response({'errors': str(e)}, status=status.HTTP_403_FORBIDDEN)
    
    elif request.method =='POST':
        resister_info = request.data
        keys_to_remove = ["SU_APRO_STAT", "AU_APRO_STAT", "APRO_DATE", "SU_APRO_REM", "AU_APRO_REM", "THEME_OPT", "ADMIN_TYPE"]
        auth_register_info_1 = {key: value for key, value in resister_info.items() if key not in keys_to_remove}
        auth_register_info_1["USER_TYPE"] = "GU"
        auth_register_info_1['SU_APRO_STAT'] = "APPROVED"
        serializer = User_login_Data_serialiser112(data=auth_register_info_1,  context={'request': request})
        if serializer.is_valid():
            serializer.save()
            # GU_resister_mail(serializer.validated_data["EMAIL"], serializer.validated_data["USERNAME"])
            GU_resister_mail_bravo(serializer.validated_data["EMAIL"], serializer.validated_data["USERNAME"])
            return Response({"message": serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({"errors":serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method =="PATCH":  #patcxh===================================================
        auth_register_info = request.data
        auth_register_info.pop("CREATION_DATE", None)
        try:
            if request.user.USER_TYPE == "SU":
                keys_to_req = ["MOBILE_NO", "SU_APRO_REM", "SU_APRO_STAT"]
                user = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
                if user.USER_TYPE == "GU":
                    auth_register_info = {key: value for key, value in auth_register_info.items() if key  in keys_to_req}
                    if auth_register_info.get("SU_APRO_STAT"):
                        auth_register_info.pop("MOBILE_NO", None)
                        if not auth_register_info.get("SU_APRO_REM"):
                            return Response({"errors":"Required Remark Field"}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            pass
                else:
                    return Response({"errors":"Not A General User"}, status=status.HTTP_403_FORBIDDEN)
            elif request.user.USER_TYPE == "GU":
                keys_to_req = ["MOBILE_NO"]
                auth_register_info = {key: value for key, value in auth_register_info.items() if key  in keys_to_req}
                user = User_login_Data.objects.get(USERID= request.user.USERID) #Need change here
            else:
                return Response({'errors': 'Not Authorized SuperUser or GU'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"errors":str(e)}, status=status.HTTP_403_FORBIDDEN)
        if user:
            xc = model_to_dict(user)
            filtered_data_1 = {key: value for key, value in auth_register_info.items() if key in xc and  auth_register_info.get(key) != xc.get(key)}
            if filtered_data_1:
                serializer_a = User_login_Data_serialiser112(user, data= filtered_data_1, partial=True)
            else:
                return Response({"Message":"No Data Update"}, status=status.HTTP_200_OK)
        else:
            return Response({"errors":"No User Found"}, status=status.HTTP_403_FORBIDDEN)
        if serializer_a.is_valid():
                serializer_a.save(APRO_DATE = timezone.now())
                if filtered_data_1.get("SU_APRO_STAT"):
                    pass
                else:
                    remark = filtered_data_1.pop("SU_APRO_REM", None)
                    if not filtered_data_1:# and  (filtered_data.get("SU_APRO_REM") in [None, ""] or filtered_data.get("AU_APRO_REM") in [None, ""]):
                        if remark:
                            filtered_data = "You Recived Only Remark No Profile Update"
                            
                            mail_change_in_profile_AU_SU_brevo(user.EMAIL , user.USERNAME, filtered_data_1, remark, user.USER_TYPE)
                        else:
                            pass
                    else:
                        mail_change_in_profile_AU_SU_brevo(user.EMAIL, user.USERNAME, filtered_data_1, remark,  user.USER_TYPE)
                return Response({"message":"Edit Succesfully", "data":serializer_a.data}, status=status.HTTP_200_OK)
        else:
            return Response({"errors":serializer_a.errors}, status=status.HTTP_404_NOT_FOUND)   
        
    elif request.method =="DELETE":   #status=status.HTTP_204_NO_CONTENT
        if not request.user.USER_TYPE == "SU":
            return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)

            # return Response({"message": "User Not allowed"})
        auth_register_info = request.data
        print(auth_register_info.get("USERID"))
        try:
            user = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
            print(user)
        except Exception as e:
            return Response({"Message": f"User Not Exist. Error: {str(e)}"} , status=status.HTTP_400_BAD_REQUEST)
        if user.USER_TYPE == "GU":
            print("USER! DELETE")
            user.delete()
            return Response({'detail': 'User Deleted Successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'User Not GU '}, status=status.HTTP_400_BAD_REQUEST)
        
        
@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def login_user(request):
    if request.method == "POST":
        user_info = request.data
        serializer = login_seria(data=user_info)
        if serializer.is_valid():
            user_name = serializer.validated_data['USERNAME']
            user_password = serializer.validated_data['PASSWORD']
            try:
                user = User_login_Data.objects.get(USERNAME=user_name)
            except User_login_Data.DoesNotExist:
                return  Response({'errors': 'User Not Exist'}, status=status.HTTP_401_UNAUTHORIZED)
            if check_password(user_password, user.PASSWORD):
                    if user.USER_TYPE == "SU":
                        access_token = RefreshToken.for_user(user).access_token
                        refresh_token = RefreshToken.for_user(user)
                    elif user.USER_TYPE =="AU" and user.SU_APRO_STAT =="APPROVED" and user.AU_APRO_STAT =="INPROGRESS": #approved
                        access_token = RefreshToken.for_user(user).access_token
                        refresh_token = RefreshToken.for_user(user)
                        
                    elif user.USER_TYPE =="UU" and user.SU_APRO_STAT =="APPROVED" and user.AU_APRO_STAT=="APPROVED":
                        access_token = RefreshToken.for_user(user).access_token
                        refresh_token = RefreshToken.for_user(user)
                        refresh_token['USER_TYPE'] = 'UU'
                    elif user.USER_TYPE =="GU" and user.SU_APRO_STAT =="APPROVED":
                        access_token = RefreshToken.for_user(user).access_token
                        refresh_token = RefreshToken.for_user(user)
                    else:
                        return Response({'errors': 'You Are Block'}, status=status.HTTP_401_UNAUTHORIZED)
                    response_data = {
                    'message': 'Login successful',
                    'access_token': str(access_token),
                    'refresh_token': str(refresh_token),
                    'username':user.USERNAME,
                    'userType':user.USER_TYPE,
                    'userId':user.USERID,
                    'departmentType':user.ADMIN_TYPE
                    # 'THEME_OPT':user.THEME_OPT.THEME_TYPE
                }
                    return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({'errors': 'Password Incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'errors': 'Method Not Allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def user_authorized_function(request): #active
    if request.method == 'GET':
        try:
            if not (request.user.USER_TYPE == "SU" or request.user.USER_TYPE == "AU" or request.user.USER_TYPE == "UU"):
                return Response({'errors': 'Not Authorized SuperUser Or AdminUser'}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({'errors': 'User Not Authenticate'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        try:
            if request.user.USER_TYPE == "SU":# or 
                auth_register_info = request.query_params.get("USERID")
                obj = User_login_Data.objects.get(USERID= auth_register_info)
                if not obj.USER_TYPE =="AU":
                    return Response({"errors":"Not AU User"}, status=status.HTTP_403_FORBIDDEN)
                thim_opt = obj.THEME_OPT
                print("thim_opt", thim_opt)
                ADMIN_TYPE = obj.ADMIN_TYPE
                print("ADMIN_TYPE", ADMIN_TYPE)
                user_login_detail_data =  User_login_Data.objects.prefetch_related('logindata').filter(USER_TYPE="UU", THEME_OPT=thim_opt, ADMIN_TYPE= ADMIN_TYPE).exclude(Q(AU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="DELETE"))
                if request.query_params.get("COUNT") == "COUNT":
                    No_of_UU_user = user_login_detail_data.count()
                    if not No_of_UU_user:
                        return Response({"Count": 0}, status=status.HTTP_200_OK)
                    return Response({"Count": No_of_UU_user}, status=status.HTTP_200_OK)
                if not user_login_detail_data:
                    return Response({"errors":"No User Found"}, status=status.HTTP_200_OK)
            elif request.user.USER_TYPE == "AU":
                obj = User_login_Data.objects.get(USERID= request.user.USERID)
                thim_opt = obj.THEME_OPT
                ADMIN_TYPE = obj.ADMIN_TYPE
                user_login_detail_data =  User_login_Data.objects.prefetch_related('logindata').filter(USER_TYPE="UU", THEME_OPT=thim_opt, ADMIN_TYPE= ADMIN_TYPE).exclude(Q(AU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="DELETE"))
                if not user_login_detail_data:
                    return Response({"errors":"No User Found"}, status=status.HTTP_403_FORBIDDEN)
            elif request.user.USER_TYPE == "UU":
                user_login_detail_data = User_login_Data.objects.prefetch_related('logindata').filter(USERID= request.user.USERID)
                if not user_login_detail_data:
                    return Response({"errors":"No User Found"}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({"errors":"You Are Not Authorised"}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"errors": str(e)}, status=status.HTTP_403_FORBIDDEN)
        serializer_b = User_login_Data_serialiser112(user_login_detail_data, many=True).data
        # return Response({"edata":serializer_b})
        data_list = [
    {
        "USERID": i["USERID"],
        "USERNAME": i["USERNAME"],
        "EMAIL": i["EMAIL"],
        "MOBILE_NO": i["MOBILE_NO"],
        "Theme_Section": i.get("VIEW_thim",{}).get("THEME_TYPE"),
        "ADMIN_TYPE": i["ADMIN_TYPE"],
        "CREATION_DATE": i["CREATION_DATE"],
        "USER_TYPE": i["USER_TYPE"],
        "SU_APRO_STAT": i["SU_APRO_STAT"],
        "AU_APRO_STAT": i["AU_APRO_STAT"],
        "SU_APRO_REM": i["SU_APRO_REM"],
        "AU_APRO_REM": i["AU_APRO_REM"],
        "APRO_DATE": i["APRO_DATE"],
        **(
        {
            "FIRST_NAME": i.get("logindata", {}).get("FIRST_NAME"),
            "MIDDLE_NAME": i.get("logindata", {}).get("MIDDLE_NAME"),
            "LAST_NAME": i.get("logindata", {}).get("LAST_NAME"),
            "ORGANIZATION": i.get("logindata", {}).get("ORGANIZATION"),
            "DESIGNATION": i.get("logindata", {}).get("DESIGNATION"),
            "CITY": i.get("logindata", {}).get("CITY"),
            "STATE": i.get("logindata", {}).get("STATE"),
            "COUNTRY": i.get("logindata", {}).get("COUNTRY"),
            "LAN_LINE": i.get("logindata", {}).get("LAN_LINE"),
            "ALT_EMAIL": i.get("logindata", {}).get("ALT_EMAIL"),
            "OFF_LOCA": i.get("logindata", {}).get("OFF_LOCA"),
            "ADDRESS_1": i.get("logindata", {}).get("ADDRESS_1"),
            "ADDRESS_2": i.get("logindata", {}).get("ADDRESS_2"),
            "GENDER": i.get("logindata", {}).get("GENDER"),
            "DOB": i.get("logindata", {}).get("DOB"),
            "PIN_CODE": i.get("logindata", {}).get("PIN_CODE"),
            "UU_REM": i.get("logindata", {}).get("UU_REM"),
        } if "logindata" in i and i["logindata"] is not None else {}
        ),
        "PERMISSION": {                #
            value: i.get("VIEW_PERMISSION", {}).get(key)
            for key, value in i.get("VIEW_PERMISSION", {}).get("VIEW_Thims", {}).items()
            if key.startswith("MODEL_") and not value.startswith("MODEL_")
        } if "VIEW_PERMISSION" in i and "VIEW_Thims" in i["VIEW_PERMISSION"] else {}
    }
    for i in serializer_b
]
        return Response({"message":data_list}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        keys_to_required = ["USERNAME", "EMAIL", "MOBILE_NO", "USER_TYPE", "THEME_OPT", "ADMIN_TYPE", "PASSWORD"]
        key_re2 = ["FIRST_NAME", "MIDDLE_NAME", "LAST_NAME","ADDRESS_2","ADDRESS_1","PIN_CODE", "UU_REM","DOB","GENDER","COUNTRY", "STATE", "CITY", "ORGANIZATION", "DESIGNATION", "ALT_EMAIL", "LAN_LINE","OFF_LOCA"]
        try:
            auth_register_info = request.data
            opt = auth_register_info.get("Theme_Section")
            if not opt:
                return Response({"errors":"Required Theme_Section"}, status=status.HTTP_403_FORBIDDEN)
            try:
                THEME_OPT = THEME_MODULE.objects.get(THEME_TYPE=opt)
                print("THEME_OPT", THEME_OPT)
                auth_register_info["THEME_OPT"] = THEME_OPT.USERID_THEME_OPT
                print("auth_register_info", auth_register_info)
            except Exception as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            logindata = auth_register_info.get("logindata", {})
            data_req = {key: auth_register_info[key] for key in keys_to_required if key in auth_register_info}
            if data_req.get("USER_TYPE") == "UU":
                filtered_logindata = {key: logindata[key] for key in key_re2 if key in logindata}
                if filtered_logindata:
                    data_req['logindata'] = filtered_logindata
                    data_req["AU_APRO_STAT"] = "INPROGRESS"
                    data_req["SU_APRO_STAT"] = "APPROVED"
                serializer_a = User_login_Data_serialiser112(data=data_req, context={'USER_TYPE': "UU", 'request':request})  
                if serializer_a.is_valid():
                    serializer_a.save()
                    UU_register_mail_bravo(data_req.get("EMAIL"), data_req.get("USERNAME"))
                    return Response({'message':'Authorized User Created Succesfully', 'response_data':serializer_a.data}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)  
            else:
                return Response({'errors': 'You Are Not Eligible For Signup'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'errors': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method =="PUT":
        try:
            if request.user.USER_TYPE == "GU":
                auth_register_info = request.data
                opt = auth_register_info.get("Theme_Section")
                try:
                    THEME_OPT = THEME_MODULE.objects.get(THEME_TYPE=opt)
                    print("THEME_OPT", THEME_OPT)
                    auth_register_info["THEME_OPT"] = THEME_OPT.USERID_THEME_OPT
                    print("auth_register_info", auth_register_info)
                except Exception as e:
                    return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                user = User_login_Data.objects.get(USERNAME=request.user.USERNAME)
                if user.USERID != auth_register_info.get("USERID") or user.USERNAME != auth_register_info.get("USERNAME") or user.EMAIL != auth_register_info.get("EMAIL"):
                    return Response({"errors": "USRID OR USERNAME OR EMAIL NOT SAME"}, status=status.HTTP_400_BAD_REQUEST)
                auth_register_info.update({"SU_APRO_STAT":"APPROVED", "AU_APRO_STAT":"INPROGRESS", "USER_TYPE":"UU", "SU_APRO_REM":None,"AU_APRO_REM":None})
                logindata = auth_register_info.get("logindata", {})
                if  logindata is None or not logindata:
                    return Response({"errors":"Logindata Is Required"}, status=status.HTTP_400_BAD_REQUEST)
                serializer_a = User_login_Data_serialiser112(instance=user, data=auth_register_info, partial=True ,context={'USER_TYPE': "UU", 'request':request})
                if serializer_a.is_valid():
                    serializer_a.save(APRO_DATE = timezone.now())
                    # UU_register_mail_bravo(user.EMAIL, user.USERNAME)
                    GU_to_UU_UPGRADATION_mail_bravo(user.EMAIL, user.USERNAME)
                    return Response({"Message": "User Update Successfully"}, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"errors":"You Are Not Authorised"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method =="PATCH":  #patcxh===================================================
        auth_register_info = request.data
        auth_register_info.pop("CREATION_DATE", None)
        logindata = auth_register_info.pop("logindata", {})
        VIEW_PERMISSION = auth_register_info.pop("PERMISSION", {})
        initiate_login = None
        filtered_data = {}
        obj = None
        try:
            if request.user.USER_TYPE == "SU":     
                logindata = {}
                try:
                    user = User_login_Data.objects.select_related('logindata').get(USERID=auth_register_info.get("USERID"))
                # auth_register_info = request.data
                    if auth_register_info.get("SU_APRO_STAT"):
                        key_req = ["SU_APRO_STAT", "SU_APRO_REM"]
                        
                        auth_register_info = {key : value for key, value in  auth_register_info.items() if key in key_req}
                    else:
                        # key_req = ["MOBILE_NO", "SU_APRO_REM"]
                        auth_register_info = {}
                    #     if logindata:
                    #         try:
                    #             obj = user.logindata
                    #             print("Related logindata found:", logindata)
                    #         except Users_login_Details_Data.DoesNotExist:
                    #             print("No related logindata found.")
                    #             obj = None
                    #             pass
                            # obj, created = Users_login_Details_Data.objects.get_or_create(USERID_id=user.USERID)
                except Exception as e:
                    return Response({"errors": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
            elif request.user.USER_TYPE == "AU":
                logindata = {}
                try:
                    user = User_login_Data.objects.select_related('logindata').get(USERID=auth_register_info.get("USERID"))
                    if user is None or user.USER_TYPE != "UU":
                        return  Response({"errors":"You Not Authorised To Change In Authorised User Profile"}, status=status.HTTP_403_FORBIDDEN)
                except Exception as e:
                    return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                if auth_register_info.get("AU_APRO_STAT"):
                    key_req = ["AU_APRO_STAT", "AU_APRO_REM"]
                    # logindata = {}
                    auth_register_info = {key : value for key, value in  auth_register_info.items() if key in key_req}
                else:
                    # key_req = ["AU_APRO_REM", "MOBILE_NO"]
                    auth_register_info = {}
                #     if logindata:
                #         try:
                #             obj = user.logindata
                #         except Users_login_Details_Data.DoesNotExist:
                #             obj = None
                #             pass
                        # obj, created = Users_login_Details_Data.objects.get_or_create(USERID_id=user.USERID)
                if ((user.THEME_OPT) != (request.user.THEME_OPT)) or (user.ADMIN_TYPE != request.user.ADMIN_TYPE) and user.USER_TYPE != "UU":
                    return Response({"errors":"You Not Authorised To Change In Authorised User Profile"}, status=status.HTTP_403_FORBIDDEN)
                if VIEW_PERMISSION:
                    print("user.THEME_OPT", user.THEME_OPT.USERID_THEME_OPT)
                    thim = THEME_MODULE.objects.get(USERID_THEME_OPT=user.THEME_OPT.USERID_THEME_OPT)
                    tm = model_to_dict(thim)
                    permission_dict = {key: VIEW_PERMISSION[tm[key]] for key in tm if tm[key] in VIEW_PERMISSION}
                    permission_obj = MODUL_VIEW_PERMISSION.objects.filter(USERID=user.USERID).first()
                    if permission_obj:
                        key_remove = ["THEME_MODULE","USERID", "AU_ID"]
                        pr = model_to_dict(permission_obj)
                        VIEW_PERMISSION = {key: value for key, value in permission_dict.items() if key not in key_remove and  permission_dict.get(key) != pr.get(key)}
                        if VIEW_PERMISSION:
                            VIEW_PERMISSION["AU_ID"] = request.user.USERID
                            filtered_data["VIEW_PERMISSION"] = VIEW_PERMISSION
                        else:
                            pass
                    else:
                        filtered_data["VIEW_PERMISSION"] = permission_dict
            elif request.user.USER_TYPE == "UU":
                key_req = ["MOBILE_NO"]
                auth_register_info = {key : value for key, value in  auth_register_info.items() if key in key_req}
                user = User_login_Data.objects.select_related('logindata').get(USERID=request.user.USERID)
                if logindata:
                    try:
                        obj = user.logindata
                        print("Related Logindata Found:", logindata)
                    except Users_login_Details_Data.DoesNotExist:
                        obj = None
                        print("No Related Logindata Found.")
                        pass
                    # obj  = Users_login_Details_Data.objects.filter(USERID_id=user.USERID).first()
                    # auth_register_info = {key : value for key, value in  auth_register_info.items() if key in key_req}
            else:
                return Response({"errors":"You Are Not Authorised"}, status=status.HTTP_403_FORBIDDEN)
            if user is  None:
                return Response({"errors":"No UU User Found"}, status=status.HTTP_403_FORBIDDEN)
            
                # obj = Users_login_Details_Data.objects.get(USERID_id=user.USERID)
            
            if auth_register_info:
                xc = model_to_dict(user)
                filtered_data_1 = {key: value for key, value in auth_register_info.items() if key in xc and not is_equivalent(xc.get(key), value)} #not is_equivalent(xc.get(key), value)   auth_register_info.get(key) != xc.get(key)
                filtered_data.update(filtered_data_1)
            
            if logindata:
                if obj:
                    yc = model_to_dict(obj)
                    yc = convert_dates_to_strings(yc)
                else:
                    yc = {}
                    initiate_login = "Method_change"    #it requre request to be POST if yc is empty going to create New instance in profile
                filtered_logindata = {key: value for key, value in logindata.items() if  not is_equivalent(yc.get(key), value)}   #logindata.get(key) != yc.get(key)
                print("filtered_logindata111", filtered_logindata)
                if filtered_logindata:
                    filtered_data["logindata"] = filtered_logindata
            if filtered_data:
                # filtered_data["USER_TYPE"] = "UU"
                serializer_a = User_login_Data_serialiser112(user, data= filtered_data, partial=True, context={'USER_TYPE': "UU", 'request':request, "initiate_login":initiate_login}, caller=request.user.USER_TYPE) #User_login_Data_serialiser112(data=data_req, context={'USER_TYPE': "UU", 'request':request}) 
                if serializer_a.is_valid():# and serializer_b.is_valid():
                    serializer_a.save(APRO_DATE = timezone.now())
                    filtered_data.pop("VIEW_PERMISSION",{})
                    if filtered_data.get("SU_APRO_STAT") or filtered_data.get("AU_APRO_STAT"):
                        pass
                    else:
                        if request.user.USER_TYPE == "SU":
                            remark = filtered_data.pop("SU_APRO_REM", None)
                        elif request.user.USER_TYPE == "AU":
                            remark = filtered_data.pop("AU_APRO_REM", None)
                        elif request.user.USER_TYPE == "UU":
                            remark = None
                            pass
                        else:
                            pass
                        if not filtered_data:# and  (filtered_data.get("SU_APRO_REM") in [None, ""] or filtered_data.get("AU_APRO_REM") in [None, ""]):
                            if remark:
                                filtered_data = "You Recived Only Remark No Profile Update"
                                mail_change_in_profile_AU_SU_brevo(user.EMAIL , user.USERNAME, filtered_data, remark, user.USER_TYPE)
                            else:
                                pass
                        else:
                            mail_change_in_profile_AU_SU_brevo(user.EMAIL , user.USERNAME, filtered_data, remark,user.USER_TYPE)
                    return Response({"message":"Edit Succesfully", "data":serializer_a.data}, status=status.HTTP_200_OK)
                else:
                    return Response({"errors":serializer_a.errors}, status=status.HTTP_404_NOT_FOUND)   
            else:
                return Response({"message":"No data Update"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"errors":str(e)}, status=status.HTTP_404_NOT_FOUND)   

            
    elif  request.method =="DELETE":   
        if not request.user.USER_TYPE == "SU":
            return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)   
        auth_register_info = request.data
        try:
            user = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        if user.USER_TYPE == "UU":
            # status_ST = "DELETE"
            # reason = "-"
            # OPT = user.THEME_OPT[3:]
            # print(OPT)
            # print("UU_"+OPT)
            # obj = User_login_Data.objects.all().filter(THEME_OPT="UU_"+OPT)
            # EMAIL_Query = user.values_list('EMAIL', flat=True)
            # EMAIL_ALL = list(EMAIL_Query)
            user.delete()
            return Response({'detail': 'User Deleted Successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def admin_function(request):          # active
    if request.method == 'GET':
        if request.query_params.get('admin_token_body'):
            try:
                decoded = token_unhash(request.query_params.get('admin_token_body'))
                print(f"Decoded Token: {decoded}")  #ValueError as ve
            except ValueError as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"timer":(decoded.get("exp")-int(timezone.now().timestamp()))/60}, status=status.HTTP_200_OK)
        try:
            if not (request.user.USER_TYPE == "SU" or request.user.USER_TYPE == "AU"):
                return Response({'errors': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({'errors': 'User Not Authenticate'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user.USER_TYPE == "SU":
            filter_condition = {"USER_TYPE":"AU"}
            if request.query_params.get('ADMIN_TYPE'):
                filter_condition["ADMIN_TYPE"] = request.query_params.get('ADMIN_TYPE')
            if request.query_params.get('USERID'):
                filter_condition["USERID"] = request.query_params.get('USERID')
            # if request.q
            user_login_detail_data =  User_login_Data.objects.prefetch_related('logindata').filter(**filter_condition).exclude(Q(SU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="REPLACE"))# SU_APPROVE AND AU_APPROVE Not consider yet

        elif request.user.USER_TYPE == "AU":
            user_login_detail_data =  User_login_Data.objects.prefetch_related('logindata').filter(USERID=request.user.USERID)
        else:
            pass
        serializer_b = User_login_Data_serialiser112(user_login_detail_data, many=True).data   #New Added
        data_list = [
    {
        "USERNAME": i["USERNAME"],
        "EMAIL": i["EMAIL"],
        "MOBILE_NO": i["MOBILE_NO"],
        "USERID": i["USERID"],
        "Theme_Section": i.get("VIEW_thim",{}).get("THEME_TYPE"),
        "ADMIN_TYPE": i["ADMIN_TYPE"],  #"THEME_OPT": i["THEME_OPT"],
        "CREATION_DATE": i["CREATION_DATE"],
        "USER_TYPE": i["USER_TYPE"],
        "SU_APRO_STAT": i["SU_APRO_STAT"],
        "SU_APRO_REM": i["SU_APRO_REM"],
        "APRO_DATE": i["APRO_DATE"],
        **(
            {
            "FIRST_NAME": i.get("logindata", {}).get("FIRST_NAME"),
            "MIDDLE_NAME": i.get("logindata", {}).get("MIDDLE_NAME"),
            "LAST_NAME": i.get("logindata", {}).get("LAST_NAME"),
            "ORGANIZATION": i.get("logindata", {}).get("ORGANIZATION"),
            "DESIGNATION": i.get("logindata", {}).get("DESIGNATION"),
            "CITY": i.get("logindata", {}).get("CITY"),
            "STATE": i.get("logindata", {}).get("STATE"),
            "COUNTRY": i.get("logindata", {}).get("COUNTRY"),
            "LAN_LINE": i.get("logindata", {}).get("LAN_LINE"),
            "ALT_EMAIL": i.get("logindata", {}).get("ALT_EMAIL"),
            "OFF_LOCA": i.get("logindata", {}).get("OFF_LOCA"),
        } if "logindata" in i and i["logindata"] is not None else {}
        )
    }
    for i in serializer_b
]
        return Response({"message":data_list}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if request.query_params.get('admin_resend_link') == "resend_link":

            if  request.user.USER_TYPE == "SU":
                data = request.data
                if data.get("SU_APRO_STAT") == "PENDING":
                    try:
                        obj = User_login_Data.objects.get(USERID=data.get("USERID"))
                        if obj.SU_APRO_STAT == "PENDING":
                            try:
                                current_time =  timezone.now() #+ datetime.timedelta(minutes=5)
                                time= int(current_time.timestamp())
                                exp = int((current_time + timedelta(minutes=5)).timestamp())
                            except Exception as e:
                                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            special_chars = "!@#$%^&*"
                            letters = string.ascii_letters
                            digits = string.digits
                            password_list = [random.choice(special_chars), random.choice(letters), random.choice(digits)]
                            remaining_length = 5
                            password_list.extend(random.choice(letters + digits + special_chars) for _ in range(remaining_length))
                            random.shuffle(password_list)
                            PASSWORD_AU = ''.join(password_list)
                            obj.PASSWORD = make_password(PASSWORD_AU)
                            obj.save()
                            try:
                                ad = obj.ADMIN_TYPE
                                admin_type_short = (ad[0:2] if ad else "") +"AU" 
                                token_admin = create_custom_token(USERNAME=obj.USERNAME, PASSWORD= PASSWORD_AU, exp = exp, time = time,admin_type_short=admin_type_short)
                                ad = obj.ADMIN_TYPE
                                admin_type_short = (ad[0:2] if ad else "") +"AU" 
                                register_admin_mail_bravo(obj.EMAIL,obj.USERNAME,token_admin,obj.THEME_OPT, admin_type_short)
                            except Exception as e:
                                return Response({"errors":str(e)} , status=status.HTTP_400_BAD_REQUEST)
                            return Response({'message':'Admin Link Send Succesfully', "token_admin":token_admin}, status=status.HTTP_200_OK)
                        else:
                            return Response({'message':'Not Allowed'}, status=status.HTTP_200_OK)
                    except Exception as e:
                        return Response({"errors":str(e)} , status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)

        #     try:  "SU_APRO_STAT"] = "PENDING"
        #         decoded = token_unhash(request.query_params.get('admin_token_body'))
        #         print(f"Decoded Token: {decoded}")  #ValueError as ve
        #         data = decoded.get("data")
        #     except ValueError as e:
        #         return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
        #     # data = decoded.get("data")
        #     data["PASSWORD"] =  request.data.get("PASSWORD")
        #     serializer_a = User_login_Data_serialiser112(data=data)  #, context={'request': request}
        #     if serializer_a.is_valid():
        #     # return Response({'message':'Admin Created Succesfully', 'response_data':data_req})
        #         validated_data = serializer_a.validated_data
        #         validated_data["PASSWORD"] = make_password(validated_data["PASSWORD"])
        #         serializer_a.save()
        #     else:
        #         return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)  
        #     return Response({"Message":"Admin created Succesfully","data":serializer_a.data}, status=status.HTTP_200_OK)

        keys_to_required = ["USERNAME", "EMAIL", "MOBILE_NO", "USER_TYPE", "THEME_OPT", "ADMIN_TYPE"]
        key_re2 = ["FIRST_NAME", "MIDDLE_NAME", "LAST_NAME", "COUNTRY", "STATE", "CITY", "ORGANIZATION", "DESIGNATION", "ALT_EMAIL", "LAN_LINE","OFF_LOCA"]
        try:
            if not request.user.USER_TYPE == "SU":
                return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({'message': 'User Not Authenticate'}, status=status.HTTP_403_FORBIDDEN)
        auth_register_info = request.data
        opt = auth_register_info.get("Theme_Section")
        if not opt:
            return Response({"errors":"Required Theme_Section"}, status=status.HTTP_403_FORBIDDEN)
        try:
            THEME_OPT = THEME_MODULE.objects.get(THEME_TYPE=opt)
            print("THEME_OPT", THEME_OPT)
            auth_register_info["THEME_OPT"] = THEME_OPT.USERID_THEME_OPT
            print("auth_register_info", auth_register_info)
        except Exception as e:
            return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
        token_get = request.query_params.get('token')
        if token_get:
            try:
                decoded = jwt.decode(request.query_params.get('token'), SECRET_KEY, algorithms=['HS256'])
                print(f"Decoded Token: {decoded}")
            except jwt.ExpiredSignatureError:
                print("Token has expired")
                return Response({"detail": "Token Has Expired"}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.InvalidTokenError:
                print("Invalid token")
                return Response({"detail": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)
            
            try:
                obj = User_login_Data.objects.filter(USERID = decoded.get("USERID"), THEME_OPT=decoded.get("THEME_OPT"), ADMIN_TYPE=decoded.get("ADMIN_TYPE")).filter(
                                    Q(SU_APRO_STAT="APPROVED") | Q(SU_APRO_STAT="BLOCKED") | Q(SU_APRO_STAT="PENDING")).first()   #, USER_TYPE="AU", THEME_OPT__exact=decoded.get("THEME_OPT"), AU_APRO_STAT__exact="INPROGRESS", 
                                                     #ADMIN_TYPE=decoded.get("ADMIN_TYPE")).filter(Q(SU_APRO_STAT="APPROVED") | Q(SU_APRO_STAT="BLOCKED") | Q(SU_APRO_STAT="PENDING"))  #block, APPROVE,PENDING
                if obj is None:
                    return Response({"errors":"No Admin Found With Token Info"}, status=status.HTTP_403_FORBIDDEN)
                else:
                    print("sdfdfdfd", obj.ADMIN_TYPE)
                    print("nnnnnnnnn", decoded.get("ADMIN_TYPE"))
                    if obj.USER_TYPE=="AU" and obj.THEME_OPT.USERID_THEME_OPT == auth_register_info.get("THEME_OPT") and obj.ADMIN_TYPE == auth_register_info.get("ADMIN_TYPE"):
                        pass
                #     pass
                # if obj.USER_TYPE=="AU" and obj.THEME_OPT.USERID_THEME_OPT == auth_register_info.get("THEME_OPT") and obj.ADMIN_TYPE == decoded.get("ADMIN_TYPE") and obj.SU_APRO_STAT in ["APPROVED", "BLOCKED", "PENDING"]:
                #     auth_register_info[""]
                #     pass
                    else:
                        return Response({"errors":"Not Authorised With Different Theme"}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except Exception as e:
                return Response({"errors":{e}}, status=status.HTTP_403_FORBIDDEN)
        else:
            list_value = User_login_Data.objects.filter(USER_TYPE= "AU").exclude(Q(SU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="REPLACE")).values_list('THEME_OPT', 'ADMIN_TYPE')
            if list_value:
                if (auth_register_info.get("THEME_OPT"), auth_register_info.get("ADMIN_TYPE")) in list_value:# and :
                    return Response({"errors":"You Cannot Create A User With A Theme That Already Exists."}, status=status.HTTP_403_FORBIDDEN)
                else:
                    pass
        data_req = {key: auth_register_info[key] for key in keys_to_required if key in auth_register_info}
        logindata = auth_register_info.get("logindata", {})
        filtered_logindata = {key: logindata[key] for key in key_re2 if key in logindata}
        if filtered_logindata:
            data_req['logindata'] = filtered_logindata
            data_req["AU_APRO_STAT"] = "INPROGRESS"
            data_req["SU_APRO_STAT"] = "PENDING"
            data_req["USER_TYPE"] = "AU"
        serializer_a = User_login_Data_serialiser112(data=data_req, context={'request': request})
        if serializer_a.is_valid():
            # return Response({'message':'Admin Created Succesfully', 'response_data':data_req})
            serializer_a.save()
            try:
                current_time =  timezone.now() #+ datetime.timedelta(minutes=5)
                time= int(current_time.timestamp())
                exp = int((current_time + timedelta(minutes=5)).timestamp())
            except Exception as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            # special_chars = "!@#$%^&*"
            # letters = string.ascii_letters
            # digits = string.digits
            # password_list = [random.choice(special_chars), random.choice(letters), random.choice(digits)]
            # remaining_length = 5
            # password_list.extend(random.choice(letters + digits + special_chars) for _ in range(remaining_length))
            # random.shuffle(password_list)
            # PASSWORD = ''.join(password_list)
            # print(PASSWORD,  len(PASSWORD))
            PASSWORD = serializer_a._password_au
            print("hash_PASSWORD", PASSWORD)
            print(serializer_a.data)
            ad = auth_register_info.get("ADMIN_TYPE")
            admin_type_short =  (ad[0:2] if ad else "") +"AU" 
            token_admin = create_custom_token(USERNAME=data_req.get("USERNAME"), PASSWORD= PASSWORD, exp = exp, time = time, admin_type_short=admin_type_short)
            register_admin_mail_bravo(data_req.get("EMAIL"),data_req.get("USERNAME"),token_admin,opt, admin_type_short)
            
            if token_get:
                obj.SU_APRO_STAT = decoded.get("SU_APRO_STAT")
                obj.SU_APRO_REM = decoded.get("SU_APRO_REM")
                obj.save()
                # USER_TYPE_AU = "ADMIN_USER"
                # ad = auth_register_info.get("ADMIN_TYPE")
                # admin_type_short =  (ad[0:2] if ad else "") +"AU" 
                send_account_deletion_email_bravo(obj.EMAIL, obj.USERNAME, admin_type_short) #(EMAIL, USERNAME, USER_TYPE,reson
            # return Response({'message':'Admin Created Succesfully', 'response_data':serializer_a.data}, status=status.HTTP_201_CREATED)
            return Response({'message':'Admin Token Send Succesfully', 'response_data':data_req, "token_admin":token_admin}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)  
    

    elif request.method =="PATCH":  #patcxh===================================================
        try:
            auth_register_info = request.data
            auth_register_info.pop("CREATION_DATE", None)
            logindata = auth_register_info.pop("logindata", {})
            user_detail = None
            if  request.user.USER_TYPE == "SU":
                logindata = {}
                user = User_login_Data.objects.select_related('logindata').get(USERID=auth_register_info.get("USERID"))
                if auth_register_info.get("SU_APRO_STAT"):
                    # user_detail = None
                    key_req = ["SU_APRO_STAT", "USERID", "SU_APRO_REM"]
                    
                    auth_register_info = {key : value for key, value in  auth_register_info.items() if key in key_req}
                    if auth_register_info.get("SU_APRO_STAT") == "DELETE" or auth_register_info.get("SU_APRO_STAT") == "REPLACE":
                        if not auth_register_info.get("SU_APRO_REM"):
                            return Response({"errors":"SU_APRO_REM Field Is Required"}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            try:
                                serializer = User_login_Data_serialiser112(data= {"SU_APRO_REM":auth_register_info.get("SU_APRO_REM")}).validate_field('SU_APRO_REM', auth_register_info.get("SU_APRO_REM"))
                            except Exception as e:
                                return Response({"errors":"SU_APRO_REM Not More That 100 Charector"},status=status.HTTP_400_BAD_REQUEST)
                        obj_user = User_login_Data.objects.filter(USER_TYPE ="UU", ADMIN_TYPE=user.ADMIN_TYPE, THEME_OPT=user.THEME_OPT.USERID_THEME_OPT).exclude(Q(SU_APRO_STAT="DELETE") | Q(AU_APRO_STAT="DELETE")).count()
                        if obj_user:
                            try:
                                current_time =  timezone.now() #+ datetime.timedelta(minutes=5)
                                time= int(current_time.timestamp())
                                exp = int((current_time + timedelta(minutes=5)).timestamp())
                            except Exception as e:
                                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            token_admin = create_custom_token(USERID=user.USERID, SU_APRO_STAT=auth_register_info.get("SU_APRO_STAT") , THEME_OPT=user.THEME_OPT.USERID_THEME_OPT,SU_APRO_REM=auth_register_info.get("SU_APRO_REM") , ADMIN_TYPE=user.ADMIN_TYPE, exp = exp, time = time)
                            return Response({"errors": "You Not Able To Delete Please Replace", "Count":obj_user, "token":token_admin}, status=status.HTTP_200_OK)
                        else:
                        # block_admin_mail(user.EMAIL, auth_register_info.get("SU_APRO_STAT"),  validated_data.get("SU_APRO_REM"), instance.USERNAME)
                            if auth_register_info.get("SU_APRO_STAT") == "REPLACE":
                                try:
                                    current_time =  timezone.now() #+ datetime.timedelta(minutes=5)
                                    time= int(current_time.timestamp())
                                    exp = int((current_time + timedelta(minutes=5)).timestamp())
                                except Exception as e:
                                    return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                                token_admin = create_custom_token(USERID=user.USERID, SU_APRO_STAT=auth_register_info.get("SU_APRO_STAT"), THEME_OPT=user.THEME_OPT.USERID_THEME_OPT,SU_APRO_REM=auth_register_info.get("SU_APRO_REM"), ADMIN_TYPE=user.ADMIN_TYPE, exp = exp, time = time)
                                return Response({"errors": "Replace Account", "Count":0, "token":token_admin}, status=status.HTTP_200_OK)
                            else:
                                pass
                else:
                    # key_req = ["MOBILE_NO", "SU_APRO_REM"]
                    auth_register_info = {}
                #     try:
                #         user_detail = user.logindata
                #         print("Related logindata found:", logindata)
                #     except Users_login_Details_Data.DoesNotExist:
                #         print("No related logindata found.")
                #         user_detail = None
                #         pass
                    # user_detail, created = Users_login_Details_Data.objects.get_or_create(USERID_id=user.USERID)
                if user is  None:
                    return Response({"errors":"No Admin Found"}, status=status.HTTP_403_FORBIDDEN)
                
            elif request.user.USER_TYPE == "AU":
                kes_req = ["MOBILE_NO"]
                auth_register_info = {key: value for key, value in auth_register_info.items() if key  in kes_req}
                user = User_login_Data.objects.select_related('logindata').get(USERID= request.user.USERID)
                try:
                    user_detail = user.logindata
                    print("Related Logindata Found:", logindata)
                except Users_login_Details_Data.DoesNotExist:
                    print("No Related Logindata Found.")
                    user_detail = None
                    pass
                # user_detail, created = Users_login_Details_Data.objects.get_or_create(USERID_id=user.USERID)
            else:
                return Response({"errors": "You Are Not Allowed"}, status=status.HTTP_403_FORBIDDEN)

            # obj = Users_login_Details_Data.objects.get(USERID_id=user.USERID)
        except Exception as e:
            return Response({"errors":"User Not Allowed"}, status=status.HTTP_403_FORBIDDEN)
        xc = model_to_dict(user)
        if user_detail:
            yc = model_to_dict(user_detail)
        else:
            yc = {}
        filtered_data = {key: value for key, value in auth_register_info.items() if key in xc and  not is_equivalent(xc.get(key), value)}  #auth_register_info.get(key) != xc.get(key)
        filtered_logindata = {key: value for key, value in logindata.items() if  not is_equivalent(yc.get(key), value)}  #is_equivalent(model_to_dict(user_detail).get(key), value)   and logindata.get(key) != yc.get(key)
        if filtered_logindata:
            filtered_data["logindata"] = filtered_logindata

        if filtered_data:
            if filtered_data.get("SU_APRO_STAT"):
                filtered_data["SU_APRO_REM"] = auth_register_info.get("SU_APRO_REM", None)
            
            serializer_a = User_login_Data_serialiser112(user, data=filtered_data, partial=True)
            
            if serializer_a.is_valid():
                serializer_a.save(APRO_DATE=timezone.now())
                # Determine user type display
                if request.user.USER_TYPE == "SU":
                    remark = filtered_data.pop("SU_APRO_REM", None)
                    ad = user.ADMIN_TYPE if user.ADMIN_TYPE else ""  
                    admin_type_short = (ad[0:2] if ad else "") + "AU"  # Display in the format "wcau"
                    user_type_display = admin_type_short
                elif request.user.USER_TYPE == "AU":
                    remark = filtered_data.pop("AU_APRO_REM", None)
                    ad = user.ADMIN_TYPE if user.ADMIN_TYPE else ""  # Assuming ADMIN_TYPE exists in user
                    admin_type_short = (ad[0:2] if ad else "")+"AU" 
                    user_type_display = admin_type_short
                else:
                    user_type_display = request.user.USER_TYPE
                if not filtered_data:
                    if remark:
                        filtered_data = "You Received Only Remark, No Profile Update."
                        mail_change_in_profile_AU_SU_brevo(user.EMAIL, user.USERNAME, filtered_data, remark, user_type_display)
                else:
                    filtered_data.pop("SU_APRO_STAT", None)
                    if filtered_data:
                        mail_change_in_profile_AU_SU_brevo(user.EMAIL, user.USERNAME, filtered_data, remark, user_type_display)
                
                return Response({"message": "Edit Successful", "data": serializer_a.data}, status=status.HTTP_200_OK)
            else:
                return Response({"errors": serializer_a.errors}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"message": "No Data Updated"}, status=status.HTTP_200_OK)

        
    elif request.method =="DELETE":   #status=status.HTTP_204_NO_CONTENT
        if not request.user.USER_TYPE == "SU":
            return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        auth_register_info = request.data
        try:
            user = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
        except:
            return Response({"message": "User Not Found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            if user.USER_TYPE == "AU":
                status_ST = "DELETE"
                reason = "-"
                OPT = user.THEME_OPT[3:]
                print(OPT)
                print("UU_"+OPT)
                obj = User_login_Data.objects.all().filter(THEME_OPT="UU_"+OPT)
                EMAIL_Query = obj.values_list('EMAIL', flat=True)
                EMAIL_ALL = list(EMAIL_Query)
                block_admin_mail_bravo(user.EMAIL, status_ST, reason, user.USERNAME,user.USER_TYPE)
                mass_mail_block_admin_bravo(EMAIL_ALL , user.USERNAME, status_ST)
                user.delete()
                return Response({'detail': 'User Deleted Successfully'}, status=status.HTTP_200_OK)
            else:
                return  Response({"message": "User Not AU"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"messages":f"error : {e}"}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({'message': 'Invalid HTTP Method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def permission_function(request):
    if request.method == 'GET':
        try:
            print("Usertype:", request.user.USER_TYPE)
            USER_TYPE = request.user.USER_TYPE
            print(USER_TYPE)
            if USER_TYPE not in ["SU", "AU", "UU"]:
                return Response({'message': 'Not Authorized '}, status=status.HTTP_403_FORBIDDEN)
            else:
                pass
        except:
            return Response({"Message":"Something Went Wrong"})
        # if request.user.USER_TYPE == "SU":
        #     THEME_OPT = request.GET.get("THEME_OPT")
        #     if THEME_OPT is None:
        #         return Response({"Message":"Required THEME_OPT"})
        #     else:
        #         THEME_TYPE = THEME_OPT[3:]
        # if request.user.USER_TYPE == "AU":
        #     THEME_TYPE = request.user.THEME_OPT[3:]
        
        USERID = request.GET.get("USERID")
        obj, created = MODUL_VIEW_PERMISSION.objects.get_or_create(USERID_id= USERID)
        if created:
            pass
        elif obj is not None:
            obj_thim = THEME_MODULE.objects.get(USERID_THEME_OPT= obj.USERID_THEME_OPT_id)
        try:
            datainfo, created = MODUL_VIEW_PERMISSION.objects.get_or_create(USERID_id = USERID) #, USERID_THEME_OPT__THEME_TYPE=THEME_TYPE)
            if request.user.USER_TYPE == "SU":
                if datainfo.USERID_THEME_OPT_id is None:
                    x = User_login_Data.objects.get(USERID=USERID)

                    THEME_OPT = x.THEME_OPT 
                    if THEME_OPT is None:
                        return Response({"Message":"Required THEME_OPT"})
                    else:
                        THEME_TYPE = THEME_OPT[3:]
                        obj_thim = THEME_MODULE.objects.get(THEME_TYPE=THEME_TYPE)
                        id = obj_thim.USERID_THEME_OPT
                        datainfo.save()
              
            elif request.user.USER_TYPE == "AU":
                if datainfo.USERID_THEME_OPT_id is None:
                    THEME_TYPE = request.user.THEME_OPT[3:]
                    obj_thim = THEME_MODULE.objects.get(THEME_TYPE=THEME_TYPE)
                    id = obj_thim.USERID_THEME_OPT
                    datainfo.save()
            elif request.user.USER_TYPE == "UU":
                if request.user.USERID != USERID:
                    return Response({"Message":"Correct Your ID"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    pass
                if datainfo.USERID_THEME_OPT_id is None:
                    THEME_TYPE = request.user.THEME_OPT[3:]
                    obj_thim = THEME_MODULE.objects.get(THEME_TYPE=THEME_TYPE)
                    id = obj_thim.USERID_THEME_OPT
                    datainfo.save()
                else:
                    pass
            # id = obj_thim.USERID_THEME_OPT
        except Exception as e:
            return Response({"Message":"Something Went Wrong"})
        print("cccccccccccccccccccc")
        print(datainfo)
        # for table_2 in datainfo:
        print(datainfo.USERID_THEME_OPT.MODEL_1)
        # obj_thim = THEME_MODULE.objects.all()
        serializer_a = MODUL_VIEW_PERMISSION_serialiser(datainfo).data
        print(serializer_a)
        column_names = [key for key in obj_thim.__dict__.keys() if  key.startswith('MODEL_')]
        permission_view = {}  #permission_view
        user_theme_opt_fields = serializer_a["USERID_THEME_OPT"]
        # num = 
        for i in range(1, len(column_names)+1):  # Assuming you have fields MODEL_1 to MODEL_10
            model_field_name = f"MODEL_{i}"
            permission_view[user_theme_opt_fields[model_field_name]] = serializer_a[model_field_name]
        print(permission_view)
        data_ser = {
            "serializer_a1":serializer_a
        }
        return Response({"message":data_ser, "data": permission_view}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        try:
            if not request.user.USER_TYPE == "AU":
                return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"Message":str(e)})
        auth_register_info = request.data
        auth_register_info = {key: value for key, value in auth_register_info.items() if key not in ["AU_ID", "USERID_THEME_OPT_id"]}
        if auth_register_info.get("USERID") is None:
            return Response({"Message":"Required USERID"}, status=status.HTTP_400_BAD_REQUEST)
        print(auth_register_info)
        THEME_TYPE = request.user.THEME_OPT[3:]
        print(THEME_TYPE)
        # auth_register_info['THEME_TYPE'] = THEME_TYPE
        obj_thim = THEME_MODULE.objects.get(THEME_TYPE=THEME_TYPE)
        print(obj_thim)
        auth_register_info['THEME_TYPE'] = THEME_TYPE
        # auth_register_info['USERID_THEME_OPT'] = obj_thim.USERID_THEME_OPT
        auth_register_info['AU_ID'] = request.user.USERID
        print(auth_register_info)
        serializer_a = MODUL_VIEW_PERMISSION_serialiser(data=auth_register_info)
        if serializer_a.is_valid():
            serializer_a.validated_data['USERID_THEME_OPT_id'] =  obj_thim.USERID_THEME_OPT
            serializer_a.validated_data['USERID_id'] =  auth_register_info.get("USERID")
            serializer_a.save()
            # serializer_a['THEME_TYPE'] = THEME_TYPE
            return Response({"Message":"Succesfully Approved", "DATA": serializer_a.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error":serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'PATCH':
        try:
            if not request.user.USER_TYPE == "AU":
                return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"Message":str(e)})
        
        auth_register_info = request.data
        print(auth_register_info)
        print("aaaaaaaaaaaaaaaaaaaa")
        THEME_TYPE = request.user.THEME_OPT[3:]
        obj_thim = THEME_MODULE.objects.get(THEME_TYPE=THEME_TYPE)
        if auth_register_info.get("USERID") is None:
            return Response({"Message":"Required USERID"}, status=status.HTTP_400_BAD_REQUEST)
        user_detail, created = MODUL_VIEW_PERMISSION.objects.get_or_create(USERID_id = auth_register_info.get("USERID"))
        if created:
            print(THEME_TYPE)
            # auth_register_info['THEME_TYPE'] = THEME_TYPE
            print(obj_thim)
            auth_register_info['AU_ID'] = request.user.USERID
            # auth_register_info['USERID_THEME_OPT'] = obj_thim.USERID_THEME_OPT
            print(auth_register_info)
        user_info = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
        serializer_b = User_login_Data_serialiser112(user_info, data= auth_register_info, partial=True)
        serializer_a = MODUL_VIEW_PERMISSION_serialiser(user_detail, data= auth_register_info, partial=True)
        if serializer_b.is_valid() and serializer_a.is_valid():
            serializer_b.save()
            serializer_a.validated_data['USERID_THEME_OPT_id'] =  obj_thim.USERID_THEME_OPT
            if user_detail.USERID_THEME_OPT_id == serializer_a.validated_data['USERID_THEME_OPT_id']:
                print("USERID_THEME_OPT_id is same as old")
                au_id_value = serializer_a.validated_data.get('AU_ID', None)
                if au_id_value is None or au_id_value == user_detail.AU_ID:
                    print("There is no au_id-value or old AU value")
                    serializer_a_1 = serializer_a.validated_data
                    new_permission = {key: value for key, value in serializer_a_1.items() if key not in ["AU_ID", "USERID_THEME_OPT_id"]}
                    zx = model_to_dict(user_detail)
                    old_permission ={key: value for key, value in zx.items() if key not in ["AU_ID", "USERID_THEME_OPT_id"]}
                    final_per_dict = {key: old_permission[key] for key in old_permission if key in new_permission and old_permission[key] != new_permission[key]}
                    if not final_per_dict:
                        print("No Change In Module Permission")
                        pass
                    else:
                        print("Change In Module Permission")
                        serializer_a.save()
                else:
                    print("au id change")
                    serializer_a.save()
            else:
                print("Thim change")
                serializer_a.save()
            response_data = {
                        'serializer_a_data': serializer_a.data}
            return Response({"data": response_data}, status=status.HTTP_200_OK)
        else:
            return Response({"error":serializer_a.errors}, status=status.HTTP_200_OK)
            

#customer_user_serialiser
from auditlog.models import LogEntry
@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def superuser_api(request): #active
    keys_to_required = ["USERNAME", "EMAIL", "MOBILE_NO", "PASSWORD"]
    key_re2 = ["FIRST_NAME", "MIDDLE_NAME", "LAST_NAME", "COUNTRY", "STATE", "CITY", "ORGANIZATION", "DESIGNATION", "LAN_LINE","OFF_LOCA","ALT_EMAIL"]
    if request.method =="GET":
        if request.user.USER_TYPE == "SU":
            try:
                user_login_detail_data = User_login_Data.objects.prefetch_related('logindata').get(USERID=request.user.USERID)
                serializer_b = User_login_Data_serialiser112(user_login_detail_data).data
                dict_1 = {
                    "USERNAME": serializer_b["USERNAME"],
                    "EMAIL": serializer_b["EMAIL"],
                    "MOBILE_NO": serializer_b["MOBILE_NO"],
                    **(
            {
            "FIRST_NAME": serializer_b.get("logindata", {}).get("FIRST_NAME"),
            "MIDDLE_NAME": serializer_b.get("logindata", {}).get("MIDDLE_NAME"),
            "LAST_NAME": serializer_b.get("logindata", {}).get("LAST_NAME"),
            "ORGANIZATION": serializer_b.get("logindata", {}).get("ORGANIZATION"),
            "DESIGNATION": serializer_b.get("logindata", {}).get("DESIGNATION"),
            "CITY": serializer_b.get("logindata", {}).get("CITY"),
            "STATE": serializer_b.get("logindata", {}).get("STATE"),
            "COUNTRY": serializer_b.get("logindata", {}).get("COUNTRY"),
            "LAN_LINE": serializer_b.get("logindata", {}).get("LAN_LINE"),
            "ALT_EMAIL": serializer_b.get("logindata", {}).get("ALT_EMAIL"),
            "OFF_LOCA": serializer_b.get("logindata", {}).get("OFF_LOCA"),
        } if "logindata" in serializer_b and serializer_b["logindata"] is not None else {}
        )                  
}
                return Response({"message": dict_1}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"errors": str(e)}, status=status.HTTP_200_OK)# 
        else:
            return Response({"errors":"User Not Allowed"}, status=status.HTTP_403_FORBIDDEN)
        
    # if request.method =="POST":
    #     token_get = password_table.objects.all().first()
    #     if token_get:
    #         if token_get.USERID is None:
    #             if check_password(request.data.get("PASSWORD_ID"), token_get.forget_password_token):
    #                 auth_register_info = request.data
    #                 if len(auth_register_info) ==1 and "PASSWORD_ID" in auth_register_info:
    #                     return Response({"message":"Succesfull"}, status=status.HTTP_200_OK)
    #                 else:
    #                     data_req = {key: auth_register_info[key] for key in keys_to_required if key in auth_register_info}
    #             # Extract and filter logindata
    #                     logindata = auth_register_info.get("logindata", {})
    #                     filtered_logindata = {key: logindata[key] for key in key_re2 if key in logindata}
                        
    #                     if filtered_logindata:
    #                         data_req['logindata'] = filtered_logindata
    #                         data_req["USER_TYPE"] = "SU"
    #                     su_exists = User_login_Data.objects.filter(USER_TYPE='SU').exists()
    #                     if su_exists:
    #                         return Response({'message':'Super User Already Created'}, status=status.HTTP_200_OK)
    #                     else:
    #                         # print("User type 'SU' does not exist in the User_login_Data table.")
    #                         pass
    #                     serializer_a = User_login_Data_serialiser112(data=data_req, context={'request': request}) 
    #                     if serializer_a.is_valid():
    #                         serializer_a.save()
    #                         token_get.delete()
    #                         send_SU_EMAIL_CREATE(data_req.get("EMAIL") , data_req.get("USERNAME"))
    #                         return Response({'message':'Admin Created Succesfully', 'response_data':serializer_a.data}, status=status.HTTP_201_CREATED)
    #                     else:
    #                         return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)  
    #             else:
    #                 return Response({"message": "You are Not Authorised"}, status=status.HTTP_400_BAD_REQUEST)  
    #         else:
    #             return Response({"message": "You are Not Authorised"}, status=status.HTTP_400_BAD_REQUEST)
    #     else:
    #             return Response({"message": "You are Not Authorised"}, status=status.HTTP_400_BAD_REQUEST)
            
    if request.method =="PATCH":
        if request.user.USER_TYPE == "SU":
            auth_register_info = request.data
            auth_register_info.pop("CREATION_DATE", None)
            logindata = auth_register_info.pop("logindata", {})
            dict_update = {}
            # user_detail = Users_login_Details_Data.objects.filter(USERID_id=request.user.USERID).first()
            mobile = auth_register_info.get("MOBILE_NO")
            if mobile:
                if mobile != request.user.MOBILE_NO:
                    dict_update.update({"MOBILE_NO":mobile})
            user = User_login_Data.objects.select_related('logindata').get(USERID= request.user.USERID)     #.filter(~Q(MOBILE_NO=F(auth_register_info.get("MOBILE_NO")))).first()
            if logindata:
                try:
                    user_detail = user.logindata
                    yc = model_to_dict(user_detail)
                    print("Related Logindata Found:", logindata)
                except Users_login_Details_Data.DoesNotExist:
                    print("No Related Logindata Found.")
                    yc = {}
                    pass
            filtered_logindata = {key: value for key, value in logindata.items() if key in key_re2 and not is_equivalent(yc.get(key), value)}
            if filtered_logindata:
                dict_update["logindata"] = filtered_logindata
            if dict_update:
                serializer_b = User_login_Data_serialiser112(user,  data=dict_update, partial=True)
                if serializer_b.is_valid():
                    serializer_b.save(APRO_DATE = timezone.now())
                    Remark = ""
                    mail_change_in_profile_AU_SU_brevo(request.user.EMAIL, request.user.USERNAME, filtered_logindata, Remark,  user.USER_TYPE)
                    return Response({'message':'SuperUser Update Succesfully', 'response_data':serializer_b.data}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Validation error', 'errors':serializer_b.errors}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message':'No Update'}, status=status.HTTP_200_OK)
        else:
            return Response({'errors': 'You Not Authorised'}, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method =="DELETE":   #status=status.HTTP_204_NO_CONTENT
        if not request.user.USER_TYPE == "SU":
            return Response({'message': 'Not Authorized SuperUser'}, status=status.HTTP_403_FORBIDDEN)
        # auth_register_info = request.data
        try:
            user = User_login_Data.objects.get(USERID=request.user.USERID)
            # LogEntry.objects.get_for_objects(obj.related.all())
            # LogEntry.objects.get_for_objects(user.related.all())   #.update(actor_id=None)
            # rel_history = LogEntry.objects.get_for_objects(user.related.all())
            # rel_history = User_login_Data.history#.items
            
            # print("successssssssss", vars(rel_history))
            user.delete()
        except Exception as e:
            return Response({"message": "User Not Found", "error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'User Deleted Successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({"Message":"Method Not Allowed"}, status=status.HTTP_400_BAD_REQUEST)

class superuser_api_2(APIView):
    keys_to_required = ["USERNAME", "EMAIL", "MOBILE_NO", "PASSWORD"]
    key_re2 = ["FIRST_NAME", "MIDDLE_NAME", "LAST_NAME", "COUNTRY", "STATE", "CITY", "ORGANIZATION", "DESIGNATION", "LAN_LINE","OFF_LOCA","ALT_EMAIL"]
    def get_token(self, request):
        try:
            return request.query_params.get('token')
        except Exception as e:
            raise Http404("An Error Occurred: " + str(e))
        
    def get(self, request, token=None, format=None):
        token_get = self.get_token(request)
        if token_get is not None:
            try:
                decoded = token_unhash(token_get)
                print(f"Decoded Token: {decoded}")  #ValueError as ve
            except ValueError as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"USERNAME": decoded.get("USERNAME"), "EMAIL":decoded.get("EMAIL"),"admin_type_short":decoded.get("admin_type_short"), "USER_TYPE":decoded.get("USER_TYPE"), "timer":(decoded.get("exp")-int(timezone.now().timestamp()))/60}, status=status.HTTP_200_OK)
        else:
            return Response({"errors": "No Token Provided"}, status=status.HTTP_200_OK)
        
    def post(self, request, format=None):
        token_get = self.get_token(request)
        form_data = request.data
        if token_get:
            try:
                decoded = token_unhash(token_get)
            except ValueError as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            if decoded.get("USERNAME") == form_data.get("USERNAME") and decoded.get("EMAIL") == form_data.get("EMAIL").lower():
                data_req = {key: form_data[key] for key in self.keys_to_required if key in form_data}
                # logindata = form_data.get("logindata", {})
                # filtered_logindata = {key: logindata[key] for key in self.key_re2 if key in logindata}
                # if filtered_logindata:
                #     data_req['logindata'] = filtered_logindata
                extra_data = {"USER_TYPE":"SU", "SU_APRO_STAT":"APPROVED","AU_APRO_STAT":"INPROGRESS"}
                data_req.update(extra_data)
                su_exists = User_login_Data.objects.filter(USER_TYPE='SU').exists()
                if su_exists:
                    return Response({'message':'SuperUser Already Created'}, status=status.HTTP_200_OK)
                else:
                    pass
                serializer_a = User_login_Data_serialiser112(data=data_req, context={'request': request}) 
                if serializer_a.is_valid():
                    serializer_a.save()
                    send_SU_EMAIL_CREATE_bravo(data_req.get("EMAIL") , data_req.get("USERNAME"))
                    return Response({'message':'SuperUser Created Succesfully', 'response_data':serializer_a.data}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)  
            else:
                return Response({"errors":"Creadintial Not Match"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"errors":"No Token Found"}, status=status.HTTP_400_BAD_REQUEST)
                
        



    # def put(self, request, pk, format=None):
    #     snippet = self.get_object(pk)
    #     serializer = SnippetSerializer(snippet, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, pk, format=None):
    #     snippet = self.get_object(pk)
    #     snippet.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
        


# ****************  Themes Value API's ********************* Created By **RIMANSHU**  
 
class Themes_Value(APIView):
 
# THEME_MODULE model to get all THEME_TYPE values
    def get(self, request):
        if request.query_params.get('CURRENTADMINS') == "CURRENTADMINS":
            theme_types =  list(THEME_MODULE.objects.all().values_list("THEME_TYPE", flat=True))           #.values("THEME_TYPE")
            pass
        elif request.query_params.get('THEME_TYPE'):
            theme_types = User_login_Data.objects.filter(
                        THEME_OPT__THEME_TYPE=request.query_params.get('THEME_TYPE'),
                        USER_TYPE="AU", 
                        SU_APRO_STAT="APPROVED"
                        ).exclude(
                                Q(SU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="REPLACE")
                            ).values_list("ADMIN_TYPE", flat=True).distinct()
        elif request.query_params.get('THEME_TYPE_Department'):
            pass
        else:
            admin_type = request.query_params.get('admin_type')
            themes = THEME_MODULE.objects.filter(~Q(THEME_TYPE__in=Subquery(THEME_MODULE.objects.filter(
            THEME_MODULE_set__USER_TYPE="AU",
            THEME_MODULE_set__ADMIN_TYPE=admin_type,
            THEME_MODULE_set__AU_APRO_STAT="INPROGRESS",
            THEME_MODULE_set__SU_APRO_STAT__in=["APPROVED", "BLOCKED", "PENDING"]).values('THEME_TYPE')))).values('THEME_TYPE').distinct()
            theme_types = [theme['THEME_TYPE'] for theme in themes]

        return Response(theme_types, status=status.HTTP_200_OK)
 
# Add New themes by Post API's
 
    def post(self, request):
        # Extract THEME_TYPE and USERID_THEME_OPT from the request data
        theme_type = request.data.get('THEME_TYPE')
        user_id_theme_opt = request.data.get('USERID_THEME_OPT')
 
        # Validate the input
        if not theme_type or not user_id_theme_opt:
            raise ValidationError("THEME_TYPE And USERID_THEME_OPT Are Required Fields.")
 
        # Check if the USERID_THEME_OPT already exists
        if THEME_MODULE.objects.filter(USERID_THEME_OPT=user_id_theme_opt).exists():
            return Response({"message": "USERID_THEME_OPT Already Exists"}, status=status.HTTP_400_BAD_REQUEST)
 
        # Create a new THEME_MODULE instance
        new_theme = THEME_MODULE(
            USERID_THEME_OPT=user_id_theme_opt,
            THEME_TYPE=theme_type,
        )
        # Save the new instance to the database
        new_theme.save()
 
        # Return a success response
        return Response({"message": "Theme Added Successfully"}, status=status.HTTP_201_CREATED)
 
 
    def patch(self, request):
       
        data = {"message": "PATCH request "}
        return Response(data, status=status.HTTP_200_OK)
 
    def delete(self, request):
       
        data = {"message": "DELETE request "}
        return Response(data, status=status.HTTP_200_OK)
            


# ****************  LogOut View API's ********************* Created By **RIMANSHU**  


class LogoutView(generics.GenericAPIView):

    serializer_class = LogoutSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):

        serializer = self.serializer_class(data= request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"message": "Logout Successfully "}, status=status.HTTP_200_OK)


def admin_blocked_view(request):
    return render(request, 'authentification/admin_blocked.html', {'message': 'Admin Is Blocked. You Cannot Perform Any Actions.'})


##########################################################

class Check_Admintype(APIView):
    def get(self, request):
        approved_admin_types = User_login_Data.objects.filter(USER_TYPE='AU',SU_APRO_STAT='APPROVED').values_list('ADMIN_TYPE', flat=True).distinct()
        return Response(list(approved_admin_types), status=status.HTTP_200_OK)
 
class Department_Value(APIView):
    def get(self, request):
        admin_type = request.query_params.get('ADMIN_TYPE')
        if request.query_params.get('CURRENTADMINS') == "CURRENTADMINS":
            theme_types = list(THEME_MODULE.objects.all().values_list("THEME_TYPE", flat=True))
       
        elif request.query_params.get('THEME_TYPE'):
            theme_types = User_login_Data.objects.filter(THEME_OPT__THEME_TYPE=request.query_params.get('THEME_TYPE'), USER_TYPE="AU", SU_APRO_STAT="APPROVED").exclude(
                Q(SU_APRO_STAT="DELETE") | Q(SU_APRO_STAT="REPLACE")
            ).values_list("ADMIN_TYPE", flat=True).distinct()
       
        elif admin_type in ["WCADMIN", "UDADMIN"]:
            if not User_login_Data.objects.filter(USER_TYPE="AU",ADMIN_TYPE=admin_type,SU_APRO_STAT="APPROVED").exists():
                return Response({"error": "This Admin Type Does Not Exist"}, status=status.HTTP_404_NOT_FOUND)
   
            all_themes = set(THEME_MODULE.objects.values_list("THEME_TYPE", flat=True))
 
            relevant_themes = User_login_Data.objects.filter(
                USER_TYPE="AU",ADMIN_TYPE=admin_type,SU_APRO_STAT="APPROVED").values_list("THEME_OPT__THEME_TYPE", flat=True).distinct()
           
            # Filter themes based on presence in both lists
            theme_types = list(all_themes.intersection(relevant_themes))
        else:
            theme_types = []
 
        return Response(theme_types, status=status.HTTP_200_OK)
 
    def post(self, request):
        theme_type = request.data.get('THEME_TYPE')
        user_id_theme_opt = request.data.get('USERID_THEME_OPT')
        
 
        if not theme_type or not user_id_theme_opt:
            raise ValidationError("THEME_TYPE And USERID_THEME_OPT Are Required Fields.")
 
        if THEME_MODULE.objects.filter(USERID_THEME_OPT=user_id_theme_opt).exists():
            return Response({"message": "USERID_THEME_OPT Already Exists"}, status=status.HTTP_400_BAD_REQUEST)
        new_theme = THEME_MODULE(USERID_THEME_OPT=user_id_theme_opt,THEME_TYPE=theme_type,)  
        new_theme.save()
 
        return Response({"message": "Theme Added Successfully"}, status=status.HTTP_201_CREATED)
 
    def patch(self, request):
        data = {"message": "PATCH request "}
        return Response(data, status=status.HTTP_200_OK)
 
    def delete(self, request):
        data = {"message": "DELETE request "}
        return Response(data, status=status.HTTP_200_OK)



import os
import tempfile
import zipfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import geopandas as gpd
import pandas as pd
from dbfread import DBF
from shapely.geometry import Point, LineString, Polygon, MultiLineString
from osgeo import ogr, osr
from django.conf import settings
import networkx as nx

# Enable exceptions
ogr.UseExceptions()
# Disable exceptions
ogr.DontUseExceptions()
# Dictionary to store unique tuples and their assigned numbers
tuple_to_number = {}
 
def assign_numbering(tuples_list):
    """Assigns unique numbering to each tuple."""
    current_number = max(tuple_to_number.values(), default=0) + 1
    numbering = []
    for t in tuples_list:
        if t in tuple_to_number:
            numbering.append(tuple_to_number[t])
        else:
            tuple_to_number[t] = current_number
            numbering.append(current_number)
            current_number += 1
    return numbering
 
class GISDataExtractor(APIView):
    """Handles data extraction and processing for GIS files."""

    def save_file(self, uploaded_file, temp_dir):
        # Use MEDIA_ROOT to save files to the media directory
        media_path = os.path.join(settings.MEDIA_ROOT, 'dat/')
        os.makedirs(media_path, exist_ok=True)  # Ensure the directory exists
        file_path = os.path.join(media_path, uploaded_file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        return file_path

    def extract_zip_file(self, zip_file, temp_dir):
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        return zip_ref.namelist()
    
    def read_shapefile(self, shp_path):
        try:
            # Reading the shapefile using geopandas
            gdf = gpd.read_file(shp_path)

            # Use OGR to get more spatial reference details
            driver = ogr.GetDriverByName("ESRI Shapefile")
            dataset = ogr.Open(shp_path)
            if not dataset:
                raise ValueError("Failed to open shapefile with OGR.")
            
            layer = dataset.GetLayer()

            # Get input spatial reference
            source_srs = layer.GetSpatialRef()
            if not source_srs:
                raise ValueError("Failed to retrieve spatial reference from the shapefile layer.")

            # Safely access the spatial reference information
            # Input_Projection=source_srs.ExportToPrettyWkt()if source_srs else None #Add the projection using gdal  
            projcs_name = source_srs.GetAttrValue('projcs') if source_srs else None
            geogcs_name = source_srs.GetAttrValue('geogcs') if source_srs else None
            epsg_code = source_srs.GetAuthorityCode(None) if source_srs else None
            linear_unit = source_srs.GetLinearUnitsName() if source_srs else None

            # print(f"Projection Coordinate System (PROJCS): {projcs_name}")
            # print(f"Geographic Coordinate System (GEOGCS): {geogcs_name}")
            # print(f"EPSG Code: {epsg_code}")
            # print(f"Linear Unit: {linear_unit}") 
            # print("Input Projection ===== ",source_srs.ExportToPrettyWkt())
            # print("yyyy",Input_Projection)         

            GCS_KEY =None 
            if (
                projcs_name is None 
                and linear_unit == "unknown" 
            ):                
                # print("this a gcs file")
                GCS_KEY="The Drainage layer selected has 'GEOGCS' coordinate system. You need to either transform this layer to meter coordinate system (LCC/UTM/TM) after ordering for morphometric analysis or provide the layer with meter coordinates system. DO YOU WANT TO PROCEED?"
            else:
                target_srs = osr.SpatialReference()
                target_srs.ImportFromProj4("+proj=longlat +datum=WGS84")  # WGS84 GCS

                # Create a transformation
                transform = osr.CoordinateTransformation(source_srs, target_srs)

                # Create a list to store transformed geometries and calculated lengths
                transformed_geometries = []
                lengths = []

                for feature in layer:
                    geom = feature.GetGeometryRef().Clone()  # Clone geometry to avoid modifying the original
                    geom.Transform(transform)  # Reproject the geometry

                    # Calculate length for different geometry types
                    length = 0
                    if geom.GetGeometryType() == ogr.wkbLineString:
                        length = geom.Length()
                    elif geom.GetGeometryType() == ogr.wkbMultiLineString:
                        for line in geom:
                            length += line.Length()

                    # Store the transformed geometry and calculated length
                    transformed_geometries.append(geom.ExportToWkt())
                    lengths.append(length)

                # Update the GeoDataFrame with the transformed geometries and lengths
                gdf["geometry"] = gpd.GeoSeries.from_wkt(transformed_geometries)
                gdf["Shp_Len2"] = lengths
                # gdf["Input_Projection"]=Input_Projection #projection column add in the projection 

                # print("Transformation complete. Updated GeoDataFrame returned.")
        except Exception as e:
            raise ValueError(f"Error processing shapefile: {str(e)}")
        
        return gdf, GCS_KEY #,Input_Projection

    def read_dbf_file(self, dbf_path):
        try:
            dbf_data = DBF(dbf_path)
            dbf_records = pd.DataFrame(iter(dbf_data))
        except Exception as e:
            raise ValueError(f"Invalid DBF file: {str(e)}")
        return dbf_records
    
    def read_prj_file(self, prj_path):
        try:
            with open(prj_path, 'r') as prj_file:
                prj_content = prj_file.read()
        except Exception as e:
            return None  # Return None if the .prj file cannot be read
        return prj_content
                             
    def add_first_last_points(self, gdf):
        gdf["First_Point"] = gdf.geometry.apply(lambda x: x.coords[0] if isinstance(x, (LineString, Point)) else None)
        gdf["Last_Point"] = gdf.geometry.apply(lambda x: x.coords[-1] if isinstance(x, (LineString, Point)) else None)
        return gdf
 
    def process_shapefile_data(self, gdf, dbf_records):
    # Check if 'Shp_Len2' exists in gdf, if not, set it to None
        if 'Shp_Len2' not in gdf.columns:
            gdf["Shp_Len2"] = None
        
        # Add the 'Shp_Len2' column to the DBF DataFrame (dbf_records)
        dbf_records["Shp_Len2"] = gdf["Shp_Len2"]

        # Merge dbf_records with gdf based on the index in the gdf
        for col in dbf_records.columns:
            if col not in gdf.columns:
                gdf[col] = None

        gdf = gdf.merge(dbf_records, left_index=True, right_index=True, how="left")

        for col in dbf_records.columns:
            if f"{col}_x" in gdf.columns and f"{col}_y" in gdf.columns:
                gdf[col] = gdf[f"{col}_x"].combine_first(gdf[f"{col}_y"])
                gdf.drop([f"{col}_x", f"{col}_y"], axis=1, inplace=True)

        gdf['FID'] = gdf.index if 'FID' not in gdf.columns else gdf['FID']
        gdf = self.add_first_last_points(gdf)
        gdf['fid'] = list(range(len(gdf)))
        gdf["AUD_FNODE"] = assign_numbering(gdf["First_Point"].tolist())
        gdf["AUD_TNODE"] = assign_numbering(gdf["Last_Point"].tolist())
        gdf = gdf[['fid'] + [col for col in gdf.columns if col != 'fid']]
        return gdf

    def create_undirected_graph(self, edges):
        graph = {}
        for node1, node2 in edges:
            graph.setdefault(node1, []).append(node2)
            graph.setdefault(node2, []).append(node1)
        return graph
 
    def count_link_path(self, graph):
        visited = set()
        list_connecting_node_new = []
        group_number = 1  # Start numbering from 1

        def dfs(node, group):
            """Recursive DFS to assign groups."""
            if node in visited:
                return
            visited.add(node)
            group.append(node)
            for neb in graph[node]:
                dfs(neb, group)

        for node in graph:
            if node not in visited:
                group = []
                dfs(node, group)
                # Assign the current group number to all nodes in this group
                for n in group:
                    tuple_to_number[n] = group_number
                group_number += 1  # Increment for the next group
                list_connecting_node_new.append(group)

        return list_connecting_node_new
    
    #convert into the wkt format 
    def convert_geometry_to_wkt(self, geometry):
        if isinstance(geometry, (Point, LineString, Polygon)):
            return geometry.wkt
        return None
    def add_row_new_dataframe(self, gdf, num):
        """Add a new row to the dataframe for a given node."""
        row = gdf[(gdf["AUD_FNODE"] == num) | (gdf["AUD_TNODE"] == num)]
        if not row.empty:
            first_row = row.iloc[0]
            if first_row.AUD_FNODE == num:
                point_geom = first_row.First_Point
            else:
                point_geom = first_row.Last_Point
            dict_row = {"point": num,"x_cord": point_geom[0],"y_cord": point_geom[1],"fid": first_row['FID'] if 'FID' in first_row else None,"linked_fid": row["FID"].tolist(),"geometry": Point(point_geom)}
        else:
            dict_row = {
                "point": num,"fid": None,"x_cord": None,"y_cord": None,"linked_fid": None,"geometry": None}
        return dict_row
 
    def post(self, request):
        try:
            uploaded_zip_file = request.FILES.get('zip_file')
            if not uploaded_zip_file:
                return Response({"error": "No ZIP file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

            with tempfile.TemporaryDirectory() as temp_dir:
                zip_file_path = self.save_file(uploaded_zip_file, temp_dir)
                extracted_files = self.extract_zip_file(zip_file_path, temp_dir)
                required_files = ['.shp', '.shx', '.dbf','.prj']
                shapefile_files = [f for f in extracted_files if any(f.endswith(ext) for ext in required_files)]
                prj_file = [f for f in extracted_files if f.endswith('.prj')]

                if len(shapefile_files) != 4:
                    return Response({"error": "Missing required shapefile components (.shp, .shx, .dbf, .prj)."}, status=status.HTTP_400_BAD_REQUEST)                

                # Safe checks for the file names
                shp_file = next((f for f in shapefile_files if f.endswith('.shp')), None)
                dbf_file = next((f for f in shapefile_files if f.endswith('.dbf')), None)
                prj_file_path = prj_file[0] if prj_file else None  # If no prj file, it will be None

                shp_path = os.path.join(temp_dir, shp_file)
                dbf_path = os.path.join(temp_dir, dbf_file)
                prj_path = os.path.join(temp_dir, prj_file_path)

                gdf, GSC_key = self.read_shapefile(shp_path)
                dbf_records = self.read_dbf_file(dbf_path)
                gdf = self.process_shapefile_data(gdf, dbf_records)
                prj_content = self.read_prj_file(prj_path)

                # Existing code for processing shapefile data and assigning errors based on graph structure
                list_of_lists = gdf[['AUD_FNODE', 'AUD_TNODE']].values.tolist()
                graph = self.create_undirected_graph(list_of_lists)
                connected_groups = self.count_link_path(graph)
                # Create graph and detect cycles
                graph_1 = nx.Graph()
                graph_1.add_edges_from(list_of_lists)

                # Find cycles in the undirected graph
                cycles = nx.cycle_basis(graph_1)
                print("Detected Cycles:", cycles)

                line_rows = []
                dbf_columns = [col for col in dbf_records.columns]  # Dynamically get all dbf column names
                default_value = ""

                multiline_found = False  # Flag to check if MultiLineString is found

                for _, row in gdf.iterrows():
                    if isinstance(row.geometry, LineString):
                        # Dynamically map dbf columns to properties with defaults
                        line_properties = {col: row[col] if col in row and pd.notna(row[col]) else default_value for col in dbf_columns}

                        line_properties.update({"FID": row['FID'] if 'FID' in row else default_value,"AUD_ERR": 0,"AUD_GRP": 1 }) # Set AUD_ERR to 0 for LineString

                        line_data = {"type": "Feature","geometry": {"type": "LineString", "coordinates": list(row.geometry.coords)},"properties": line_properties}
                        line_rows.append(line_data)

                    # If LineString is not found, check for MultiLineString
                    if isinstance(row.geometry, MultiLineString):
                        multiline_found = True  # Set the flag to True when MultiLineString is found
                        multiline_properties = {col: row[col] if col in row and pd.notna(row[col]) else default_value for col in dbf_columns}

                        multiline_properties.update({"FID": row['FID'] if 'FID' in row else default_value, "AUD_ERR": 9,"AUD_GRP": 2 })
                        # Handle multiple LineStrings in MultiLineString
                        multiline_data = {"type": "Feature","geometry": {"type": "MultiLineString","coordinates": [list(geometry.coords) for geometry in row.geometry.geoms]}, 
                            "properties": multiline_properties}
                        line_rows.append(multiline_data)

                # If a MultiLineString is found, set all LineString AUD_ERR to 0 and return response
                if multiline_found:
                    for line_row in line_rows:
                        if line_row['geometry']['type'] == "LineString":
                            line_row['properties']['AUD_ERR'] = 0

                    # Prepare the response in the desired format
                    geojson_data = {
                        "type": "FeatureCollection","features": [{ "type": "Feature","GCS_KEY":GSC_key, "geometry": feature["geometry"],"properties": feature["properties"]}
                            for feature in line_rows
                        ]
                    }
                    return Response({"message": "MultiLineString geometries found ", "geometry": geojson_data,"GCS_KEY":GSC_key},status=status.HTTP_200_OK)

                # Get all unique nodes forming loops
                nodes_in_loops = set(node for cycle in cycles for node in cycle) if cycles else set()
                print("Nodes forming loops:", nodes_in_loops)

                # Check for repeated and non-repeated pairs
                gdf['group_key'] = gdf.apply(lambda row: tuple(sorted([row['AUD_FNODE'], row['AUD_TNODE']])), axis=1)
                grouped = gdf.groupby('group_key').size().reset_index(name='count')

                # Separate repeated and non-repeated pairs
                repeated_pairs = grouped[grouped['count'] > 1]
                non_repeated_pairs = grouped[grouped['count'] == 1]

                # Mark rows in gdf with repeated pairs
                repeated_keys = set(repeated_pairs['group_key'])
                non_repeated_keys = set(non_repeated_pairs['group_key'])

                # Initialize AUD_ERR with 0
                gdf['AUD_ERR'] = 0

                # Set AUD_ERR = 4 for repeated pairs
                gdf.loc[gdf['group_key'].isin(repeated_keys), 'AUD_ERR'] = 4

                # Check if cycles exist and if cycles' nodes should be marked
                if nodes_in_loops:
                    gdf.loc[(gdf['AUD_FNODE'].isin(nodes_in_loops)) & (gdf['AUD_TNODE'].isin(nodes_in_loops)), 'AUD_ERR'] = 4

                # If any AUD_ERR is 4, we proceed with the next block of code in the below of the code 
                if not gdf[gdf['AUD_ERR'] == 4].empty:
                    # Prepare GeoJSON for all features
                    line_rows = []
                    dbf_columns = [col for col in dbf_records.columns]  # Dynamically get all dbf column names
                    default_value = ""

                    for _, row in gdf.iterrows():
                        if isinstance(row.geometry, LineString):
                            # Dynamically map dbf columns to properties with defaults
                            line_properties = {col: row[col] if col in row and pd.notna(row[col]) else default_value for col in dbf_columns}

                            # Update properties
                            line_properties.update({
                                "FID": row['FID'] if 'FID' in row else default_value,
                                "AUD_FNODE": row['AUD_FNODE'] if 'AUD_FNODE' in row else default_value,
                                "AUD_TNODE": row['AUD_TNODE'] if 'AUD_TNODE' in row else default_value,
                                "AUD_ERR": row['AUD_ERR'] if 'AUD_ERR' in row else default_value
                            })

                            # Create LineString data
                            line_data = { "type": "Feature","geometry": {"type": "LineString", "coordinates": list(row.geometry.coords)},"properties": line_properties
                            }
                            line_rows.append(line_data)

                    # Prepare the response
                    geojson_data = {"type": "FeatureCollection", "features": line_rows}
                    return Response({"message": "Polygonge Error .", "geometry": geojson_data,"GCS_KEY":GSC_key,}, status=status.HTTP_200_OK)

                # Proceed with normal processing if no MultiLineString found
                node_to_group = {node: i+1 for i, group in enumerate(connected_groups) for node in group}
                gdf["AUD_GRP"] = gdf["AUD_GRP"] = [tuple_to_number[fnode] for fnode in gdf["AUD_FNODE"]]

                gdf["AUD_ERR"] = "No Error"  # Initialize error column

                # Error classification logic
                nodes_with_degree_1 = [(node, len(neighbors)) for node, neighbors in graph.items() if len(neighbors) == 1]
                nodes_with_degree_2 = [(node, len(neighbors)) for node, neighbors in graph.items() if len(neighbors) == 2]
                nodes_with_degree_4_or_more = [(node, len(neighbors)) for node, neighbors in graph.items() if len(neighbors) >= 4]

                for node, degree in nodes_with_degree_1:
                    gdf.loc[(gdf["AUD_FNODE"] == node) | (gdf["AUD_TNODE"] == node), "AUD_ERR"] = 1
                for node, degree in nodes_with_degree_2:
                    gdf.loc[(gdf["AUD_FNODE"] == node) | (gdf["AUD_TNODE"] == node), "AUD_ERR"] = 2
                for node, degree in nodes_with_degree_4_or_more:
                    gdf.loc[(gdf["AUD_FNODE"] == node) | (gdf["AUD_TNODE"] == node), "AUD_ERR"] = 3

                gdf.loc[gdf["AUD_ERR"] == "No Error", "AUD_ERR"] = 0
    
                point_rows = []
                for node in set(gdf["AUD_FNODE"].tolist() + gdf["AUD_TNODE"].tolist()):
                    # Add new row for each node using the helper function
                    point_data = self.add_row_new_dataframe(gdf, node)                    
                    point_data["AUD_GRP"] = node_to_group.get(node, -1)  # Assign AUD_GRP from the node_to_group mapping
                
                    if len(point_data["linked_fid"]) == 1:
                        point_data["AUD_ERRP"] = 1
                    elif len(point_data["linked_fid"]) == 2:
                        point_data["AUD_ERRP"] = 2
                    elif len(point_data["linked_fid"]) >= 4:
                        point_data["AUD_ERRP"] = 3
                    else:
                        point_data["AUD_ERRP"] = 0
    
                    point_rows.append({
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [point_data["x_cord"], point_data["y_cord"]]},
                        "properties": {"FID": point_data["fid"],"NODEID": point_data["point"],"AUD_GRP": point_data["AUD_GRP"], "AUD_ERR": point_data["AUD_ERRP"]}})# "linked_fid": point_data["linked_fid"],
                                                                        
                line_rows = []
                dbf_columns = [col for col in dbf_records.columns]  # Dynamically get all dbf column names
                default_value = ""

                for _, row in gdf.iterrows():
                    if isinstance(row.geometry, LineString):
                        # Dynamically map dbf columns to properties with defaults
                        line_properties = {col: row[col] if col in row and pd.notna(row[col]) else default_value for col in dbf_columns}

                        line_properties.update({
                            "FID": row['FID'] if 'FID' in row else default_value,
                            "AUD_FNODE": row['AUD_FNODE'] if 'AUD_FNODE' in row else default_value,
                            "AUD_TNODE": row['AUD_TNODE'] if 'AUD_TNODE' in row else default_value,
                            "AUD_GRP": row['AUD_GRP'] if 'AUD_GRP' in row else default_value,
                            "AUD_ERR": row['AUD_ERR'] if 'AUD_ERR' in row else default_value
                        })

                        # Add LineString Data
                        line_data = {"type": "Feature","geometry": {"type": "LineString","coordinates": list(row.geometry.coords)}, "properties": line_properties}
                        line_rows.append(line_data)
                
                geojson_data = { "type": "FeatureCollection","features":{ "line":line_rows,"point":point_rows }}# Combine points and lines
                response = {"message": "Shapefile processed successfully.","GCS_KEY":GSC_key,"geometry": geojson_data,"prj_content":prj_content} #(,"Input_Projection":Input_Projection)=this is the gdal projection send to the responces.
                return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"{str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        











import redis
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pyproj import CRS, Transformer
# Connect to Redis
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

@api_view(['GET'])
def get_task_result(request, task_id):
    GEOSERVER_URL = "http://localhost:8085/geoserver"
    USERNAME = "admin"
    PASSWORD = "geoserver"
    WORKSPACE = "my_workspace"
    STORE = task_id
    STYLE_NAME = "roads_style"
    # STORE = "my_geojson_store"
    
    """
    Fetch Celery task result from Redis using the task_id.
    """
    print("task_id:_____________________________________", task_id)
    redis_key = task_id  # Redis key pattern for Celery tasks
    # task_data = redis_client.get("{redis_key}:count")  # Fetch data from Redis
    chunk_count = redis_client.get(f"{redis_key}:count")
    chunk_count = int(chunk_count)
    if not chunk_count:
        print("Task result not found")
        exit()
    chunk_count = int(chunk_count)
    print("Chunk count:", chunk_count)  
    geojson_str = "".join(redis_client.get(f"{redis_key}:{i}") for i in range(chunk_count))
    if isinstance(geojson_str, str):  # If result is stored as a string, convert to JSON
        print("convert into geojson")
        result = json.loads(geojson_str)
    if result:
            # return Response({"status": "success", "task_data": result})
            result_keys = result.keys()  # dict_keys(["key1", "key2"])
            print("_________________", list(result_keys))
            print("crsccc", result.get("crs"))  
            geojson_projection = None
            if isinstance(result.get("crs"), dict):
                print("eeeeeeeeeeeeeeeeeeeeeeeeeee")
                shapefile_projection = result.get("crs").get("properties").get("name") #GETING CORRECT PROJECTION
                    # shapefile_projection = "EPSG:3347"
                print("_________________shapefile_projection", shapefile_projection)    
                geojson_projection = CRS.from_epsg(4326)  #GCS projection

                if shapefile_projection != geojson_projection:
                    print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                        # transformer = Transformer.from_crs(geojson_projection, shapefile_projection, always_xy=True)
                    transformer = Transformer.from_crs(shapefile_projection, geojson_projection, always_xy=True)
                    data_file = result.get("features") #LIST OF OBJ
                    if  isinstance(data_file, list):
                        print("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                        new_data_fet = []
                        for feature in data_file:
                            geometry = feature.get("geometry")  #OBJE HAVING CORDINATE
                            if geometry:
                                coordinates = geometry.get("coordinates")
                                if geometry.get("type") == "LineString":
                                    # coordinates = geometry.get("coordinates")
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                                # print("HHHHHHHH")
                                            new_coords = []
                                            for coord in coordinates:
                                                x, y = transformer.transform(coord[0], coord[1])
                                                new_coords.append([x, y])
                                            # print("new_coords___________________________________", new_coords)
                                            # geometry["coordinates"] = new_coords
                                        feature["geometry"]["coordinates"] = new_coords
                                    else:
                                        print("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
                                        x, y = transformer.transform(coordinates[0], coordinates[1])
                                        geometry["coordinates"] = [x, y]
                                        # feature["geometry"] = geometry
                                    # new_data_fet.append(feature)
                                elif geometry.get("type") == "MultiLineString":
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                            new_list_cordinate = []   #list of list want
                                            for cord in coordinates:  #LIST OF LIST
                                                new_list_coords = []   #single list
                                                for coord in cord: #LIST
                                                    # new_coords = []
                                                    # for cordinatedd in coord: #from single list element unpacking
                                                    x, y = transformer.transform(coord[0], coord[1])
                                                    new_list_coords.append([x, y])
                                                new_list_cordinate.append(new_list_coords)
                                                    # x, y = transformer.transform(coord[0], coord[1])
                                                    # new_coords.append([x, y])
                                                # new_list_cordinate.append(new_coords)
                                            # new_data_fet.append(feature)
                                            feature["geometry"]["coordinates"] = new_list_cordinate
                                elif geometry.get("type") == "Polygon":
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                            new_list_cordinate = []
                                            for cord in coordinates[0]:
                                                x, y = transformer.transform(cord[0], cord[1])
                                                new_list_cordinate.append([x, y])
                                            feature["geometry"]["coordinates"] = [new_list_cordinate]
                                            
                                    # pass
                                    # pass
                                elif geometry.get("type") == "Point":
                                    if coordinates:
                                        x, y = transformer.transform(coordinates[0], coordinates[1])
                                        geometry["coordinates"] = [x, y]
                            new_data_fet.append(feature)

                        result["features"] = new_data_fet  
                        result["crs"] = {
                                    "type": "name",
                                    "properties": {"name": str(geojson_projection)}
                                        }
                        # return Response({"status": "success", "task_data": result})
                            # result["features"] = data_file
                    # elif isinstance(task_data, dict):  # If it's already a dict, use it directly
                    #     pass
                    # else:
                    #     raise ValueError("Unexpected task_data format") 
        
                crs = str(geojson_projection)
                print("________________________________________________", crs)
                gdf = gpd.GeoDataFrame.from_features(result["features"], crs=crs)
                mem_zip = io.BytesIO()
                with tempfile.TemporaryDirectory() as tmpdir:
                    shapefile_base = os.path.join(tmpdir, f"{task_id}")
                    gdf.to_file(shapefile_base + ".shp")
            # gdf.to_file(shapefile_path)
                    with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
                        for root, dirs, files in os.walk(tmpdir):
                            for file in files:
                                file_path = os.path.join(root, file)
                                zf.write(file_path, arcname=file)
        
        # with tempfile.TemporaryDirectory() as tmpdir:
        #     shapefile_base = os.path.join(tmpdir, f"{task_id}")
        #     # This will create multiple files: .shp, .shx, .dbf, .prj, etc.
        #     gdf.to_file(shapefile_base + ".shp")
        #     with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        #         for root, dirs, files in os.walk(tmpdir):
        #             for file in files:
        #                 file_path = os.path.join(root, file)
        #                 zf.write(file_path, arcname=file)
                    mem_zip.seek(0)
                    rest_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{STORE}/file.shp"
                    headers = {"Content-type": "application/zip"}
                    response = requests.put(
                        rest_url,
                     data=mem_zip.read(),
                        headers=headers,
                        auth=(USERNAME, PASSWORD)
                             )
                if response.status_code == 201:
                    print(f"✅ {redis_key} uploaded successfully to GeoServer!")
                    # style_assignment_payload = f"""
                    #                     <layer>
                    #                         <defaultStyle>
                    #                         <name>{STYLE_NAME}</name>
                    #                     </defaultStyle>
                    #                                 </layer>
                    #                         """
                    
                    # response = requests.put(
                    #             f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                    #                 auth=(USERNAME, PASSWORD),
                    #                 headers=headers,
                    #                     data=style_assignment_payload,
                    #                     )
                    # if response.status_code == 200:
                    #     print(f"✅ Style assigned successfully to {task_id}!")

                    style_assignment_payload = f"""
                                <layer>
                                        <defaultStyle>
                             <name>{STYLE_NAME}</name>
                                        </defaultStyle>
                                                            </layer>
                                                            """

                    response = requests.put(
                                        f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                                    auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                data=style_assignment_payload,
                                                )

                    if response.status_code == 200:
                        print(f"✅ Style assigned successfully to {task_id}!")
                    else:
                        print(f"❌ Failed to assign style. Status Code: {response.status_code}")
                        print(f"Response: {response.text}")

                    wms_url = (
                f"{GEOSERVER_URL}/{WORKSPACE}/wms?"
                "SERVICE=WMS"
                "&VERSION=1.1.1"
                "&REQUEST=GetMap"
                "&FORMAT=image%2Fpng8"
                "&TRANSPARENT=true"
                f"&STYLES=roads_style"
                f"&LAYERS={WORKSPACE}%3A{task_id}"
                "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage"
                "&SRS=EPSG%3A7767"
                "&WIDTH=768"
                "&HEIGHT=742"
                "&BBOX=908276.9790966115%2C1169876.1720715414%2C922936.459593127%2C1184039.3680720811"
                            )
            # Similarly, you can construct the WFS URL if needed:
                    wfs_url = (
                f"{GEOSERVER_URL}/{WORKSPACE}/ows?"
                "SERVICE=WFS"
                "&VERSION=1.0.0"
                "&REQUEST=GetFeature"
                f"&typeName={WORKSPACE}:{task_id}"
                "&outputFormat=application/json"
                        )

            # Construct WMS & WFS URLs
            # wms_url = f"{GEOSERVER_URL}/{WORKSPACE}/wms?service=WMS&version=1.1.0&request=GetMap&layers={WORKSPACE}:{file_name}&bbox=-180,-90,180,90&width=768&height=330&srs=EPSG:4326&format=image/png"
            # wfs_url = f"{GEOSERVER_URL}/{WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName={WORKSPACE}:{file_name}&outputFormat=application/json"
                    return Response({"status": "success", "wms_url": wms_url, "wfs_url": wfs_url},  status=status.HTTP_201_CREATED)

                else:
                    print(f"❌ Failed to upload {redis_key}. Error: {response.text}")
                    return Response({"status": "error", "message": response.text}, status=status.HTTP_400_BAD_REQUEST)

        
        



import os
import json
import geopandas as gpd
import redis
import requests
from django.http import JsonResponse
from django.views import View

db = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

GEOSERVER_URL = "http://localhost:8085/geoserver"
USERNAME = "admin"
PASSWORD = "geoserver"
WORKSPACE = "my_workspace"
STYLE_NAME = "roads_style"
UPLOAD_DIR = "D:/project_GIS/Input_Data/"
SLD_PATH = "D:/project_GIS/styles/roads_style.sld"

# class UploadShapefileToGeoServer(View):
#     def get(self, request, task_id):
#         try:
#             # Retrieve GeoJSON data from Redis
#             geojson_str = db.get(task_id)
#             if not geojson_str:
#                 return JsonResponse({"error": "No data found for task_id"}, status=404)
            
#             geojson_data = json.loads(geojson_str)
#             gdf = gpd.GeoDataFrame.from_features(geojson_data["features"])

#             # Define file paths
#             folder_path = os.path.join(UPLOAD_DIR, task_id)
#             shp_path = os.path.join(folder_path, f"{task_id}.shp")
            
#             os.makedirs(folder_path, exist_ok=True)
#             gdf.to_file(shp_path, driver='ESRI Shapefile')

#             # Upload to GeoServer
#             if not self.upload_to_geoserver(task_id, folder_path):
#                 return JsonResponse({"error": "Failed to upload data to GeoServer"}, status=500)
            
#             # Apply SLD style
#             if not self.apply_sld_style(task_id):
#                 return JsonResponse({"error": "Failed to apply SLD style"}, status=500)

#             return JsonResponse({"message": "Shapefile uploaded and styled successfully"})
        
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)

#     def upload_to_geoserver(self, layer_name, folder_path):
#         headers = {
#             "Content-Type": "application/zip"
#         }
        
#         shp_zip = os.path.join(folder_path, f"{layer_name}.zip")
#         os.system(f'cd {folder_path} && zip -r {shp_zip} *')
        
#         with open(shp_zip, "rb") as f:
#             response = requests.put(
#                 f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{layer_name}/file.shp",
#                 auth=(USERNAME, PASSWORD),
#                 headers=headers,
#                 data=f,
#             )
        
#         return response.status_code in [200, 201]

#     def apply_sld_style(self, layer_name):
#         headers = {"Content-Type": "application/vnd.ogc.sld+xml"}
#         with open(SLD_PATH, "rb") as file:
#             response = requests.put(
#                 f"{GEOSERVER_URL}/rest/styles/{STYLE_NAME}",
#                 auth=(USERNAME, PASSWORD),
#                 headers=headers,
#                 data=file,
#             )
        
#         if response.status_code not in [200, 201]:
#             return False

#         # Assign SLD to layer
#         headers = {"Content-Type": "application/xml"}
#         style_assignment_payload = f"""
#             <layer>
#                 <defaultStyle>
#                     <name>{STYLE_NAME}</name>
#                 </defaultStyle>
#             </layer>
#         """
#         response = requests.put(
#             f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{layer_name}",
#             auth=(USERNAME, PASSWORD),
#             headers=headers,
#             data=style_assignment_payload,
#         )
        
#         return response.status_code in [200, 201]

import random
@api_view(['GET'])
def get_task_result_sec(request, task_id):
    wms_url_point = None
    wfs_url_point = None
    GEOSERVER_URL = "http://localhost:8085/geoserver"
    USERNAME = "admin"
    PASSWORD = "geoserver"
    WORKSPACE = "my_workspace"
    STORE = task_id
    STORE_POINT = f"{task_id}_POINT"
    STYLE_NAME = "group_style"
    STYLE_NAME_POINT = "point_style"
    STYLE_NAME_multi = "roads_style"
    STYLE_NAME_error_F = "error_four_style"
    # STORE = "my_geojson_store"  point_style
    
    """
    Fetch Celery task result from Redis using the task_id.
    """
    print("task_id:_____________________________________", task_id)
    redis_key = task_id  # Redis key pattern for Celery tasks
    # task_data = redis_client.get("{redis_key}:count")  # Fetch data from Redis
    chunk_count = redis_client.get(f"{redis_key}:count")
    chunk_count = int(chunk_count)
    if not chunk_count:
        print("Task result not found")
        exit()
    chunk_count = int(chunk_count)
    print("Chunk count:", chunk_count)  
    geojson_str = "".join(redis_client.get(f"{redis_key}:{i}") for i in range(chunk_count))
    if isinstance(geojson_str, str):  # If result is stored as a string, convert to JSON
        print("convert into geojson")
        result = json.loads(geojson_str)

        #point file
    chunk_count_POINT = redis_client.get(f"{redis_key}_POINT:count")
    # chunk_count_POINT = int(chunk_count_POINT)
    # if not chunk_count_POINT:
    #     print("Task result not found")
    #     exit()
    # geojson_str_point = "".join(redis_client.get(f"{redis_key}_POINT:{i}") for i in range(chunk_count_POINT))
    # if isinstance(geojson_str_point, str):  # If result is stored as a string, convert to JSON
    #     print("convert into geojson")
    #     result_point = json.loads(geojson_str_point)
    if chunk_count_POINT is not None:
        chunk_count_POINT = int(chunk_count_POINT)
        geojson_str_point = "".join(redis_client.get(f"{redis_key}_POINT:{i}") or "" for i in range(chunk_count_POINT))  # Avoid None

        if isinstance(geojson_str_point, str) and geojson_str_point:  # Ensure it's a non-empty string
            print("Convert into geojson")
            result_point = json.loads(geojson_str_point)

            if result_point:
                result_keys_point = result_point.keys()
                print("_________________", list(result_keys_point))
                # return Response({"status": "success", "task_data": result_point})
                print("point", result.get("crs"))  
                geojson_projection = None
                if isinstance(result.get("crs"), dict):
                    print("eeeeeeeeeeeeeeeeeeeeeeeeeee")
                    # shapefile_projection = result_keys_point.get("crs").get("properties").get("name") #GETING CORRECT PROJECTION
                    shapefile_projection = result_point.get("crs", {}).get("properties", {}).get("name")
                    if shapefile_projection:
                        try:
                            shapefile_projection = CRS(shapefile_projection)  # Convert string to CRS object
                        except Exception as e:
                            print("Invalid CRS format:", shapefile_projection, e)
                            shapefile_projection = None
                    print("_________________shapefile_projection", shapefile_projection)
                    # shapefile_projection =(
                    #                                 result_point.get("crs", {}).get("properties", {}).get("name")
                    #             )
                    print("_________________shapefile_projection", shapefile_projection)
                            # shapefile_projection = "EPSG:3347"
                    print("_________________shapefile_projection", shapefile_projection)    
                    geojson_projection = CRS.from_epsg(4326)
                    if shapefile_projection and shapefile_projection != geojson_projection:
                            print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                                # transformer = Transformer.from_crs(geojson_projection, shapefile_projection, always_xy=True)
                            transformer = Transformer.from_crs(shapefile_projection, geojson_projection, always_xy=True)
                            data_file_point = result_point.get("features") #LIST OF OBJ
                            if  isinstance(data_file_point, list):
                                print("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                                new_data_fet_point = []
                                for feature in data_file_point:
                                    geometry = feature.get("geometry")  #OBJE HAVING CORDINATE
                                    if geometry:
                                        coordinates = geometry.get("coordinates")
                                        if geometry.get("type") == "Point":
                                            if coordinates:
                                                x, y = transformer.transform(coordinates[0], coordinates[1])
                                                geometry["coordinates"] = [x, y]
                                    new_data_fet_point.append(feature)
                                result_point["features"] = new_data_fet_point  
                                result_point["crs"] = {
                                            "type": "name",
                                            "properties": {"name": str(geojson_projection)}
                                                }
                                # new_data_fet.append(feature)

                    crs = str(geojson_projection)
                    print("________________________________________________", crs)
                    # return Response({"status": "success", "task_data": result_point})
                    gdf_point = gpd.GeoDataFrame.from_features(result_point["features"], crs=crs)
                    mem_zip_point = io.BytesIO()
                    with tempfile.TemporaryDirectory() as tmpdir:
                        shapefile_base_point = os.path.join(tmpdir, f"{task_id}_POINT")
                        gdf_point.to_file(shapefile_base_point + ".shp")
                    # gdf.to_file(shapefile_path)
                        with zipfile.ZipFile(mem_zip_point, 'w', zipfile.ZIP_DEFLATED) as zf:
                            for root, dirs, files in os.walk(tmpdir):
                                for file in files:
                                    file_path = os.path.join(root, file)
                                    zf.write(file_path, arcname=file)
                        mem_zip_point.seek(0)
                        rest_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{STORE_POINT}/file.shp"
                        headers = {"Content-type": "application/zip"}
                        print("__________________________GEOSERVERPOINT____________________________________________________")
                        response = requests.put(
                                rest_url,
                                data=mem_zip_point.read(),
                                headers=headers,
                                auth=(USERNAME, PASSWORD)
                                    )
                        if response.status_code == 201:
                            print(f"✅ {redis_key} uploaded successfully POINT to GeoServer!")
                            # feature_value = result["features"]
                                # unique_aud_grp = {feature["properties"]["AUD_ERR"] for feature in feature_value}
                                # aud_grp_values = sorted(unique_aud_grp)
                                # top_500_groups = aud_grp_values[:5000]
                                # remaining_groups = aud_grp_values[100:] 
                                # Define color mapping for AUD_ERR values
                            # color_map_point = {
                            #     0: "#008000",  # Green
                            #     1: "#0000FF",  # Blue
                            #     2: "#FFFF00",  # Yellow
                            #     3: "#FF0000",  # Red
                            #                             }

                                                # Generate SLD rules for AUD_ERR values
                            sld_template = f"""<?xml version="1.0" encoding="UTF-8"?>
                                <sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld"
                                    xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
                                    <sld:NamedLayer>
                                        <sld:Name>AUD_ERR Styling</sld:Name>
                                        <sld:UserStyle>
                                            <sld:Title>Styled by AUD_ERR</sld:Title>
                                            <sld:FeatureTypeStyle>

                                                <!-- Green for AUD_ERR = 0 -->
                                                <sld:Rule>
                                                    <sld:Name>AUD_ERR_0</sld:Name>
                                                    <sld:Title>AUD_ERR 0</sld:Title>
                                                    <ogc:Filter>
                                                        <ogc:PropertyIsEqualTo>
                                                            <ogc:PropertyName>AUD_ERR</ogc:PropertyName>
                                                            <ogc:Literal>0</ogc:Literal>
                                                        </ogc:PropertyIsEqualTo>
                                                    </ogc:Filter>
                                                    <sld:PointSymbolizer>
                                                        <sld:Graphic>
                                                            <sld:Mark>
                                                                <sld:WellKnownName>circle</sld:WellKnownName>
                                                                <sld:Fill>
                                                                    <sld:CssParameter name="fill">#008000</sld:CssParameter>
                                                                </sld:Fill>
                                                            </sld:Mark>
                                                            <sld:Size>6</sld:Size>
                                                        </sld:Graphic>
                                                    </sld:PointSymbolizer>
                                                </sld:Rule>

                                                <!-- Blue for AUD_ERR = 1 -->
                                                <sld:Rule>
                                                    <sld:Name>AUD_ERR_1</sld:Name>
                                                    <sld:Title>AUD_ERR 1</sld:Title>
                                                    <ogc:Filter>
                                                        <ogc:PropertyIsEqualTo>
                                                            <ogc:PropertyName>AUD_ERR</ogc:PropertyName>
                                                            <ogc:Literal>1</ogc:Literal>
                                                        </ogc:PropertyIsEqualTo>
                                                    </ogc:Filter>
                                                    <sld:PointSymbolizer>
                                                        <sld:Graphic>
                                                            <sld:Mark>
                                                                <sld:WellKnownName>circle</sld:WellKnownName>
                                                                <sld:Fill>
                                                                    <sld:CssParameter name="fill">#0000FF</sld:CssParameter>
                                                                </sld:Fill>
                                                            </sld:Mark>
                                                            <sld:Size>6</sld:Size>
                                                        </sld:Graphic>
                                                    </sld:PointSymbolizer>
                                                </sld:Rule>

                                                <!-- Yellow for AUD_ERR = 2 -->
                                                <sld:Rule>
                                                    <sld:Name>AUD_ERR_2</sld:Name>
                                                    <sld:Title>AUD_ERR 2</sld:Title>
                                                    <ogc:Filter>
                                                        <ogc:PropertyIsEqualTo>
                                                            <ogc:PropertyName>AUD_ERR</ogc:PropertyName>
                                                            <ogc:Literal>2</ogc:Literal>
                                                        </ogc:PropertyIsEqualTo>
                                                    </ogc:Filter>
                                                    <sld:PointSymbolizer>
                                                        <sld:Graphic>
                                                            <sld:Mark>
                                                                <sld:WellKnownName>circle</sld:WellKnownName>
                                                                <sld:Fill>
                                                                    <sld:CssParameter name="fill">#FFFF00</sld:CssParameter>
                                                                </sld:Fill>
                                                            </sld:Mark>
                                                            <sld:Size>6</sld:Size>
                                                        </sld:Graphic>
                                                    </sld:PointSymbolizer>
                                                </sld:Rule>

                                                <!-- Red for AUD_ERR = 3 -->
                                                <sld:Rule>
                                                    <sld:Name>AUD_ERR_3</sld:Name>
                                                    <sld:Title>AUD_ERR 3</sld:Title>
                                                    <ogc:Filter>
                                                        <ogc:PropertyIsEqualTo>
                                                            <ogc:PropertyName>AUD_ERR</ogc:PropertyName>
                                                            <ogc:Literal>3</ogc:Literal>
                                                        </ogc:PropertyIsEqualTo>
                                                    </ogc:Filter>
                                                    <sld:PointSymbolizer>
                                                        <sld:Graphic>
                                                            <sld:Mark>
                                                                <sld:WellKnownName>circle</sld:WellKnownName>
                                                                <sld:Fill>
                                                                    <sld:CssParameter name="fill">#FF0000</sld:CssParameter>
                                                                </sld:Fill>
                                                            </sld:Mark>
                                                            <sld:Size>6</sld:Size>
                                                        </sld:Graphic>
                                                    </sld:PointSymbolizer>
                                                </sld:Rule>

                                                <!-- Default black for any other value -->
                                                <sld:Rule>
                                                    <sld:Name>Default_AUD_ERR</sld:Name>
                                                    <sld:Title>Other Values</sld:Title>
                                                    <ogc:ElseFilter/>
                                                    <sld:PointSymbolizer>
                                                        <sld:Graphic>
                                                            <sld:Mark>
                                                                <sld:WellKnownName>circle</sld:WellKnownName>
                                                                <sld:Fill>
                                                                    <sld:CssParameter name="fill">#000000</sld:CssParameter>
                                                                </sld:Fill>
                                                            </sld:Mark>
                                                            <sld:Size>6</sld:Size>
                                                        </sld:Graphic>
                                                    </sld:PointSymbolizer>
                                                </sld:Rule>

                                            </sld:FeatureTypeStyle>
                                        </sld:UserStyle>
                                    </sld:NamedLayer>
                                </sld:StyledLayerDescriptor>"""



                            response_to_style = requests.put(
                                f"{GEOSERVER_URL}/rest/styles/point_style",
                                auth=(USERNAME, PASSWORD),
                                headers={"Content-Type": "application/vnd.ogc.sld+xml"},
                                data=sld_template,
                            )
                                



                        else:
                            return JsonResponse({"error": "Failed to upload data to GeoServer"}, status=500)
                        
                        if response_to_style.status_code == 200:
                                print("✅ Style created POINT successfully!")
                                style_assignment_payload = f"""
                                            <layer>
                                                <defaultStyle>
                                                    <name>{STYLE_NAME_POINT}</name>
                                                </defaultStyle>
                                            </layer>
                                            """
                                response = requests.put(
                                        f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{STORE_POINT}",
                                            auth=(USERNAME, PASSWORD),
                                                headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                data=style_assignment_payload,
                                                    )

                                if response.status_code == 200:
                                    print(f"✅ Style assigned POINT successfully to {STORE_POINT}!")
                                else:
                                    print(f"❌ Failed to assign style POINT. Status Code: {response.status_code}")
                                    print(f"Response: {response.text}")
                                wms_url_point = (
                                    f"{GEOSERVER_URL}/{WORKSPACE}/wms?"
                                "SERVICE=WMS"
                                    "&VERSION=1.1.1"
                                    "&REQUEST=GetMap"
                                    "&FORMAT=image%2Fpng8"
                                    "&TRANSPARENT=true"
                                    f"&STYLES=roads_style"
                                    f"&LAYERS={WORKSPACE}%3A{STORE_POINT}"
                                    "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage"
                                    "&SRS=EPSG%3A7767"
                                    "&WIDTH=768"
                                    "&HEIGHT=742"
                                    "&BBOX=908276.9790966115%2C1169876.1720715414%2C922936.459593127%2C1184039.3680720811"
                                            )
                    # Similarly, you can construct the WFS URL if needed:
                                wfs_url_point = (
                                        f"{GEOSERVER_URL}/{WORKSPACE}/ows?"
                                        "SERVICE=WFS"
                                        "&VERSION=1.0.0"
                                        "&REQUEST=GetFeature"
                                        f"&typeName={WORKSPACE}:{STORE_POINT}"
                                        "&outputFormat=application/json"
                                            )
                                
    else:
        print("⚠️ POINT data not found, skipping POINT processing.")


    if result:
            # return Response({"status": "success", "task_data": result})
            # result_keys = result.keys()  # dict_keys(["key1", "key2"])["properties"]["AUD_GRP"]
            # print("_________________", list(result_keys))
            # print(result.get("features").get("properties").keys())
            # print("crsccc", result.get("crs"))  
            geojson_projection = None
            if isinstance(result.get("crs"), dict):
                print("eeeeeeeeeeeeeeeeeeeeeeeeeee")
                shapefile_projection = result.get("crs").get("properties").get("name") #GETING CORRECT PROJECTION
                    # shapefile_projection = "EPSG:3347"
                print("_________________shapefile_projection", shapefile_projection)    
                geojson_projection = CRS.from_epsg(4326)  #GCS projection
                is_multistring = False
                is_AUD_ERR_F = False
                if shapefile_projection != geojson_projection:
                    print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                        # transformer = Transformer.from_crs(geojson_projection, shapefile_projection, always_xy=True)
                    transformer = Transformer.from_crs(shapefile_projection, geojson_projection, always_xy=True)
                    data_file = result.get("features") #LIST OF OBJ
                    if  isinstance(data_file, list):
                        print("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                        new_data_fet = []
                        for feature in data_file:
                            geometry = feature.get("geometry")  #OBJE HAVING CORDINATE
                            errorrr = feature.get("properties", {}).get("AUD_ERR", None)
                            if errorrr == 4:
                                print("_____________PRESENT_______________________")
                                is_AUD_ERR_F = True
                            if geometry:
                                coordinates = geometry.get("coordinates")
                                if geometry.get("type") == "LineString":
                                    # coordinates = geometry.get("coordinates")
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                                # print("HHHHHHHH")
                                            new_coords = []
                                            for coord in coordinates:
                                                x, y = transformer.transform(coord[0], coord[1])
                                                new_coords.append([x, y])
                                            # print("new_coords___________________________________", new_coords)
                                            # geometry["coordinates"] = new_coords
                                        feature["geometry"]["coordinates"] = new_coords
                                    else:
                                        print("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
                                        x, y = transformer.transform(coordinates[0], coordinates[1])
                                        geometry["coordinates"] = [x, y]
                                        # feature["geometry"] = geometry
                                    # new_data_fet.append(feature)
                                elif geometry.get("type") == "MultiLineString":
                                    is_multistring = True
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                            new_list_cordinate = []   #list of list want
                                            for cord in coordinates:  #LIST OF LIST
                                                new_list_coords = []   #single list
                                                for coord in cord: #LIST
                                                    # new_coords = []
                                                    # for cordinatedd in coord: #from single list element unpacking
                                                    x, y = transformer.transform(coord[0], coord[1])
                                                    new_list_coords.append([x, y])
                                                new_list_cordinate.append(new_list_coords)
                                                    # x, y = transformer.transform(coord[0], coord[1])
                                                    # new_coords.append([x, y])
                                                # new_list_cordinate.append(new_coords)
                                            # new_data_fet.append(feature)
                                            feature["geometry"]["coordinates"] = new_list_cordinate
                                elif geometry.get("type") == "Polygon":
                                    if coordinates:
                                        if isinstance(coordinates[0], list):
                                            new_list_cordinate = []
                                            for cord in coordinates[0]:
                                                x, y = transformer.transform(cord[0], cord[1])
                                                new_list_cordinate.append([x, y])
                                            feature["geometry"]["coordinates"] = [new_list_cordinate]
                                            
                                    # pass
                                    # pass
                                elif geometry.get("type") == "Point":
                                    if coordinates:
                                        x, y = transformer.transform(coordinates[0], coordinates[1])
                                        geometry["coordinates"] = [x, y]
                            new_data_fet.append(feature)

                        result["features"] = new_data_fet  
                        result["crs"] = {
                                    "type": "name",
                                    "properties": {"name": str(geojson_projection)}
                                        }
                        # return Response({"status": "success", "task_data": result})
                            # result["features"] = data_file
                    # elif isinstance(task_data, dict):  # If it's already a dict, use it directly
                    #     pass
                    # else:
                    #     raise ValueError("Unexpected task_data format") 
                else:
                    data_file = result.get("features") #LIST OF OBJ
                    if  isinstance(data_file, list):
                        print("GCSSSSSSSSSSSSSSSSSSSSSSSSSS")
                        # new_data_fet = []
                        for feature in data_file:
                            geometry = feature.get("geometry")  #OBJE HAVING CORDINATE
                            if geometry.get("type") == "MultiLineString":
                                is_multistring = True
                            errorrr = feature.get("properties", {}).get("AUD_ERR", None)
                            if errorrr == 4:
                                print("_____________PRESENT_______________________")
                                is_AUD_ERR_F = True
                    
        
                crs = str(geojson_projection)
                print("________________________________________________", crs)
                gdf = gpd.GeoDataFrame.from_features(result["features"], crs=crs)
                mem_zip = io.BytesIO()
                with tempfile.TemporaryDirectory() as tmpdir:
                    shapefile_base = os.path.join(tmpdir, f"{task_id}")
                    gdf.to_file(shapefile_base + ".shp")
            # gdf.to_file(shapefile_path)
                    with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
                        for root, dirs, files in os.walk(tmpdir):
                            for file in files:
                                file_path = os.path.join(root, file)
                                zf.write(file_path, arcname=file)
        
        # with tempfile.TemporaryDirectory() as tmpdir:
        #     shapefile_base = os.path.join(tmpdir, f"{task_id}")
        #     # This will create multiple files: .shp, .shx, .dbf, .prj, etc.
        #     gdf.to_file(shapefile_base + ".shp")
        #     with zipfile.ZipFile(mem_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        #         for root, dirs, files in os.walk(tmpdir):
        #             for file in files:
        #                 file_path = os.path.join(root, file)
        #                 zf.write(file_path, arcname=file)
                    mem_zip.seek(0)
                    rest_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{STORE}/file.shp"
                    headers = {"Content-type": "application/zip"}
                    print("__________________________GEOSERVER____________________________________________________")
                    response = requests.put(
                        rest_url,
                     data=mem_zip.read(),
                        headers=headers,
                        auth=(USERNAME, PASSWORD)
                             )
                if response.status_code == 201:
                    print(f"✅ {redis_key} uploaded successfully to GeoServer!")
                    # print("VVVVVVVVVVis_AUD_ERR_Fis_AUD_ERR_F", is_AUD_ERR_F)
                    # print("is_multistringis_multistringis_multistringis_multistring", is_multistring)
                    if  is_multistring:

                        style_assignment_payload = f"""
                                <layer>
                                        <defaultStyle>
                             <name>{STYLE_NAME_multi}</name>
                                        </defaultStyle>
                                                            </layer>
                                                            """
                        response = requests.put(
                                        f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                                    auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                data=style_assignment_payload,
                                                )
                        
                        if response.status_code == 200:
                            print(f"✅ Style assigned successfully to Multi{task_id}!")
                        else:
                            print(f"❌ Failed to assign style. Status Code: {response.status_code}")
                            print(f"Response: {response.text}")

                    elif is_AUD_ERR_F:
                        print("_________________________AUD_ERR_F_______DDDDDDDDDDDDDDD___________________")   
                        style_assignment_payload = f"""
                                <layer>
                                        <defaultStyle>
                             <name>{STYLE_NAME_error_F}</name>
                                        </defaultStyle>
                                                            </layer>
                                                            """
                        response = requests.put(
                                        f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                                    auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                data=style_assignment_payload,
                                                )
                        if response.status_code == 200:
                            print(f"✅ Style assigned successfully to Multi{task_id}!")
                        else:
                            print(f"❌ Failed to assign style. Status Code: {response.status_code}")
                            print(f"Response: {response.text}")

                    else:

                        def random_color():
                            return "#{:06x}".format(random.randint(0, 0xFFFFFF))
                        # aud_grp_values = [1, 2, 3, 4, 5, 6]

                        feature_value = result["features"]
                    #       <PointSymbolizer>
                    #     <Geometry>
                    #         <ogc:Function name="endPoint">
                    #             <ogc:PropertyName>the_geom</ogc:PropertyName>
                    #         </ogc:Function>
                    #     </Geometry>
                    #     <Graphic>
                    #         <Mark>
                    #             <WellKnownName>shape://oarrow</WellKnownName>
                    #             <Fill>
                    #             <CssParameter name="fill">#0000FF</CssParameter>
                    #             <CssParameter name="fill-opacity">0.5</CssParameter>
                    #             </Fill>
                    #             <Stroke>
                    #                 <CssParameter name="stroke">#0000FF</CssParameter>
                    #                 <CssParameter name="stroke-width">2</CssParameter>
                    #             </Stroke>
                    #         </Mark>
                    #         <Size>30</Size>
                    #         <Rotation>
                    #             <ogc:Function name="endAngle">
                    #                 <ogc:PropertyName>the_geom</ogc:PropertyName>
                    #             </ogc:Function>
                    #         </Rotation>
                    #     </Graphic>
                    # </PointSymbolizer>
                        unique_aud_grp = {feature["properties"]["AUD_GRP"] for feature in feature_value}
                        aud_grp_values = sorted(unique_aud_grp)
                        top_500_groups = aud_grp_values[:5000]
                        remaining_groups = aud_grp_values[100:] 
                        color_map = {grp: random_color() for grp in top_500_groups}
                        sld_rules = "".join(
                                            f"""
                                        <sld:Rule>
                                            <sld:Name>AUD_GRP_{grp}</sld:Name>
                                            <sld:Title>Group {grp}</sld:Title>
                                            <ogc:Filter>
                                                <ogc:PropertyIsEqualTo>
                                                <ogc:PropertyName>AUD_GRP</ogc:PropertyName>
                                                    <ogc:Literal>{grp}</ogc:Literal>
                                                </ogc:PropertyIsEqualTo>
                                            </ogc:Filter>
                                            <sld:LineSymbolizer>
                                                <sld:Stroke>
                                                    <sld:CssParameter name="stroke">{color_map[grp]}</sld:CssParameter>
                                                    <sld:CssParameter name="stroke-width">2</sld:CssParameter>
                                                </sld:Stroke>
                                            </sld:LineSymbolizer>
                                        </sld:Rule>
                                        """
                                        for grp in top_500_groups
                                    )

    # Default black color rule (will only apply if no other rule matches)
                        default_rule = """
                                        <sld:Rule>
                                            <sld:Name>Default_Group</sld:Name>
                                            <sld:Title>Other Groups</sld:Title>
                                            <ogc:ElseFilter/>
                                            <sld:LineSymbolizer>
                                                <sld:Stroke>
                                                <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                                                    <sld:CssParameter name="stroke-width">2</sld:CssParameter>
                                                </sld:Stroke>
                                            </sld:LineSymbolizer>
                                        </sld:Rule>

                                    <!--
                                      <sld:Rule>
  <PointSymbolizer>
                        <Geometry>
                            <ogc:Function name="endPoint">
                                <ogc:PropertyName>the_geom</ogc:PropertyName>
                            </ogc:Function>
                        </Geometry>
                        <Graphic>
                            <Mark>
                                <WellKnownName>shape://oarrow</WellKnownName>
                                <Fill>
                                <CssParameter name="fill">#000000</CssParameter>
                                <CssParameter name="fill-opacity">0.2</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#000000</CssParameter>
                                    <CssParameter name="stroke-width">2</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>30</Size>
                            <Rotation>
                                <ogc:Function name="endAngle">
                                    <ogc:PropertyName>the_geom</ogc:PropertyName>
                                </ogc:Function>
                            </Rotation>
                        </Graphic>
                    </PointSymbolizer>
</sld:Rule>
             -->
                                        """

                        sld_template = f"""<?xml version="1.0" encoding="UTF-8"?>
                            <sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" 
                                xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
                                <sld:NamedLayer>
                                <sld:Name>AUD_GRP Styling</sld:Name>
                                    <sld:UserStyle>
                                    <sld:Title>Styled by AUD_GRP</sld:Title>
                                    <sld:FeatureTypeStyle>
                                            {sld_rules}
                                            {default_rule}
                                        </sld:FeatureTypeStyle>
                                    </sld:UserStyle>
                                </sld:NamedLayer>
                            </sld:StyledLayerDescriptor>"""

                        response_to_style = requests.put(
                            f"{GEOSERVER_URL}/rest/styles/group_style",
                            auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "application/vnd.ogc.sld+xml"},
                            data=sld_template,
                        )
                        if response_to_style.status_code == 200:
                            print("✅ Style created successfully!")
                            style_assignment_payload = f"""
                                    <layer>
                                            <defaultStyle>
                                <name>{STYLE_NAME}</name>
                                            </defaultStyle>
                                                                </layer>
                                                                """
                            response = requests.put(
                                            f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                                        auth=(USERNAME, PASSWORD),
                                headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                    data=style_assignment_payload,
                                                    )
                        if response.status_code == 200:
                            print(f"✅ Style assigned successfully to {task_id}!")
                        else:
                            print(f"❌ Failed to assign style. Status Code: {response.status_code}")
                            print(f"Response: {response.text}")

                    wms_url = (
                            f"{GEOSERVER_URL}/{WORKSPACE}/wms?"
                "SERVICE=WMS"
                "&VERSION=1.1.1"
                "&REQUEST=GetMap"
                "&FORMAT=image%2Fpng8"
                "&TRANSPARENT=true"
                f"&STYLES=roads_style"
                f"&LAYERS={WORKSPACE}%3A{task_id}"
                "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage"
                "&SRS=EPSG%3A7767"
                "&WIDTH=768"
                "&HEIGHT=742"
                "&BBOX=908276.9790966115%2C1169876.1720715414%2C922936.459593127%2C1184039.3680720811"
                            )
            # Similarly, you can construct the WFS URL if needed:
                    wfs_url = (
                f"{GEOSERVER_URL}/{WORKSPACE}/ows?"
                "SERVICE=WFS"
                "&VERSION=1.0.0"
                "&REQUEST=GetFeature"
                f"&typeName={WORKSPACE}:{task_id}"
                "&outputFormat=application/json"
                        )

            # Construct WMS & WFS URLs
            # wms_url = f"{GEOSERVER_URL}/{WORKSPACE}/wms?service=WMS&version=1.1.0&request=GetMap&layers={WORKSPACE}:{file_name}&bbox=-180,-90,180,90&width=768&height=330&srs=EPSG:4326&format=image/png"
            # wfs_url = f"{GEOSERVER_URL}/{WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName={WORKSPACE}:{file_name}&outputFormat=application/json"
                    return Response({"status": "success", "wms_url": wms_url, "wfs_url": wfs_url, "wms_url_point":wms_url_point, "wfs_url_point":wfs_url_point},  status=status.HTTP_201_CREATED)

                    # else:
                    #     print(f"❌ Failed to upload {redis_key}. Error: {response.text}")
                    #     return Response({"status": "error", "message": response.text}, status=status.HTTP_400_BAD_REQUEST)
                        

                else:
                        print(f"❌ Failed to create style. Status Code: {response_to_style.status_code}")

                    








                    
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import time
import asyncio
class SSEView(APIView):
    """Django REST API for Server-Sent Events (SSE)"""
    permission_classes = [AllowAny]  # Public API (Customize as needed)

    def get(self, request, *args, **kwargs):
        """Handles GET request and streams data"""
        response = StreamingHttpResponse(self.event_stream(), content_type="text/event-stream")
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'  # Disable buffering for Nginx
        return response

    def event_stream(self):
        """Simulate real-time file processing events"""
        for i in range(5):
            yield f"data: Processing Step {i+1}\n\n"
            asyncio.sleep(20)  # Simulate processing delay
        yield "data: File processing completed!\n\n"
                    

                    