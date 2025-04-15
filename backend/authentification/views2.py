from django.shortcuts import render,redirect, HttpResponse
from django.db.models import Q
from django.contrib import messages
from django.core.mail import send_mail
import uuid
from rest_framework import status
from .models import User_login_Data,Users_login_Details_Data,password_table
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .helpers import send_forget_password_mail

from .views import token_unhash

def xyx(request):
    return HttpResponse('<h1>cccccccc</h1>')

@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def change_password(request):
    if request.method == "GET":
        token_get = request.query_params.get('token')
        if token_get:
            try:
                decoded = token_unhash(token_get)
            except ValueError as e:
                return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"USERNAME":decoded.get("USERNAME"),"EMAIL":decoded.get("EMAIL", None), "USER_TYPE":decoded.get("USER_TYPE", None), "timer":(decoded.get("exp")-int(timezone.now().timestamp()))/60}, status=status.HTTP_200_OK)
        # return Response({"USERNAME": decoded.get("USERNAME"), "EMAIL":decoded.get("EMAIL"),"USER_TYPE":decoded.get("USER_TYPE"), "timer":(decoded.get("exp")-int(timezone.now().timestamp()))/60}, status=status.HTTP_200_OK)
        else:
            return Response({"errors": "No Token Provided"}, status=status.HTTP_400_BAD_REQUEST)   
    elif  request.method == "POST":
        user_info = request.data
        x = user_info.get("USERNAME")
        y = user_info.get("PASSWORD")
        try:
            result = User_login_Data.objects.get(USERNAME=x)
            if check_password(y, result.PASSWORD):
                return Response({"message":"Credintial Match"}, status=status.HTTP_200_OK)
            else:
                return Response({"errors":"Password Not Match"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors": f"User Not Exist. Error: {str(e)}"} , status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PATCH":
        user_info = request.data
        keys_to_required = ["USERNAME", "OLD_PASSWORD", "NEW_PASSWORD", "PASSWORD"]
        user_info_1 = {key: value for key, value in user_info.items() if key  in keys_to_required}

        x = user_info_1.get("USERNAME")
        y = user_info_1.get("OLD_PASSWORD")
        token_get = request.query_params.get('token')
        try:
            result = User_login_Data.objects.get(USERNAME=x)
            if y:
                pass
            else:
                if token_get:
                    if result.SU_APRO_STAT == "PENDING":
                        try:
                            decoded = token_unhash(token_get)
                            if x != decoded.get("USERNAME"):
                                return  Response({"errors":"UserName Not match"}, status=status.HTTP_400_BAD_REQUEST)
                            y = decoded.get("PASSWORD")
                        except ValueError as e:
                            return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        pass
                else:
                    pass
            if check_password(y, result.PASSWORD):
                if user_info_1.get("PASSWORD") == user_info_1.get("NEW_PASSWORD"):
                    serializer_a = User_login_Data_serialiser112(result, data= user_info_1, partial=True)
                    if serializer_a.is_valid():
                        # token_get = request.query_params.get('token')
                        if token_get:
                            result.SU_APRO_STAT="APPROVED"
                            result.save()
                            # serializer_a.validated_data['SU_APRO_STAT'] = "APPROVED"
                            # if result.SU_APRO_STAT == "PENDING":
                            #     try:
                            #         decoded = token_unhash(token_get)
                            #     except ValueError as e:
                            #         return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            #     if x != decoded.get("USERNAME") or y != decoded.get("PASSWORD"):
                            #         return  Response({"errors":"USERNAME or PASSWORD  Not match"}, status=status.HTTP_400_BAD_REQUEST)
                                
                            # result.SU_APRO_STAT = "APPROVED"
                            # result.save()
                            # else:
                            #     return Response({"errors":"You Not Allowed"}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            if result.USER_TYPE == "AU" and result.SU_APRO_STAT == "PENDING":
                                return Response({"errors":"You Not Allowed"}, status=status.HTTP_400_BAD_REQUEST)
                        if result.USER_TYPE == "AU":
                            ad = result.ADMIN_TYPE 
                            admin_type_short = (ad[0:2] if ad else "")+"AU" 
                        else:
                            admin_type_short = result.USER_TYPE  # Non-admin users
                        password_change_mail_bravo(result.EMAIL, result.USERNAME, admin_type_short)
                        serializer_a.save(APRO_DATE=timezone.now())
                        return Response({"message":"Password Changed Successfully"}, status=status.HTTP_200_OK)
                    else:
                        return Response({"errors":serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"errors":"Password Not Match"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"errors":"Password Not Match"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errors": f"User Not Exist. Error: {str(e)}"} , status=status.HTTP_400_BAD_REQUEST)
        
    else:
        return Response({'errors': 'Method Not Allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def contact_us(request):
    if request.method =='POST':
         resister_info = request.data
         serializer = contact_us_serialiser(data=resister_info)
         if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Method Not Allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
