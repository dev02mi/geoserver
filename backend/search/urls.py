from django.urls import path
from .views import *
from .transco import *

urlpatterns = [
    path('', home),
    # path('upload_gdb/', upload_gdb, name='upload_gdb'), # Transco 
    path('optical_mono_sterio_tri_data_search/', optical_mono_sterio_tri_data_search, name='optical_mono_sterio_tri_data_search'),#run 
    path('optical_mono_sterio_tri_data_search_from_main/', optical_mono_sterio_tri_data_search_from_main, name='optical_mono_sterio_tri_data_search_from_main'),
]

