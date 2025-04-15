from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter


urlpatterns = [

    # Work Center User Admin
    path('wcprojectinformationinput/',WCProjectInformationInput.as_view()),    #1 
    # path('wcprojectsinputs/',WC_Projects_Inputs),     #2 
    path('wcgetnextprojectid/', WCGetNextProjectID.as_view()),     #2   # NEXT Project ID
    path('wcprojectmanagement/',WC_ProjectManagements.as_view()),     #3 
    path('wcallprojectdata/',WCAllProjectData.as_view()),  #4  
    path('wcgetprojectids/',WCGetNextProjectID.as_view()),    #5 

    # User Department Center User Admin

    path('udprojectinformationinput/',UDProjectInformationInput.as_view()),    #1 
    # path('wcprojectsinputs/',WC_Projects_Inputs),     #2 
    path('udgetnextprojectid/',UDGetNextProjectID.as_view()),     #2   # NEXT Project ID
    path('udprojectmanagement/',UD_ProjectManagements.as_view()),     #3 
    path('udallprojectdata/',UDAllProjectData.as_view()),  #4  
    path('udgetprojectids/',UDGetNextProjectID.as_view()),    #5 # ALL ID's
    
]





