from django.urls import path
from .views import *


urlpatterns = [
    path('rimanshu/', home),
    path('stacking/',LayerStacking),
    path('stack_bands/',stack_bands),
]
