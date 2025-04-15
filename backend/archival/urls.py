# from pygments.lexers import get_all_lexers
# from pygments.styles import get_all_styles
from django.urls import path
from .views import *
# from .views2 import *

urlpatterns = [
    path('', home),
    path('my_new_file_upload_view_tri_sterio/', my_new_file_upload_view_tri_sterio, name='my_new_file_upload_view_tri_sterio1'),
    path('optical_mono_sterio_tri_data_save/', optical_mono_sterio_tri_data_save, name='optical_mono_sterio_tri_data_save'),
    path('optical_test_run/', optical_mono_sterio_tri_data_save_test_run, name='optical_mono_sterio_tri_data_save_test_run'),
    
]