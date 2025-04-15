import logging
import sys


from django.shortcuts import render,redirect, HttpResponse
from django.http import HttpResponse
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpRequest
from django.contrib import messages
from django.core.mail import send_mail
import uuid
from django.forms.models import model_to_dict  #imp for module to dict
from rest_framework import status
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
import random
import string
from auditlog.context import set_actor



logger = logging.getLogger(__name__) #authentification.logging
# console_handler = logging.StreamHandler(stream = sys.stdout)

# file_handler = logging.FileHandler(filename="D:\logs_django\logs.txt")

# logger.addHandler(console_handler)
# logger.addHandler(file_handler)

# def division(numerator, denominator):
#     try:
#         return numerator/ denominator
#     except ZeroDivisionError:
#         logger.error(f"Division by zero error with parameter: {numerator} / {denominator}")

# if __name__ =="__main__":
#     division(4, 0)



@api_view(['GET','POST', 'PUT','PATCH','DELETE'])
def register_general_test(request): #active
    if request.method =="GET":
        logger.info("Testing the logger!")
        logger.warning("Testing the logger!  warning")
        try:
            # if request.user.USER_TYPE == "SU" and 
            if request.user.USER_TYPE == "SU" or request.user.USER_TYPE == "AU":
                user_login_detail_data = User_login_Data.objects.all().filter(USER_TYPE="GU").exclude(SU_APRO_STAT="DELETE")
                serializer_b = User_login_Data_serialiser112(user_login_detail_data, many=True).data
                data_ser = {
            "serializer_b1": serializer_b
              }
        
                return Response({"message": data_ser}, status=status.HTTP_200_OK)
            
            user = User_login_Data.objects.get(USERNAME=request.user.USERNAME) #for single User
            
        except Exception as e:
            logger.error("user with id %s does not exist", 1)
            return  Response({'message': 'userNot Present'})
        serializer_b = User_login_Data_serialiser112(user).data #UserLoginGeneral
        return Response({'message': serializer_b}, status=status.HTTP_200_OK)
    
    elif request.method =='POST':
         resister_info = request.data
         keys_to_remove = ["SU_APRO_STAT", "AU_APRO_STAT", "APRO_DATE", "SU_APRO_REM", "AU_APRO_REM", "THEME_OPT"]
         auth_register_info_1 = {key: value for key, value in resister_info.items() if key not in keys_to_remove}
         print(resister_info)
         if auth_register_info_1.get("USER_TYPE") =="GU" or auth_register_info_1.get("USER_TYPE") == None:
            serializer = User_login_Data_serialiser112(data=auth_register_info_1)
         else:
             return Response({"Message":"You Are Not Authorized"})
         print(serializer)
         if serializer.is_valid():
            serializer.validated_data['SU_APRO_STAT'] = "APPROVED"
            serializer.save()
            GU_resister_mail(serializer.validated_data["EMAIL"], serializer.validated_data["USERNAME"])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method =="PATCH":  #patcxh===================================================
        # if not request.user.USER_TYPE == "SU":
        #         return Response({'message': 'Not Authorized SUPERUSER'}, status=status.HTTP_403_FORBIDDEN)
        auth_register_info = request.data
        # keys_to_remove = ["SU_APRO_STAT", "AU_APRO_STAT", "APRO_DATE", "SU_APRO_REM", "AU_APRO_REM", "THEME_OPT"]
        # auth_register_info_1 = {key: value for key, value in auth_register_info.items() if key not in keys_to_remove}
        try:
            if request.user.USER_TYPE == "SU":
                user = User_login_Data.objects.get(USERID=auth_register_info.get("USERID"))
                if user.USER_TYPE == "GU":
                    auth_register_info_1 = auth_register_info
            elif request.user.USER_TYPE == "GU":
                keys_to_remove = ["SU_APRO_STAT", "AU_APRO_STAT", "APRO_DATE", "SU_APRO_REM", "AU_APRO_REM", "THEME_OPT"]
                auth_register_info_1 = {key: value for key, value in auth_register_info.items() if key not in keys_to_remove}
                user = User_login_Data.objects.get(USERID= request.user.USERID) #Need change here
            # user_detail, created = Users_login_Details_Data.objects.get_or_create(USERID_id=user.USERID)
            # obj = Users_login_Details_Data.objects.get(USERID_id=user.USERID)
            else:
                return Response({'message': 'Not Authorized SUPERUSER or GU'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"Massege":"User Not Allowed xxx"})
        
        if user.USER_TYPE == "GU":
            serializer_a = User_login_Data_serialiser112(user, data= auth_register_info_1, partial=True)
        elif user.USER_TYPE == "SU" and request.user.USER_TYPE == "SU":
            serializer_a = User_login_Data_serialiser112(user, data= auth_register_info, partial=True)
        else:
            return Response({"Massege":"Something Went Wrong"})
        if serializer_a.is_valid():
            requred_field = ["USERNAME", "EMAIL", "MOBILE_NO"]
            new_field = {key: value for key, value in serializer_a.validated_data.items() if key  in requred_field}
            xc = model_to_dict(user)
            result_dict =  {key: value for key,value in xc.items() if key in requred_field}
            result_dict_1 = {key: result_dict[key] for key in result_dict if key in new_field and result_dict[key] != new_field[key]}
            if not result_dict_1:
                print("empty dict")
                pass
            else:
                print("Change in profile")
                mail_change_in_profile_AU_SU(user.EMAIL, user.USERNAME, result_dict_1)
            serializer_a.save()
            response_data = {
                        'serializer_a_data': serializer_a.data,
                    }
            return Response({"data":response_data})
        else:
            return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)
    # else:
    #     return Response({'message': 'Not GU USER'}, status=status.HTTP_403_FORBIDDEN)

    elif request.method =="DELETE":   #status=status.HTTP_204_NO_CONTENT
        if not request.user.USER_TYPE == "SU":
            return Response({'message': 'Not Authorized SUPERUSER'}, status=status.HTTP_403_FORBIDDEN)

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
        














# [{'Dimap_Document/Dataset_Identification/DATASET_NAME': 'PRJ_SPOT7_20220327_045722600_000', 'Dimap_Document/Dataset_Content/SURFACE_AREA': '76.1885', 'Dimap_Document/Dataset_Content/CLOUD_COVERAGE': '0.00', 'Dimap_Document/Dataset_Content/SNOW_COVERAGE': '0.00', 'Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME': 'AIRBUS DS', 'Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO': 'SPOT', 'Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE': 'C501696', 'Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE': 'urn:ogc:def:crs:EPSG::32644', 'Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL': 'PROJECTED', 'Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING': 'PMS', 'Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING': '1.5', 'Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT': 'image/tiff', 'Dimap_Document/Raster_Data/Raster_Dimensions/NROWS': '7443', 'Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS': '4613', 'Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS': '4', 'Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES': '1', 'Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE': 'INTEGER', 'Dimap_Document/Raster_Data/Raster_Encoding/NBITS': '16', 'Dimap_Document/Raster_Data/Raster_Encoding/SIGN': 'UNSIGNED', 'Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE': '12', 'Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE': '16', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION': 'SPOT', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX': '7', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE': '2022-03-27', '/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href': 'PREVIEW_SPOT7_PMS_202203270457172_PRJ_6610241101.JPG', '/Dimap_Document/Dataset_Content/SURFACE_AREA__unit': 'square km', '/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit': 'percent', '/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit': 'percent', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def': {'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_0': '80.223824495', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_0': '25.9677606571', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_31_1': '80.2929262403', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_32_1': '25.9681147005', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_39_2': '80.2935272056', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_40_2': '25.8673209209', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_47_3': '80.2244841784', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_48_3': '25.8669684518'}, 
#   'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def': {'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_0': 'B2', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_0': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_0': '633', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_0': '697', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_82_1': 'B1', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_85_1': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_87_1': '534', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_88_1': '596', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_90_2': 'B0', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_93_2': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_95_2': '457', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_96_2': '525', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_98_3': 'B3', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_101_3': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_103_3': '770', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_104_3': '874'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK': '2.11785874605', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_216': '2.1170521431', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_236': '2.11624604978', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_256': '2.11820541401', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_276': '2.11760236082', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_296': '2.11699955692', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_316': '2.11855674826', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_336': '2.11815715965', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_356': '2.11775756'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_dict': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK': '2.28041031574', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_217': '2.28083338257', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_237': '2.28125549341', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_257': '2.2752546651', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_277': '2.27546540286', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_297': '2.27567545801', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_317': '2.27009669687', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_337': '2.27009519393', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_357': '2.27009328175'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE': '11.1572427918', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_211': '11.1046563285', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_231': '11.0521167445', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_251': '11.1842959651', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_271': '11.1346237541', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_291': '11.0849945869', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_311': '11.2114047715', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_331': '11.1646455728', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_351': '11.1179255955'}}, {'Dimap_Document/Dataset_Identification/DATASET_NAME': 'PRJ_SPOT7_20220327_045759400_000', 'Dimap_Document/Dataset_Content/SURFACE_AREA': '76.1885', 'Dimap_Document/Dataset_Content/CLOUD_COVERAGE': '0.00', 'Dimap_Document/Dataset_Content/SNOW_COVERAGE': '0.00', 'Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME': 'AIRBUS DS', 'Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO': 'SPOT', 'Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE': 'C501696', 'Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE': 'urn:ogc:def:crs:EPSG::32644', 'Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL': 'PROJECTED', 'Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING': 'PMS', 'Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING': '1.5', 'Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT': 'image/tiff', 'Dimap_Document/Raster_Data/Raster_Dimensions/NROWS': '7443', 'Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS': '4613', 'Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS': '4', 'Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES': '1', 'Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE': 'INTEGER', 'Dimap_Document/Raster_Data/Raster_Encoding/NBITS': '16', 'Dimap_Document/Raster_Data/Raster_Encoding/SIGN': 'UNSIGNED', 'Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE': '12', 'Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE': '16', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION': 'SPOT', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX': '7', 'Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE': '2022-03-27', '/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href': 'PREVIEW_SPOT7_PMS_202203270457540_PRJ_6610241101.JPG', '/Dimap_Document/Dataset_Content/SURFACE_AREA__unit': 'square km', '/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit': 'percent', '/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit': 'percent', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def': {'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_0': '80.223824495', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_0': '25.9677606571', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_31_1': '80.2929262403', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_32_1': '25.9681147005', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_39_2': '80.2935272056', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_40_2': '25.8673209209', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_47_3': '80.2244841784', 'Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_48_3': '25.8669684518'}, 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def': {'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_0': 'B2', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_0': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_0': '633', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_0': '697', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_82_1': 'B1', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_85_1': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_87_1': '534', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_88_1': '596', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_90_2': 'B0', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_93_2': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_95_2': '457', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_96_2': '525', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_98_3': 'B3', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT_101_3': 'nanometers', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN_103_3': '770', 'Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX_104_3': '874'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK': '2.13032760432', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_216': '2.13132530775', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_236': 
# '2.13232151338', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_256': '2.12869823593', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_276': '2.12958529667', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_296': '2.13047090543', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_316': '2.12706733541', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_336': '2.12784383242', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_356': '2.12861892322'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_dict': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK': '2.28053964747', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_217': '2.28012114542', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_237': '2.27969966231', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_257': '2.27435910813', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_277': '2.27325446385', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_297': '2.27214711998', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_317': '2.26816709319', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_337': '2.2663767894', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK_357': '2.26458406717'}, 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def': {'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE': '12.2359874935', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_211': '12.3156578532', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_231': '12.3952707019', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_251': '12.2575398979', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_271': '12.3400660312', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_291': '12.4225332269', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_311': '12.2791411003', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_331': '12.3645210378', 'Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_351': '12.4498405925'}}]