
from rest_framework.response import Response  
from django.core.exceptions import ValidationError
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from authentification.models import User_login_Data, Testclass
from authentification.serializers import HTTPRequestResponseSerializer
import jwt        
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
import threading
import time
from django.db.models.signals import pre_save
# from django.utils.functional import curry   #not working
from functools import partial
from django.apps import apps
from auditlog.models import LogEntry
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
threadlocal = threading.local()
threadlocal = threading.local()
# from rest_framework_simplejwt.authentication import JSONWebTokenAuthentication
# # from rest_framework_simplejwt.authentication import JWTAuthentication

# from django.utils.functional import SimpleLazyObject

# class AuthenticationTokenMiddleware:

#     """Authentication middleware which return user from token."""



#     def __init__(self, get_response):

#         """Initializer."""

#         self.get_response = get_response



#     def __call__(self, request):

#         """Response."""

#         user = request.user

#         request.user = SimpleLazyObject(lambda: self.get_token_user(request, user))

#         return self.get_response(request)



#     def get_token_user(self, request, user):

#         """Return user from DRF token."""

#         try:

#             authenticator = JSONWebTokenAuthentication()

#             return authenticator.authenticate(request)[0]

#         except Exception:

#             return user

def simple_middleware(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        

        response = get_response(request)
        
        authorization_header = request.headers.get('Authorization')
        if authorization_header and authorization_header.startswith('Bearer '):
            token = authorization_header.split(' ')[1]
            try:
                # Verify the JWT token
                access_token = AccessToken(token)
                user_id = access_token.payload.get('user_id')
                # Assuming the payload contains user information, you can access it like:
                if user_id:
                    # Assuming the payload contains user information, you can access it like:
                    USERNAME = User_login_Data.objects.get(id = user_id)
                    actor_id = user_id
                    request.user = User_login_Data.objects.get(id = user_id)
                else:
                    # Handle the case where user information is not present in the token
                    USERNAME = "Anonymous"
            except jwt.ExpiredSignatureError:
                # Handle expired token
                USERNAME = "Anonymous"
            except jwt.InvalidTokenError:
                # Handle invalid token
                USERNAME = "Anonymous"
        else:
            # Handle the case for requests without a valid JWT token
            USERNAME = "Anonymous"
    #     if request.user.is_authenticated:
    #         username = "Anonymous"
    #     else:
    # # Access attributes for authenticated users
    #         username = request.user.USERNAME
    #         print(request.user.USERNAME)
    #     # Code to be executed for each request/response after
    #     # the view is called.
            

        return response

    return middleware





# # from django.utils.middleware import MiddlewareMixin
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
class MyMiddleware(MiddlewareMixin):
    def process_request(self, request):
        threadlocal.auditlog = {
            'signal_duid': (self.__class__, time.time()),
            'remote_addr': request.META.get('REMOTE_ADDR'),
        }
        
        if request.META.get('HTTP_X_FORWARDED_FOR'):
            threadlocal.auditlog['remote_addr'] = request.META.get('HTTP_X_FORWARDED_FOR').split(',')[0]

        # Connect signal for automatic logging
        set_actor = partial(self.set_actor, request=request, signal_duid=threadlocal.auditlog['signal_duid'])
        pre_save.connect(set_actor, sender=LogEntry, dispatch_uid=threadlocal.auditlog['signal_duid'], weak=False)

        # return None

    def process_response(self, request, response):
        if hasattr(threadlocal, 'auditlog'):
            pre_save.disconnect(sender=LogEntry, dispatch_uid=threadlocal.auditlog['signal_duid'])

        return response
    
    
    def process_exception(self, request, exception):
        """
        Disconnects the signal receiver to prevent it from staying active in case of an exception.
        """
        if hasattr(threadlocal, 'auditlog'):
            pre_save.disconnect(sender=LogEntry, dispatch_uid=threadlocal.auditlog['signal_duid'])

        return None

    @staticmethod
    def set_actor(request, sender, instance, signal_duid, **kwargs):
        """
        Signal receiver with an extra, required 'user' kwarg. This method becomes a real (valid) signal receiver when
        it is curried with the actor.
        """
        if hasattr(threadlocal, 'auditlog'):
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                return
            if signal_duid != threadlocal.auditlog['signal_duid']:
                return
            try:
                app_label, model_name = settings.AUTH_USER_MODEL.split('.')
                auth_user_model = apps.get_model(app_label, model_name)
            except ValueError:
                auth_user_model = apps.get_model('auth', 'user')
            if sender == LogEntry and isinstance(request.user, auth_user_model) and instance.actor is None:
                instance.actor = request.user

            instance.remote_addr = threadlocal.auditlog['remote_addr']
        

class myCustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path[:11] == '/superuser/' or (request.method == "GET" and request.path == '/change_password/'):
            response = self.get_response(request)
            if request.method == "GET" and request.path == '/change_password/':
                if response.data.get("USER_TYPE", None) != "SU":
                    if not User_login_Data.objects.filter(USER_TYPE='SU').exists():
                        return JsonResponse({'error': 'Superuser Does Not Exist. Please Create A Superuser First.'}, status=400)
            pass
        else:
            if not User_login_Data.objects.filter(USER_TYPE='SU').exists():
                return JsonResponse({'error': 'Superuser Does Not Exist. Please Create A Superuser First.'}, status=400)
            
            response = self.get_response(request)
            pass
        return response








class TrackLoginMiddleware(MiddlewareMixin):
    def process_request(self, request):
        threadlocal.auditlog = {
            'signal_duid': (self.__class__, time.time()),
            'remote_addr': request.META.get('REMOTE_ADDR'),
        }

        if request.META.get('HTTP_X_FORWARDED_FOR'):
            threadlocal.auditlog['remote_addr'] = request.META.get('HTTP_X_FORWARDED_FOR').split(',')[0]

    def process_response(self, request, response):
        if hasattr(threadlocal, 'auditlog'):
            response_data = getattr(response, 'data', None)
            if response_data:
                print("xxxxxxxxxxxxxxxxxxxx", response_data)
                access_token = response_data.get('access_token')
                if access_token:
                    try:
                        decoded_token = AccessToken(access_token)
                        user_id = decoded_token.get('user_id')
                        print("ffffffffffffff", user_id)
                        pass
    #                     if user_id:
    #                         # Perform additional operations with the user_id
    #                         login_time = timezone.now()
    #                         user = User_login_Data.objects.get(id=user_id)
    #                         user_session = UserSession.objects.create(user=user, login_time=login_time)
    #                         request.session['login_time'] = login_time.strftime('%Y-%m-%d %H:%M:%S')
    #                         request.session['user_session_id'] = user_session.id
    #                         request.session.cycle_key()  # Ensure a new session ID is created
                    except Exception as e:
                        # Handle exceptions (e.g., invalid token)
                        print(f"Error decoding access token: {e}")
                else:
                    pass
    #         pre_save.disconnect(sender=LogEntry, dispatch_uid=threadlocal.auditlog['signal_duid'])

    #     return response

    def process_exception(self, request, exception):
        if hasattr(threadlocal, 'auditlog'):
            pre_save.disconnect(sender=LogEntry, dispatch_uid=threadlocal.auditlog['signal_duid'])
        return None




class RequestResponseLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
 
    def __call__(self, request):
        # Capture request details before it's processed
        content_length = request.META.get('CONTENT_LENGTH', 0)
        if content_length and int(content_length) > 10485760:  # Skip if > 10 MB
            request_body = b'[Content too large to log]'
        else:
            request_body = request.body if request.method in ['POST', 'PUT', 'PATCH'] else None
            request_body = request_body.decode('utf-8', errors='replace')
        request_data = {
            'timestamp': timezone.now(),
            'method': request.method,
            'path': request.path,
            'request_headers': dict(request.headers),  
            'request_body': request_body
        }
 
        response = self.get_response(request)
 
        response_body = response.content
        if response_body is not None:
            response_body = response_body.decode('utf-8', errors='replace')
 
        # Capture response details
        response_data = {
            'response_status_code': response.status_code,
            'response_headers': dict(response.headers),
            'response_body': response_body  # You can customize how to get the response body
        }
 
        request_data.update(response_data)  # Combine request and response data
        serializer = HTTPRequestResponseSerializer(data=request_data)
        if serializer.is_valid():
            serializer.save()
        else:
            print("Validation errors:", serializer.errors)
            print("Request Data Type:", type(request_data))  # Check type of request_data
            print("Request Headers Type:", type(request_data.get('request_headers')))  # Check headers type
 
 
        return response


# class RequestResponseLoggingMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response
 
#     def __call__(self, request):
#         # Capture request details before it's processed
#         request_body = None
#         # request_body = request.body if request.method in ['POST', 'PUT', 'PATCH'] else None
#         if request.method in ['POST', 'PUT', 'PATCH']:
#             request_body = request.body
#             if request_body:
#                 request_body = request_body.decode('utf-8', errors='replace')
#         # request_body = request_body.decode('utf-8', errors='replace')
#         request_data = {
#             'timestamp': timezone.now(),
#             'method': request.method,
#             'path': request.path,
#             'request_headers': dict(request.headers),  
#             'request_body': request_body
#         }
 
#         response = self.get_response(request)
 
#         response_body = response.content
#         if response_body is not None:
#             response_body = response_body.decode('utf-8', errors='replace')
 
#         # Capture response details
#         response_data = {
#             'response_status_code': response.status_code,
#             'response_headers': dict(response.headers),
#             'response_body': response_body  # You can customize how to get the response body
#         }
 
#         request_data.update(response_data)  # Combine request and response data
#         serializer = HTTPRequestResponseSerializer(data=request_data)
#         if serializer.is_valid():
#             serializer.save()
#         else:
#             print("Validation errors:", serializer.errors)
#             print("Request Data Type:", type(request_data))  # Check type of request_data
#             print("Request Headers Type:", type(request_data.get('request_headers')))  # Check headers type
 
 
#         return response


# my_project/middleware/admin_check_middleware.py

# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
import json
class AdminCheckMiddleware(MiddlewareMixin):
    # print()
    def process_request(self, request):
        jwt_authenticator = JWTAuthentication()
        try:
            user, token = jwt_authenticator.authenticate(request)
            request.user = user
        except Exception as e:
            if not request.path == '/login_user/':
                if request.method in  ['GET', 'POST', 'PATCH', 'PUT'] and request.content_type == 'application/json':
                    try:
                        data = json.loads(request.body)
                        USERNAME_name = data.get("USERNAME", None)
                        USERID_id = data.get("USERID", None)
                        if USERNAME_name:
                            user_check = User_login_Data.objects.get(USERNAME= USERNAME_name)
                        elif USERID_id:
                            user_check = User_login_Data.objects.get(USERNAME= USERID_id)
                        else:
                            user_check = None
                        if user_check:
                            if user_check.USER_TYPE == "AU":
                                if user_check.SU_APRO_STAT == "BLOCKED":
                                    return JsonResponse({'errors': "You Are Block"}, status=400)
                                elif user_check.SU_APRO_STAT == "DELETE" or user_check.SU_APRO_STAT == "REPLACE":
                                    return JsonResponse({'errors': "You Are Delete by SU"}, status=400)
                                else:
                                    pass
                            elif user_check.USER_TYPE == "UU":
                                if user_check.SU_APRO_STAT == "BLOCKED" or user_check.AU_APRO_STAT == "BLOCKED":
                                    return JsonResponse({'errors': "You Are Block"}, status=400)
                                elif user_check.SU_APRO_STAT == "DELETE" or user_check.AU_APRO_STAT == "DELETE":
                                    return JsonResponse({'errors': "You Are Delete"}, status=400)
                                else:
                                    pass
                            elif user_check.USER_TYPE == "GU":
                                if user_check.SU_APRO_STAT == "DELETE" or user_check.SU_APRO_STAT == "BLOCKED":
                                    return JsonResponse({'errors': "You Are Delete"}, status=400)
                        else:
                            pass
                    except Exception as e:
                        pass
            return None
        if not request.user.is_authenticated:
            return None
        
        user = request.user
        if not (request.method =="GET" and request.path == '/admin-blocked/'):
            if user.USER_TYPE == 'UU':
                if not(user.SU_APRO_STAT =="APPROVED" and user.AU_APRO_STAT=="APPROVED"):
                    return JsonResponse({"errors":"You are block"}, status=400)
                try:
                    admin_user = User_login_Data.objects.filter(USER_TYPE="AU", THEME_OPT=user.THEME_OPT.USERID_THEME_OPT, ADMIN_TYPE=user.ADMIN_TYPE, SU_APRO_STAT="APPROVED", AU_APRO_STAT="INPROGRESS")
                except Exception as e:
                    return JsonResponse({'errors': str(e)}, status=400)
                if not admin_user:
                    return JsonResponse({'errors': "Your Admin is block"}, status=400)
                    # if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                    #     return JsonResponse({'error': 'Admin is blocked. You cannot make changes.'}, status=403)
                    # else:
                    #     request.admin_blocked = True  # Set a flag to use in views or templates
            elif user.USER_TYPE == "AU" and not(user.SU_APRO_STAT=="APPROVED"):
                return JsonResponse({"errors":"You are block"}, status=400)
        else:
            pass
        return None

    def process_response(self, request, response):
        if isinstance(response, Response):
            if isinstance(response.data, dict):
                refresh_token_str = response.data.get("refresh_token", None)
            else:
                refresh_token_str = None
            if refresh_token_str:
                refresh_token = RefreshToken(refresh_token_str)
                type_user = refresh_token.get("USER_TYPE", None)
                if type_user == "UU":
                    try:
                        user = User_login_Data.objects.get(USERID=refresh_token.get("user_id"))
                        # print("user")
                        admin_user = User_login_Data.objects.filter(USER_TYPE="AU", THEME_OPT=user.THEME_OPT.USERID_THEME_OPT, ADMIN_TYPE=user.ADMIN_TYPE, SU_APRO_STAT="APPROVED", AU_APRO_STAT="INPROGRESS")
                    except Exception as e:
                        return JsonResponse({'errors': str(e)}, status=400)

                    if not admin_user: #.USER_APRO_STAT == 'BLOCKED':
                        return JsonResponse({'errors': "Your Admin is block"}, status=400)
                # print("refresh_token", refresh_token["user_id"])
                # print("refresh_token", refresh_token["USER_TYPE"])
                else:
                    pass
            else:
                if isinstance(response.data, dict):
                    access_token = response.data.get("access", None)
                    if access_token:
                        token = AccessToken(access_token)
                        id_user = token.payload.get("user_id", None)
                        if id_user:
                            try:
                                user = User_login_Data.objects.get(USERID=id_user)
                                if user.USER_TYPE == "UU":
                                    if not(user.SU_APRO_STAT =="APPROVED" and user.AU_APRO_STAT=="APPROVED"):
                                        return JsonResponse({"errors":"You are block"}, status=400)
                                    else:
                                        admin_user = User_login_Data.objects.filter(USER_TYPE="AU", THEME_OPT=user.THEME_OPT.USERID_THEME_OPT, ADMIN_TYPE=user.ADMIN_TYPE, SU_APRO_STAT="APPROVED", AU_APRO_STAT="INPROGRESS")
                                        if not admin_user.exists(): #.USER_APRO_STAT == 'BLOCKED':
                                            return JsonResponse({'errors': "Your Admin is block"}, status=400)
                                            # return HttpResponseRedirect('/admin-blocked/') 
                                    
                                elif user.USER_TYPE == "AU" and not(user.SU_APRO_STAT=="APPROVED"):
                                    return JsonResponse({"errors":"You are block"}, status=400)
                                else:
                                    admin_user = None
                            except Exception as e:
                                return JsonResponse({'errors': str(e)}, status=400)
                    else:
                        pass
            
            # Add the flag to the response if the admin is blocked
            if getattr(request, 'admin_blocked', False):
                response['Admin-Blocked'] = 'True'
        return response
    
