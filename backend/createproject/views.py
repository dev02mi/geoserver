from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response 
from rest_framework import status
from .serializers import *
from .models import *
from django.db.models import Max
# from .models import ProjectInformation
from django.http import HttpRequest
from django.core.exceptions import ObjectDoesNotExist  # Add this line
from django.db import IntegrityError
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from rest_framework import generics

# Create your views here



# *** (1) WC NEXT PROJECT ID **** #

# @api_view(['GET'])
# def WC_get_next_project_id(request):
#     max_id = WCProjectInformationAndInputs.objects.aggregate(max_id=Max('PROJECT_ID'))['max_id']
#     if max_id:
#         next_id = int(max_id.replace('AGRI', '')) + 1
#     else:
#         next_id = 1
#     next_project_id = f"AGRI{next_id:04d}"
#     return Response({'next_project_id': next_project_id})


class WCGetNextProjectID(APIView):
    def get(self, request):
        max_id = WCProjectInformationAndInputs.objects.aggregate(max_id=Max('PROJECT_ID'))['max_id']
        if max_id:
            next_id = int(max_id.replace('AGRI', '')) + 1
        else:
            next_id = 1
        next_project_id = f"AGRI{next_id:04d}"
        return Response({'next_project_id': next_project_id})

# **** (2) Project Information **** #

class WCProjectInformationInput(generics.ListCreateAPIView):
    queryset = WCProjectInformationAndInputs.objects.all()
    serializer_class = WCProjectInformationAndInputsSerializer


# **** (3) WCProject Management **** #

class WC_ProjectManagements(APIView):
    def post(self, request):
        project_id = request.data.get('PROJECT_ID')

        if not project_id:
            return Response({"PROJECT_ID": ["This Field Is Required."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project_info = WCProjectInformationAndInputs.objects.get(PROJECT_ID=project_id)
        except WCProjectInformationAndInputs.DoesNotExist:
            return Response({"error": "Invalid PROJECT_ID. ProjectInformation instance does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        work_assign_users = request.data.get('WORK_ASSIGN_USER', [])
        stackings = request.data.get('STACKING', [])
        unsupervised_classifications = request.data.get('UNSUPERVISED_CLASSIFICATION', [])
        supervised_classifications = request.data.get('SUPERVISED_CLASSIFICATION', [])
        recode_clump_eliminates = request.data.get('RECODE_CLUMP_ELIMINATE', [])
        analyses = request.data.get('ANALYSIS', [])
        statistics_list = request.data.get('STATISTICS', [])

        max_length = max(len(work_assign_users), len(stackings), len(unsupervised_classifications),
                         len(supervised_classifications), len(recode_clump_eliminates),
                         len(analyses), len(statistics_list))

        def pad_list(lst):
            return lst + [None] * (max_length - len(lst))

        work_assign_users = pad_list(work_assign_users)
        stackings = pad_list(stackings)
        unsupervised_classifications = pad_list(unsupervised_classifications)
        supervised_classifications = pad_list(supervised_classifications)
        recode_clump_eliminates = pad_list(recode_clump_eliminates)
        analyses = pad_list(analyses)
        statistics_list = pad_list(statistics_list)

        created_instances = []
        for i in range(max_length):
            data = {
                'PROJECT_ID': project_info.PROJECT_ID,
                'ADMIN_USER': request.data.get('ADMIN_USER'),
                'WORK_ASSIGN_USER': work_assign_users[i],
                'STACKING': stackings[i],
                'UNSUPERVISED_CLASSIFICATION': unsupervised_classifications[i],
                'SUPERVISED_CLASSIFICATION': supervised_classifications[i],
                'RECODE_CLUMP_ELIMINATE': recode_clump_eliminates[i],
                'ANALYSIS': analyses[i],
                'STATISTICS': statistics_list[i]
            }

            if WCProjectManagement.objects.filter(
                PROJECT_ID=data['PROJECT_ID'],
                WORK_ASSIGN_USER=data['WORK_ASSIGN_USER'],
                STACKING=data['STACKING'],
                UNSUPERVISED_CLASSIFICATION=data['UNSUPERVISED_CLASSIFICATION'],
                SUPERVISED_CLASSIFICATION=data['SUPERVISED_CLASSIFICATION'],
                RECODE_CLUMP_ELIMINATE=data['RECODE_CLUMP_ELIMINATE'],
                ANALYSIS=data['ANALYSIS'],
                STATISTICS=data['STATISTICS']
            ).exists():
                continue

            serializer = WCProjectManagementSerializer(data=data)
            if serializer.is_valid():
                instance = serializer.save()
                created_instances.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(created_instances, status=status.HTTP_201_CREATED)



# (4) ALL Project Data Fetch GET API
class WCAllProjectData(APIView):
    def get(self, request):
        project_id = request.query_params.get('PROJECT_ID')
        if not project_id:
            return Response({"error": "PROJECT_ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wc_project_info = WCProjectInformationAndInputs.objects.get(PROJECT_ID=project_id)
            # wc_management = WCProjectManagement.objects.filter(PROJECT_ID=wc_project_info)
        except WCProjectInformationAndInputs.DoesNotExist:
            return Response({"error": "Invalid PROJECT_ID. ProjectInformation instance does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        

        wc_management = WCProjectManagement.objects.filter(PROJECT_ID=wc_project_info)
        

        project_info_serializer = WCProjectInformationAndInputsSerializer(wc_project_info)
        management_serializer = WCProjectManagementSerializer(wc_management, many=True)

        response_data = {
            "project_information": project_info_serializer.data,
            "project_management": management_serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)

# (5) GET ALL ID from Project Informatioms 

class WCGetNextProjectID(APIView):
    def get(self, request):
        # Query all instances of ProjectInformation
        projects = WCProjectInformationAndInputs.objects.all()

        # Extract PROJECT_ID from each instance
        project_ids = [project.PROJECT_ID for project in projects]

        return Response(project_ids, status=status.HTTP_200_OK)

# __________________________________ USER DEPARTMENT DATA _________________________________________________


# *** (1) NEXT UD PROJECT ID **** #

class UDGetNextProjectID(APIView):
    def get(self, request):
        max_id = UDProjectInformationAndInputs.objects.aggregate(max_id=Max('UDPROJECT_ID'))['max_id']
        if max_id:
            next_id = int(max_id.replace('AGRI', '')) + 1
        else:
            next_id = 1
        next_project_id = f"AGRI{next_id:04d}"
        return Response({'next_project_id': next_project_id})

# **** (2) UD Project Information **** #

class UDProjectInformationInput(generics.ListCreateAPIView):
    queryset = UDProjectInformationAndInputs.objects.all()
    serializer_class = UDProjectInformationAndInputsSerializer


# **** (3) User Department Project Management **** #
class UD_ProjectManagements(APIView):
    def post(self, request):
        project_id = request.data.get('UD_PROJECT_ID')

        if not project_id:
            return Response({"UD_PROJECT_ID": ["This Field Is Required."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project_info = UDProjectInformationAndInputs.objects.get(UDPROJECT_ID=project_id)
        except UDProjectInformationAndInputs.DoesNotExist:
            return Response({"error": "Invalid UDPROJECT_ID. ProjectInformation instance does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        udwork_assign_users = request.data.get('UD_WORK_ASSIGN_USER', [])
        udstackings = request.data.get('UD_STACKING', [])
        udunsupervised_classifications = request.data.get('UD_UNSUPERVISED_CLASSIFICATION', [])
        udsupervised_classifications = request.data.get('UD_SUPERVISED_CLASSIFICATION', [])
        udrecode_clump_eliminates = request.data.get('UD_RECODE_CLUMP_ELIMINATE', [])
        udanalyses = request.data.get('UD_ANALYSIS', [])
        udstatistics_list = request.data.get('UD_STATISTICS', [])

        max_length = max(len(udwork_assign_users), len(udstackings), len(udunsupervised_classifications),
                         len(udsupervised_classifications), len(udrecode_clump_eliminates),
                         len(udanalyses), len(udstatistics_list))

        def pad_list(lst):
            return lst + [None] * (max_length - len(lst))

        udwork_assign_users = pad_list(udwork_assign_users)
        udstackings = pad_list(udstackings)
        udunsupervised_classifications = pad_list(udunsupervised_classifications)
        udsupervised_classifications = pad_list(udsupervised_classifications)
        udrecode_clump_eliminates = pad_list(udrecode_clump_eliminates)
        udanalyses = pad_list(udanalyses)
        udstatistics_list = pad_list(udstatistics_list)

        created_instances = []
        for i in range(max_length):
            data = {
                'UD_PROJECT_ID': project_info.UDPROJECT_ID,
                'UD_ADMIN_USER': request.data.get('UD_ADMIN_USER'),
                'UD_WORK_ASSIGN_USER': udwork_assign_users[i],
                'UD_STACKING': udstackings[i],
                'UD_UNSUPERVISED_CLASSIFICATION': udunsupervised_classifications[i],
                'UD_SUPERVISED_CLASSIFICATION': udsupervised_classifications[i],
                'UD_RECODE_CLUMP_ELIMINATE': udrecode_clump_eliminates[i],
                'UD_ANALYSIS': udanalyses[i],
                'UD_STATISTICS': udstatistics_list[i]
            }

            if UDProjectManagement.objects.filter(
                UD_PROJECT_ID=data['UD_PROJECT_ID'],
                UD_WORK_ASSIGN_USER=data['UD_WORK_ASSIGN_USER'],
                UD_STACKING=data['UD_STACKING'],
                UD_UNSUPERVISED_CLASSIFICATION=data['UD_UNSUPERVISED_CLASSIFICATION'],
                UD_SUPERVISED_CLASSIFICATION=data['UD_SUPERVISED_CLASSIFICATION'],
                UD_RECODE_CLUMP_ELIMINATE=data['UD_RECODE_CLUMP_ELIMINATE'],
                UD_ANALYSIS=data['UD_ANALYSIS'],
                UD_STATISTICS=data['UD_STATISTICS']
            ).exists():
                continue

            serializer = UDProjectManagementSerializer(data=data)
            if serializer.is_valid():
                instance = serializer.save()
                created_instances.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(created_instances, status=status.HTTP_201_CREATED)

# (4) ALL Project Data Fetch GET API
class UDAllProjectData(APIView):
    def get(self, request):
        project_id = request.query_params.get('UDPROJECT_ID')
        if not project_id:
            return Response({"error": "UDPROJECT_ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ud_project_info = UDProjectInformationAndInputs.objects.get(UDPROJECT_ID=project_id)
            ud_management = UDProjectManagement.objects.filter(UD_PROJECT_ID=project_id)
        except UDProjectInformationAndInputs.DoesNotExist:
            return Response({"error": "Invalid UDPROJECT_ID. ProjectInformation instance does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        project_info_serializer = UDProjectInformationAndInputsSerializer(ud_project_info)
        management_serializer = UDProjectManagementSerializer(ud_management, many=True)

        response_data = {
            "ud_project_information": project_info_serializer.data,
            "ud_project_management": management_serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)

# (5) GET ALL ID from UD Project Informatioms 

class UDGetNextProjectID(APIView):
    def get(self, request):
        # Query all instances of ProjectInformation
        projects = UDProjectInformationAndInputs.objects.all()

        # Extract PROJECT_ID from each instance
        project_ids = [project.UDPROJECT_ID for project in projects]

        return Response(project_ids, status=status.HTTP_200_OK)

