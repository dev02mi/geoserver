from django.shortcuts import render,redirect, HttpResponse
from collections import defaultdict
from rest_framework.response import Response
from django.conf import settings
from rest_framework import status
from django.contrib.gis.geos import Polygon, Point, LineString
import base64
from rest_framework.decorators import api_view
from archival.models import *
from archival.serializers import *
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.postgres.search import SearchVector, SearchQuery
from django.core.serializers import serialize
import os
import json
from shapely.geometry import Polygon  as pl ,Point  as pt, LineString as ls
from rest_framework.pagination import PageNumberPagination

class xml_file_Pagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 18



# Create your views here.
def home(request):
    return render(request, 'search/home.html')


@api_view(['POST','GET', 'DELETE'])
def optical_mono_sterio_tri_data_search(request):
    if request.method == 'POST':
        info = request.data
        filter_conditions = {}
        if info.get("COMP_NA"):
            filter_conditions["COMP_NA__icontains"]= info["COMP_NA"]
        q_obj = Q()
        if info.get("SEN_NAME"):
            for i in info["SEN_NAME"]:
                q_obj |= Q(SEN_NAME__contains= i)
        date1 = info.get("startDate", None)
        date2 = info.get("endDate", None)
        if date1 and date2:
            filter_conditions["IMG_DATE__range"] = [date1, date2]
        elif date1:
            filter_conditions["IMG_DATE__gte"] = info["startDate"]
        elif date2:
            filter_conditions["IMG_DATE__lte"] = info["endDate"]

        pixel_min = info.get("D_PIXELX_MIN", None)
        pixel_max = info.get("D_PIXELX_MAX", None)
        
        if pixel_min and pixel_max:
            filter_conditions["D_PIXELX__range"] = [float(pixel_min), float(pixel_max)]
        
        elif pixel_min:
            filter_conditions["D_PIXELX__gte"] = float(info["D_PIXELX_MIN"])
        elif pixel_max:
            filter_conditions["D_PIXELX__lte"] = float(info["D_PIXELX_MAX"])

        if info.get("DCLOUD"):
            filter_conditions["DCLOUD__lte"] = float(info["DCLOUD"])

        if info.get("DSNOW"):
            filter_conditions["DSNOW__lte"] = float(info["DSNOW"])

        if info.get("IMG_DATYPE"):
            if all(item == "" for item in info["IMG_DATYPE"]):
                pass
            else:
                filter_conditions["IMG_DATYPE__in"] = info["IMG_DATYPE"]

        ANGL_MIN = info.get("D_IN_ANGL_MIN", None)
        ANGL_MAX = info.get("D_IN_ANGL_MAX", None)

        if ANGL_MIN and ANGL_MAX:
            filter_conditions["D_IN_ANGL__range"] = [float(ANGL_MIN), float(ANGL_MAX)]
        elif ANGL_MIN:
            filter_conditions["D_IN_ANGL__lte"] = float(info["D_IN_ANGL_MIN"])
        elif ANGL_MAX:
            filter_conditions["D_IN_ANGL__gte"] = float(info["D_IN_ANGL_MAX"])
        if info.get("aoigeometry"):
            if info.get("aoigeometry").get("type") == "Polygon":
                poly_tup = [(i[0], i[1]) for i in info.get("aoigeometry", {}).get("coordinates")[0]]
                polyg = Polygon(poly_tup)
                if polyg.valid:
                    print("Succesfully send polygone")
                    filter_conditions["geometry_shape__intersects"] = polyg
                else:
                    return Response({'message': 'Not valid polygone'}, status=status.HTTP_400_BAD_REQUEST)
            elif info.get("aoigeometry").get("type") == "Point":
                pt = info.get("aoigeometry", {}).get("coordinates")
                point = Point(pt[0], pt[1])
                filter_conditions["geometry_shape__contains"] = point 
            
            elif info.get("aoigeometry").get("type") == "LineString":
                pt = info.get("aoigeometry", {}).get("coordinates")  
                line = [(i[0], i[1]) for i in pt]
                input_line = LineString(line)
                filter_conditions["geometry_shape__intersects"] = input_line 
            else:
                pass

        
        if info.get("SAT_NO"):
            if info.get("SAT_NO") == "MONO":
                filter_conditions["SAT_NO__in"] = ["MONO", "STEREO", "TRI-STEREO"]
            elif info.get("SAT_NO") == "STEREO":
                filter_conditions["SAT_NO__in"] = ["STEREO", "TRI-STEREO"]
            elif info.get("SAT_NO") == "STEREO":
                filter_conditions["SAT_NO__in"] = ["TRI-STEREO"]
            else:
                filter_conditions["SAT_NO__in"] = [info.get("SAT_NO")]
        else:
            pass
        try:
            if filter_conditions or q_obj:
                try:
                    obj = MarsMainTableData.objects.prefetch_related('marsbandinformation_set').filter(**filter_conditions).filter(q_obj).distinct()
                except Exception as e:
                    return Response({'message': 'Something went wrong in while filtering', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                obj_data = MarsMainTableDataSerializer(obj, many = True).data
                list_1 = []
                feature_obj = obj_data.get("features", None)
                obj_response_finall = []
                if feature_obj:
                    for dict_1 in feature_obj:
                        dict_2 = {}
                        property_dict = dict_1.get("properties", {})
                        if property_dict:
                            zip_code =  property_dict.get("zipinfo", "XYZ")
                            if zip_code in list_1:
                                list_1.append(zip_code)
                                unique_list = []
                                [unique_list.append(item) for item in list_1[:] if item not in unique_list]
                                code_id = str(unique_list.index(zip_code) + 1).zfill(6)
                                dict_2["id"] = "AB_" + code_id + "_" + str(list_1.count(zip_code))
                            else:
                                list_1.append(zip_code)
                                unique_list = []
                                [unique_list.append(item) for item in list_1 if item not in unique_list]
                                code_id = str(unique_list.index(zip_code) + 1).zfill(6)
                                dict_2["id"] = "AB_" + code_id + "_" + "1"
                            if "marsbandinformation_set" in property_dict.keys():
                                list_band = []
                                for i in property_dict["marsbandinformation_set"]:
                                    i.pop("DATACODE")
                                    list_band.append(dict(i))
                                dict_2["marsbandinformation_set"] = list_band
                            
                            else:
                                pass
                            dict_2["DATANAME"] = property_dict.get("DATANAME", None)
                            dict_2["COMP_NA"] = property_dict.get('COMP_NA', None)
                            dict_2["SATT_NA"] = property_dict.get('SATT_NA', None)
                            dict_2["CL_REF"] = property_dict.get('CL_REF', None)
                            dict_2["CL_ORDNA"] = property_dict.get('CL_ORDNA', None)
                            dict_2["CL_PROJNA"] = property_dict.get('CL_PROJNA', None)
                            dict_2["CL_PURPOSE"] = property_dict.get('CL_PURPOSE', None)
                            dict_2["CL_ADDRESS1"] = property_dict.get('CL_ADDRESS1', None)
                            dict_2["CL_ADDRESS2"] = property_dict.get('CL_ADDRESS2', None)
                            dict_2["SEN_NAME"] = property_dict.get('SEN_NAME', None)
                            dict_2["IMG_DATYPE"] = property_dict.get('IMG_DATYPE', None)
                            dict_2["IMG_DAPROC"] = property_dict.get('IMG_DAPROC', None)
                            dict_2["IMG_DATE"] = property_dict.get('IMG_DATE', None)
                            dict_2["IMG_DT_RNG"] = property_dict.get('IMG_DT_RNG', None)
                            dict_2["DLOCA_CY"] = property_dict.get('DLOCA_CY', None)
                            dict_2["DLOCA_ST"] = property_dict.get('DLOCA_ST', None)
                            dict_2["DLOCA_DT"] = property_dict.get('DLOCA_DT', None)
                            dict_2["DLOCA_LOCA"] = property_dict.get('DLOCA_LOCA', None)
                            dict_2["DAREA"] = property_dict.get('DAREA', None)
                            dict_2["DSIZE"] = property_dict.get('DSIZE', None)
                            dict_2["DFORMAT"] = property_dict.get('DFORMAT', None)
                            dict_2["DCLOUD"] = property_dict.get('DCLOUD', None)
                            dict_2["DSNOW"] = property_dict.get('DSNOW', None)
                            dict_2["DPRJ_TABLE"] = property_dict.get('DPRJ_TABLE', None)
                            dict_2["DPRJ_NAME"] = property_dict.get('DPRJ_NAME', None)
                            dict_2["D_NROWS"] = property_dict.get('D_NROWS', None)
                            dict_2["D_NCOLS"] = property_dict.get('D_NCOLS', None)
                            dict_2["D_NBANDS"] = property_dict.get('D_NBANDS', None)
                            dict_2["D_NTILES"] = property_dict.get('D_NTILES', None)
                            dict_2["D_TYPE"] = property_dict.get('D_TYPE', None)
                            dict_2["D_NBITS"] = property_dict.get('D_NBITS', None)
                            dict_2["D_SIGN"] = property_dict.get('D_SIGN', None)
                            dict_2["D_IN_ANGL"] = property_dict.get('D_IN_ANGL', None)
                            dict_2["D_GSD_AXT"] = property_dict.get('D_GSD_AXT', None)
                            dict_2["D_GSD_ALT"] = property_dict.get('D_GSD_ALT', None)
                            dict_2["D_PIXELX"] = property_dict.get('D_PIXELX', None)
                            dict_2["D_PIXELY"] = property_dict.get('D_PIXELY', None)
                            dict_2["AL_DA_PATH"] = property_dict.get('AL_DA_PATH', None)
                            dict_2["AL_SH_PATH"] = property_dict.get('AL_SH_PATH', None)
                            dict_2["AL_QL_PATH"] = property_dict.get('AL_QL_PATH', None)
                            dict_2["XML_FILE"] = property_dict.get('XML_FILE', None)
                            dict_2["SAT_NO"] = property_dict.get('SAT_NO', None)
                            img_preview = property_dict.get('IMG_PREVIEW', None)
                            if img_preview:
                                base_dir = os.path.normpath(settings.BASE_DIR).replace("\\", "/")
                                file_path = os.path.join(base_dir, img_preview[1:]) 
                                try:
                                    with open(file_path, 'rb') as f:
                                        image_content = f.read()
                                        img_base64 = base64.b64encode(image_content).decode('utf-8')
                                        dict_2["IMG_PREVIEW"] = img_base64
                                    # print("IMG_PREVIEW operation succesfull")
                                except FileNotFoundError:
                                    pass
                        else:
                            return Response({'message': 'No Data found with this filter', "data":info}, status=status.HTTP_400_BAD_REQUEST)
                        
                        dict_2["coordinates"] = dict_1.get("geometry",{}).get("coordinates",[])
                        obj_response_finall.append(dict_2)
                else:
                    return Response({'message': 'No Data found with this filter', "data":info}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'message': obj_response_finall}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No filter Apply'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': 'Something went wrong', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method =="DELETE":
        info_del = request.data
        try:
            obj = MarsMainTableData.objects.filter(DATACODE=info_del.get("DATACODE")).first()
        except:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({'detail': 'Data deleted successfully'}, status=status.HTTP_200_OK)

    else:
        return Response({'message': 'Invalid HTTP method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
from django.db.models import F, IntegerField
from django.db.models.functions import Cast

from django.db.models import IntegerField
from django.db.models.functions import Cast, RowNumber
from django.db.models import F, Window

@api_view(['POST','GET'])
def optical_mono_sterio_tri_data_search_from_main(request):
    if request.method == 'GET':
        try:
            queryset = MarsMainTableData.objects.prefetch_related('marsbandinformation_set').annotate(zipinfo_as_int=Cast('zipinfo', IntegerField()),datacode_as_int=Cast('DATACODE', IntegerField()),row_number=Window(expression=RowNumber(),partition_by=[F('zipinfo')],order_by=F('datacode_as_int').asc())).order_by('-zipinfo_as_int', 'row_number')
            distinct_groups = list(set(queryset.values_list('zipinfo_as_int', flat=True)))[::-1]
            paginator = xml_file_Pagination()
            paginated_queryset = paginator.paginate_queryset(distinct_groups, request)
            total_count = paginator.page.paginator.count
            pages, remainder = divmod(total_count, 5)
            if remainder:
                pages += 1
            all_group_rows = queryset.filter(zipinfo_as_int__in=paginated_queryset)
            obj_data = MarsMainTableDataSerializer(all_group_rows, many = True).data
            list_1 = []
            feature_obj = obj_data.get("features", None)
            obj_response_finall = []
            if feature_obj:
                for dict_1 in feature_obj:
                    dict_2 = {}
                    property_dict = dict_1.get("properties", {})
                    if property_dict:
                        zip_code =  property_dict.get("zipinfo", "XYZ")
                        if zip_code in list_1:
                            list_1.append(zip_code)
                            unique_list = []
                            [unique_list.append(item) for item in list_1[:] if item not in unique_list]
                            code_id = str(unique_list.index(zip_code) + 1).zfill(6)
                            dict_2["id"] = "AB_" + code_id + "_" + str(list_1.count(zip_code))
                        else:
                            list_1.append(zip_code)
                            unique_list = []
                            [unique_list.append(item) for item in list_1 if item not in unique_list]
                            code_id = str(unique_list.index(zip_code) + 1).zfill(6)
                            dict_2["id"] = "AB_" + code_id + "_" + "1"
                        if "marsbandinformation_set" in property_dict.keys():
                            list_band = []
                            for i in property_dict["marsbandinformation_set"]:
                                # i.pop("DATACODE")
                                list_band.append(dict(i))
                            dict_2["marsbandinformation_set"] = list_band
                            
                        else:
                            pass
                        dict_2["DATANAME"] = property_dict.get("DATANAME", None)
                        dict_2["COMP_NA"] = property_dict.get('COMP_NA', None)
                        dict_2["SATT_NA"] = property_dict.get('SATT_NA', None)
                        dict_2["CL_REF"] = property_dict.get('CL_REF', None)
                        dict_2["CL_ORDNA"] = property_dict.get('CL_ORDNA', None)
                        dict_2["CL_PROJNA"] = property_dict.get('CL_PROJNA', None)
                        dict_2["CL_PURPOSE"] = property_dict.get('CL_PURPOSE', None)
                        dict_2["CL_ADDRESS1"] = property_dict.get('CL_ADDRESS1', None)
                        dict_2["CL_ADDRESS2"] = property_dict.get('CL_ADDRESS2', None)
                        dict_2["SEN_NAME"] = property_dict.get('SEN_NAME', None)
                        dict_2["IMG_DATYPE"] = property_dict.get('IMG_DATYPE', None)
                        dict_2["IMG_DAPROC"] = property_dict.get('IMG_DAPROC', None)
                        dict_2["IMG_DATE"] = property_dict.get('IMG_DATE', None)
                        dict_2["IMG_DT_RNG"] = property_dict.get('IMG_DT_RNG', None)
                        dict_2["DLOCA_CY"] = property_dict.get('DLOCA_CY', None)
                        dict_2["DLOCA_ST"] = property_dict.get('DLOCA_ST', None)
                        dict_2["DLOCA_DT"] = property_dict.get('DLOCA_DT', None)
                        dict_2["DLOCA_LOCA"] = property_dict.get('DLOCA_LOCA', None)
                        dict_2["DAREA"] = property_dict.get('DAREA', None)
                        dict_2["DSIZE"] = property_dict.get('DSIZE', None)
                        dict_2["DFORMAT"] = property_dict.get('DFORMAT', None)
                        dict_2["DCLOUD"] = property_dict.get('DCLOUD', None)
                        dict_2["DSNOW"] = property_dict.get('DSNOW', None)
                        dict_2["DPRJ_TABLE"] = property_dict.get('DPRJ_TABLE', None)
                        dict_2["DPRJ_NAME"] = property_dict.get('DPRJ_NAME', None)
                        dict_2["D_NROWS"] = property_dict.get('D_NROWS', None)
                        dict_2["D_NCOLS"] = property_dict.get('D_NCOLS', None)
                        dict_2["D_NBANDS"] = property_dict.get('D_NBANDS', None)
                        dict_2["D_NTILES"] = property_dict.get('D_NTILES', None)
                        dict_2["D_TYPE"] = property_dict.get('D_TYPE', None)
                        dict_2["D_NBITS"] = property_dict.get('D_NBITS', None)
                        dict_2["D_SIGN"] = property_dict.get('D_SIGN', None)
                        dict_2["D_IN_ANGL"] = property_dict.get('D_IN_ANGL', None)
                        dict_2["D_GSD_AXT"] = property_dict.get('D_GSD_AXT', None)
                        dict_2["D_GSD_ALT"] = property_dict.get('D_GSD_ALT', None)
                        dict_2["D_PIXELX"] = property_dict.get('D_PIXELX', None)
                        dict_2["D_PIXELY"] = property_dict.get('D_PIXELY', None)
                        dict_2["AL_DA_PATH"] = property_dict.get('AL_DA_PATH', None)
                        dict_2["AL_SH_PATH"] = property_dict.get('AL_SH_PATH', None)
                        dict_2["AL_QL_PATH"] = property_dict.get('AL_QL_PATH', None)
                        dict_2["DQLNAME"]=property_dict.get('DQLNAME', None)
                        dict_2["D_PR_BITS"]=property_dict.get('D_PR_BITS', None)
                        dict_2["D_AQ_BITS"]=property_dict.get('D_AQ_BITS', None)
                        dict_2["XML_FILE"] = property_dict.get('XML_FILE', None)
                        dict_2["SAT_NO"] = property_dict.get('SAT_NO', None)
                        img_preview = property_dict.get('IMG_PREVIEW', None)
                        if img_preview:
                            base_dir = os.path.normpath(settings.BASE_DIR).replace("\\", "/")
                            file_path = os.path.join(base_dir, img_preview[1:]) 
                            try:
                                with open(file_path, 'rb') as f:
                                    image_content = f.read()
                                    img_base64 = base64.b64encode(image_content).decode('utf-8')
                                    dict_2["IMG_PREVIEW"] = img_base64
                            except FileNotFoundError:
                                pass
                    else:
                        return Response({'message': 'No Data found with this filter', "data":pages}, status=status.HTTP_400_BAD_REQUEST)
                        
                    dict_2["coordinates"] = dict_1.get("geometry",{}).get("coordinates",[])
                    obj_response_finall.append(dict_2)
            else:
                return Response({'message': 'No Data found with this filter', "data":pages}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': obj_response_finall, "data": pages}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': 'Something went wrong', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)