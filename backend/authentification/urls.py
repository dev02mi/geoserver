from django.urls import path, re_path
from .views import *
from .views2 import *
from .logging import *
# from audrela_operation.views import File_upload
from .audrela_operation.views import File_upload, SetCookieAPIView, upload_shapefile_to_geoserver, Ordering_API, Colur_ordsh, Polygone_selection, Polygone_correction
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', fty),
    path('forget_password/', forget_password),#active
    path('update_fo_password/', update_password),#active
    path('xyz/', xyx), #views2   
    path('change_password/', change_password), #views2
    # path('update_ch_password/<int:id>/', ch_updte_password), ##views2
    path('contact_us/', contact_us),#active
    #general signup apihttp://127.0.0.1:8000/login_user/
    path('general_signup/',register_general),#active 
    #login api
    path('login_user/', login_user),#active
    #authorized api
    path('authorized_singup/', user_authorized_function),#active
    #admin api
    path('admin_url/', admin_function),#active
    # re_path(r'^admin_url/(?P<token>[^/]+)/$', admin_function),
    path('permission_function_url/', permission_function), #active
    path('superuser_api/', superuser_api), #patch method
    path('themes_value/', Themes_Value.as_view()),
    re_path(r'^superuser/(?P<token>[^/]+)/$', superuser_api_2.as_view()),
    path('superuser/', superuser_api_2.as_view()), 
    # path('general_signup_test/', register_general_test),#logg testing from logging
    # path('real_time_validation/', real_time_validation, name='real_time_validation'),
    path('logout/', LogoutView.as_view(), name= 'logout'),
    path('admin-blocked/', admin_blocked_view, name='admin_blocked_view'),
    path('Department_Value/', Department_Value.as_view()),
    path('Check_Admintype/', Check_Admintype.as_view()),
    # path('GIS_polyGone/', GIS_polyGone.as_view(), name='gis_polygone'),
    path('extract_gis_data/', GISDataExtractor.as_view(), name='extract_gis_data/'),
    path('file_upload_asc/', File_upload.as_view(), name='extract_gis_data/'),
    path('api/set-cookie/', SetCookieAPIView.as_view(), name='set-cookie'),
    path('api/task/<str:task_id>/', get_task_result, name='get_task_result'),
    path('shape_file_geoserver/', upload_shapefile_to_geoserver),
    path('api/task_sec/<str:task_id>/', get_task_result_sec, name='get_task_result_sec'),
    # path('get_sld_url/', save_and_upload_sld, name='get_sld'),
    path("api/sse/", SSEView.as_view(), name="sse_api"),
    path('Ordering_shp/<str:task_id>/', Ordering_API.as_view(), name='Ordering_shp'),
    path('Colur_ordsh/<str:task_id>/', Colur_ordsh.as_view(), name='Colur_ordsh'),
    path('Polygone_selection/', Polygone_selection.as_view(), name='Polygone_selection'),
    path('Polygone_correction/', Polygone_correction.as_view(), name='Polygone_correction'),
    
]