from django.shortcuts import render,redirect, HttpResponse
from django.conf import settings
import os
from io import BytesIO
from datetime import datetime
import json
import base64
from django.contrib.gis.geos import Polygon
from PIL import Image
import xmljson
from xml.etree.ElementTree import tostring
from xmljson import badgerfish
import sys
from shapely.geometry import Polygon  as pyg
# Create your views here.
import logging
import random
import zipfile
import xml.etree.ElementTree as ET
from django.http import JsonResponse
from .models import MarsMainTableData, MarsBandInformation
from .serializers import MarsMainTableDataSerializer, MarsBandInformationSerializer, zipinfoseraliser
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.status import HTTP_406_NOT_ACCEPTABLE
from xml.etree import ElementTree as ET
from lxml import etree
import glob
import io
logger = logging.getLogger(__name__)

def home(request):
    return render(request, 'archival/home.html')





from django.db import transaction

# def json_to_xml(json_data, parent=None): #not use anywhere
#     if isinstance(json_data, dict):
#         for key, value in json_data.items():
#             if isinstance(value, dict) or isinstance(value, list):
#                 element = Element(key)
#                 parent.append(element) if parent is not None else None
#                 json_to_xml(value, element)
#             else:
#                 element = SubElement(parent, key)
#                 element.text = str(value)
#     elif isinstance(json_data, list):
#         for item in json_data:
#             json_to_xml(item, parent)


def remove_empty_values(dictionary):  #imp used
    new_dict = {}
    for key, value in dictionary.items():
        if isinstance(value, dict):
            # Recursively call the function for nested dictionaries
            nested_dict = remove_empty_values(value)  # 'a':{'b':{'dfedf':12}, 'c':{'dd':12}}
            if nested_dict:
                new_dict[key] = nested_dict
        elif value and value.strip() != "":
            # Keep non-empty values
            new_dict[key] = value
    return new_dict

no_z = 0
# Function to recursively traverse the XML tree and extract attributes
def extract_attributes(element, path="", attributes=None): #used function
    if attributes is None:
        attributes = {}
    global no_z
    for key, value in element.attrib.items():
        attributes_list = [key for key in attributes]
        attri_path = path + "/" + element.tag + "__" + key
        if attri_path in attributes_list:
            attri_path = attri_path + "___" + str(no_z)
            no_z = no_z + 1
        attributes[attri_path] = value
    for child in element:
        extract_attributes(child, path + "/" + element.tag, attributes) #path/Dimap_Document  /METADATA_FORMAT
    return attributes

def sort_key(item):
    parts = item.split("_")
    if len(parts) > 1:
        try:
            return int(parts[-1])
        except ValueError:
            return -float('inf')  # Place strings with non-numeric parts at the beginning
    else:
        return -float('inf')
    
def remove_digits_from_end(s, count_no_match):
    i = len(s) - 1
    count_no = 0
    while i >= 0 and (s[i].isdigit() or s[i] == "_"):
        if s[i] == "_":
            count_no += 1 
        i -= 1
        if count_no == count_no_match:
            break
    return s[:i+1]

def are_all_elements_same(lst):
    return all(item == lst[0] for item in lst)

def has_duplicates(lst):
    counts = {}  # Dictionary to store counts of elements
    for item in lst:
        if item in counts:
            counts[item] += 1
        else:
            counts[item] = 1
    # Check if every element occurs at least twice
    for count in counts.values():
        if  count < 2 or count > 2:
            return False  # If any element occurs less than twice, return False
    return True

@api_view(['POST','GET'])
def my_new_file_upload_view_tri_sterio(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.getlist('file')  #file Name of zip
        total_size = 0
        if not uploaded_file:
            return Response({"Message": "REQUIRED ZIP FILE"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            vb = request.POST.getlist('data')
        except Exception as e:
            return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        if vb:
            json_data_string = vb[0]
            try:
                data_dict = json.loads(json_data_string)
                try:
                    mission_value1 = data_dict.get('mission')
                    if mission_value1 is not None:
                        mission_value1 = mission_value1.strip()
                    mission_value2 = data_dict.get('option')
                    if mission_value2 is not None:
                        mission_value2 = mission_value2.strip()

                    if mission_value1 is  None and mission_value2 is  None:
                        return Response({"Message": "PROVIDE MISSION AND OPTION VALUE"}, status=status.HTTP_400_BAD_REQUEST)
                    elif mission_value1 is  None or mission_value1.strip() == "":
                        return Response({"Message": "PROVIDE MISSION  VALUE"}, status=status.HTTP_400_BAD_REQUEST)
                    elif mission_value2 is  None  or mission_value2.strip() == "":
                        return Response({"Message": "PROVIDE  OPTION VALUE"}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        pass
                except Exception as e:
                    return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except json.JSONDecodeError as e:
                return Response({"Message": "Error decoding JSON:","ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"Message": "PROVIDE MISSION AND OPTION VALUE"}, status=status.HTTP_400_BAD_REQUEST)
        
        selected_mission = [mission_value1, mission_value2]
        matching_files = []
        matching_files_jpg = []
        count_no_zip_file = 0
        try:
            output_zip_buffer = io.BytesIO()
            with zipfile.ZipFile(output_zip_buffer, 'w') as output_zip: #yeti aala
                for zip_fil in uploaded_file:
                    if not zip_fil.name.endswith('.zip'):
                        return Response({"Message": "FILE IS NOT A ZIP FILE"}, status=status.HTTP_400_BAD_REQUEST)
                    total_size += zip_fil.size
                    try:
                        with zipfile.ZipFile(zip_fil, 'r') as zip_ref:
                            for file_name in zip_ref.namelist():
                                if ('DIM_' in file_name and file_name.endswith('.XML')) or  ('PREVIEW_' in file_name and file_name.lower().endswith('.jpg')):
                                    file_content = zip_ref.read(file_name)
                                    output_zip.writestr(file_name, file_content)
                            count_no_zip_file += 1
                    except Exception as e:
                        return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                output_zip_buffer.seek(0)
                ZIP_SIZE = ""
                try:
                    if total_size < 1024:
                        size1 = total_size
                        ZIP_SIZE += str(size1) + " " + "bytes"
                    elif total_size >= 1024 and total_size < 1024**2:
                        size1 = total_size/1024 
                        ZIP_SIZE += str(size1) + " " + "KB"
                    elif total_size >= 1024**2 and total_size < 1024**3:
                        size1 = total_size/(1024**2)
                        ZIP_SIZE += str(size1) + " " + "MB" 
                    else:
                        size1 = total_size/(1024**3)
                        ZIP_SIZE += str(size1) + " " + "GB"
                except Exception as e:
                    return Response({"Message": "PROBLEM IN ZIP_SIZE CALCULATION", "ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                # with zipfile.ZipFile(zip_fil, 'r') as zip_ref:
                file_names = output_zip.namelist() #inside zip list of file in string formatt
                # print("FIles name are", file_names)
                desired_file = 'DIM_'
                desired_prefix = 'PREVIEW_'
                desired_extension = '.jpg'
                # matching_files = [item for item in file_names if (desired_file in item and item[-1:-4:-1][::-1] == "XML")] #list have files #ja fiole madhi Dim aahe te file extract keli   ye ak file name hua  DIM file or main XML file   path d pasun start aahe
                matching_files= [item for item in file_names if (desired_file in item and item.endswith(".XML"))]
                matching_files_jpg = [item for item in file_names if desired_prefix in item and item.lower().endswith(desired_extension)] #only take that file have (name in str) priview and extension .jpg   ye ak img hua
                images_data = []
                try:
                    for file_path_jpg in matching_files_jpg:
                        with output_zip.open(file_path_jpg) as file:
                            img_data = file.read()
                            img_base64 = base64.b64encode(img_data).decode('utf-8')
                            images_data.append({
                                'file_path': file_path_jpg,
                                'image_data': img_base64,
                            })
                except Exception as e:
                    return Response({"Message": "PROBLEM IN IMAGEDATA", "ERROR": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                all_file_info = []
                COUNT_XML_FILE = 0
                list_data_not_found = []
                tags_present_in_xml_file = []
                for path in matching_files:
                    # print("=======================hhhhhhhhhhhhhhhh================rrrrrrrrrrrrrrrrrrrrr", path)   
                    try:
                        with output_zip.open(path) as source:   ###yeti aala 2
                            file_name_xml = path.split('/')[-1]
                            xml_data = source.readlines()
                            source.seek(0)
                            tree = etree.parse(source)
                            root = tree.getroot()
                            pattern = root.tag
                            lines = []
                            try:
                                for line in xml_data:
                                    line_str = line.decode('utf-8')
                                    if pattern in line_str:
                                        fg = line_str.find("<" + pattern + ">")
                                        line_str_1 = line_str[:fg]
                                        lines.append(line_str_1)
                                        break 
                                    lines.append(line_str)
                                formatted_xml_string = ''.join(lines)   
                                formatted_xml_string += tostring(root, encoding='unicode', method='xml')
                            except Exception as e:
                                return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            result_data = {}  #entire tags from xml
                            count_no = 0
                            try:
                                for element in root.iter():  #get final tag
                                    # Build the hierarchy path by manually iterating through ancestors
                                    ancestors = []
                                    ancestor = element
                                    # print("cccccccccccccccccccccccccc", ancestor)
                                    while ancestor is not None:
                                        ancestors.insert(0, ancestor.tag)
                                        ancestor = ancestor.getparent()
                                        # print("bbbbbbbbbbbbbbb", ancestor)
                                    hierarchy_path = '/'.join(ancestors)
                                    result_data_1_list = [key for key in  result_data]
                                    try:
                                        if hierarchy_path in result_data_1_list:
                                            hierarchy_path = hierarchy_path + "_" + str(count_no)
                                            count_no = count_no + 1
                                        result_data[hierarchy_path] = element.text
                                    except Exception as e:
                                        return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                                # result_values = {key: value for key,value in result_data.items() if key in list}
                            except Exception as e:
                                return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            try:
                                filtered_dict = remove_empty_values(result_data)   #remove key having None   value
                                list_tag = [key for key in filtered_dict]  #list of text tag
                                dic_with_ignore_key = {key: value for key,value in result_data.items() if key not in list_tag}
                                attributes = extract_attributes(root)
                                list_atrribute = [key for key in attributes]  #list of atrribute
                                final_dict_tag_attrib = {**filtered_dict, **attributes}  #final obj atrrib and tags
                                final_list_tag_attribute_all = list_tag + list_atrribute   
                            except Exception as e:
                                return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            required_attrib_tag = {
                                "/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href",  #* QL PATH :    PREVIEW_PHR1B_PMS_201903230538130_ORT_3917261101.JPG   #@ QL_PATH__href
                                "/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit",   #@ CLOUD_COVERAGE__unit
                                "/Dimap_Document/Dataset_Content/SURFACE_AREA__unit",     #@ SURFACE_AREA__unit
                                "/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit",    #@   SNOW_COVERAGE__unit
                                "Dimap_Document/Dataset_Identification/DATASET_NAME", #* DATA NAME :    DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156   #@ DATASET_NAME    20190323
                                "Dimap_Document/Dataset_Content/SURFACE_AREA", #* SURFACE AREA(sqkm) : 69.5517   #@ SURFACE_AREA 
                                "Dimap_Document/Dataset_Content/CLOUD_COVERAGE", #*CLOUD COVERAGE :    0   #@ CLOUD_COVERAGE
                                "Dimap_Document/Dataset_Content/SNOW_COVERAGE", #* SNOW COVERAGE : 0   #@ SNOW_COVERAGE
                                "Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def", #* 77.81235288931178, 77.88330166284861, 77.88177641327687, 77.81086504915028  #@ Vertex/LON  
                                # "Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LAT_not_def", #* 13.01184388350101, 13.01106470335839, 12.87843636954639, 12.87920734213435  #@ Vertex/LAT
                                
                                "Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME", #* COMPANY NAME : AIRBUS DS GEO  #@PRODUCER_NAME
                                "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def", #Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO  #@ PRODUCT_CODE
                                "Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE", #* CUSTOMER ID : SO19008910  #@ CUSTOMER_REFERENCE
                                "Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE",#* PROJECTION TABLE :    EPSG, PROJECTION NAME :    32643   #Dimap_Document/Coordinate_Reference_System/Geodetic_CRS/GEODETIC_CRS_CODE
                                                                                    #@ Coordinate_Reference_System/Projected_CRS
                                "Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL",#*DATA PROCESS LEVEL :    ORTHO
                                                                        #@ PROCESSING_LEVEL
                                "Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING",#* DATA SPECTRAL PROC :    PMS  #@ SPECTRAL_PROCESSING
                                "Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING", #* PIXEL IN X DIR :    0.5, # PIXEL IN Y DIR :    0.5 #@ Sampling_Settings/RESAMPLING_SPACING or may be one
                                "Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT", #* DATA FORMAT :    image/tiff  #@ DATA_FILE_FORMAT
                                # "Dimap_Document/Raster_Data/Data_Access/DATA_FILE_TILES", #* DATA TILES NO :    2   #@ DATA_FILE_TILES
                                "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES", #i added
                                "Dimap_Document/Raster_Data/Raster_Dimensions/NROWS", #* DATA ROWS NO :    29372   #@ NROWS
                                "Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS", #* DATA COLUMNS NO :    15407   #@ NCOLS
                                "Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS", #* DATA BANDS NO :    4   #@ NBANDS
                                "Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE", #* DATA TYPE :    INTEGER  #@ Raster_Encoding/DATA_TYPE
                                "Dimap_Document/Raster_Data/Raster_Encoding/NBITS", #* Data Bits: 16   #@ NBITS
                                "Dimap_Document/Raster_Data/Raster_Encoding/SIGN", #* DATA SIGNAGE :    UNSIGNED  #@ SIGN
                                "Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE", #* ACQUISITION RANGE : 12  #@ ACQUISITION_RANGE
                                "Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE", #* PRODUCT RANGE : 12   #@ PRODUCT_RANGE
                                "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def", #1.2   Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/BAND_ID
                                                                                                                        #@ Band_Spectral_Range/BAND_ID
                            
                                "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def", #* GSD ACROSS PATH :    0.7847000419819068   #@ Ground_Sample_Distance/GSD_ACROSS_TRACK
                                # "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK", #* GSD ALONG PATH :    0.8390993057219476    #@ Ground_Sample_Distance/GSD_ALONG_TRACK    #$  GSD_ACROSS_TRACK same tag
                                "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION",#* satellite name concat45  #@ Strip_Source/MISSION
                                "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX", #* satellite name  concat45   @# Strip_Source/MISSION_INDEX
                                "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE", #* IMAGING DATE :    23-03-2019   @# Strip_Source/IMAGING_DATE
                                # "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO",#* SATELLITE NAME : PLEIADES    #Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE   #@ PRODUCT_INFO
                                "Dimap_Document/Coordinate_Reference_System/Geodetic_CRS/GEODETIC_CRS_CODE",#Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE   #@ Coordinate_Reference_System/Geodetic_CRS
                                
                                "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def", #* INCIDENCE ANGLE :    26.65226319295046   #@ Acquisition_Angles/   INCIDENCE_ANGLE(main)
                            }
                            required_attrib_tag_list = list(required_attrib_tag)  # 4 atrribute and 41 tags total 45 value
                            present_tag_attrib = {key:value for key, value in final_dict_tag_attrib.items() if key in  required_attrib_tag_list}
                            list_tag_attribe_p = [key for key in present_tag_attrib]
                            tags_attribe_not_peresent_in_xml = [x for x in required_attrib_tag_list if x not in list_tag_attribe_p]
                            Remainig_tag_attribe_from_xml = {key:value for key, value in final_dict_tag_attrib.items() if key not in  required_attrib_tag_list}
                            Remainig_tag_attribe_from_xml_list = [key for key in Remainig_tag_attribe_from_xml]
                            present_tag_attrib["xml_text"] = formatted_xml_string
                            present_tag_attrib["file_name_xml"] = file_name_xml
                            xmlSplit = file_name_xml.split("_")
                            xmlFirst = "{0}".format(xmlSplit[0]) #DIM
                            xmlSecond = "{0}".format(xmlSplit[1])#PHR1B
                            DATACODE = ''
                            if xmlFirst == "DIM":
                                if xmlSecond in ["PHR1A", "PHR1B", "PNEO3", "PNEO4", "SPOT6", "SPOT7"]:
                                    DATACODE = "AB" 
                                elif xmlSecond == "PNEOXX":
                                    DATACODE = "PL" 
                                else:
                                    DATACODE = "THE FILE NAME IS NOT IN PROPER FORMAT..... PLEASE CHECK !"
                            present_tag_attrib["DATACODE"] = DATACODE
                            present_tag_attrib["ZIP_SIZE"] = ZIP_SIZE
                            comman1 = ["Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE", "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO"]
                            comman2 = ["Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE", "Dimap_Document/Coordinate_Reference_System/Geodetic_CRS/GEODETIC_CRS_CODE"]
                            coman3 = ["Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID","Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/BAND_ID"] #1.2 
                            comman4 = ["Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MEASURE_UNIT", "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/MEASURE_UNIT"] #1.1
                            comman5 =["Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MIN", "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/MIN", 
                                                "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/FWHM/MIN","Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/FWHM/MIN"] #1.3
                            comman6 = ["Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/MAX", "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/MAX", "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/FWHM/MAX",
                                                        "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Band_Spectral_Range/FWHM/MAX"]
                            coman_final_list = [comman1, comman2, coman3, comman4, comman5, comman6]
                            coman_point_list = []

                            for element in list_tag_attribe_p:
                                for vb in coman_final_list:  #list
                                    if element in vb:
                                        tags_attribe_not_peresent_in_xml = [i for i in tags_attribe_not_peresent_in_xml if i not in vb]
                            count_while = 0
                            while len(tags_attribe_not_peresent_in_xml) > 0:
                                if "/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "QL_PATH" in x and "href" in x and "__" in x:
                                            if (x.find("QL_PATH") < x.find("href")) and  isinstance(Remainig_tag_attribe_from_xml[x], str) and "." in Remainig_tag_attribe_from_xml[x]:
                                                if "/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                
                                if "/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "CLOUD_COVERAGE" in x  and "unit" in x and "__" in x:
                                            if (x.find("CLOUD_COVERAGE") < x.find("unit")) and  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)

                                if "/Dimap_Document/Dataset_Content/SURFACE_AREA__unit" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "SURFACE_AREA" in x  and "unit" in x and "__" in x:
                                            if (x.find("SURFACE_AREA") < x.find("unit")) and  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "/Dimap_Document/Dataset_Content/SURFACE_AREA__unit" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["/Dimap_Document/Dataset_Content/SURFACE_AREA__unit"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("/Dimap_Document/Dataset_Content/SURFACE_AREA__unit")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                            
                                if "/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "SNOW_COVERAGE" in x  and "unit" in x and "__" in x:
                                            if (x.find("SNOW_COVERAGE") < x.find("unit")) and  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                    # print("Opration Succesfull==================================4", x)

                                if "Dimap_Document/Dataset_Identification/DATASET_NAME" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "DATASET_NAME" in x and "__" not in x:
                                            if isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Dataset_Identification/DATASET_NAME" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Dataset_Identification/DATASET_NAME"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Identification/DATASET_NAME")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                    # print("Opration Succesfull==================================5", x)

                                if "Dimap_Document/Dataset_Content/SURFACE_AREA" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "SURFACE_AREA" in x and "__" not in x:
                                            area = float(Remainig_tag_attribe_from_xml[x])
                                            if isinstance(area, float):
                                                if "Dimap_Document/Dataset_Content/SURFACE_AREA" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Dataset_Content/SURFACE_AREA"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Content/SURFACE_AREA")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                    # print("Opration Succesfull==================================6", x)


                                if "Dimap_Document/Dataset_Content/CLOUD_COVERAGE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "CLOUD_COVERAGE" in x and "__" not in x:
                                            # print(type(Remainig_tag_attribe_from_xml[x]), Remainig_tag_attribe_from_xml[x])
                                            area = float(Remainig_tag_attribe_from_xml[x])
                                            if isinstance(area, float) and  0<= area <= 100:
                                                if "Dimap_Document/Dataset_Content/CLOUD_COVERAGE" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Dataset_Content/CLOUD_COVERAGE"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Content/CLOUD_COVERAGE")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                

                                if "Dimap_Document/Dataset_Content/SNOW_COVERAGE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "SNOW_COVERAGE" in x and "__" not in x:
                                            area = float(Remainig_tag_attribe_from_xml[x])
                                            if isinstance(area, float) and  0<= area <= 100:
                                                if "Dimap_Document/Dataset_Content/SNOW_COVERAGE" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Dataset_Content/SNOW_COVERAGE"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Content/SNOW_COVERAGE")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)
                                                    # print("Opration Succesfull==================================8", x)

                                if "Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def" in tags_attribe_not_peresent_in_xml:
                                    vortex_lon_list = []
                                    vortex_lat_list = []
                                    for x in Remainig_tag_attribe_from_xml_list:   # CLOUD_COVERAGE__unit
                                        if "Vertex" in x and "LON" in x and  "__" not in x:
                                            value = float(Remainig_tag_attribe_from_xml[x])
                                            if isinstance(value, float):
                                                vortex_lon_list.append(x)
                                        if "Vertex" in x and "LAT" in x and  "__" not in x:
                                            value = float(Remainig_tag_attribe_from_xml[x])
                                            if isinstance(value, float):
                                                vortex_lat_list.append(x)
                                    modified_list = [remove_digits_from_end(item, 2) for item in vortex_lon_list[:]]
                                    modified_list_2 = [remove_digits_from_end(item, 2) for item in vortex_lat_list[:]]
                                    for s in [modified_list, modified_list_2]:
                                        if are_all_elements_same(s):
                                            pass
                                        else:
                                        # print("Not all elements in the modified_list are the same.")
                                            return Response({"Something_wrong_in_COrdinate":"PLEASE CHEACK co-ordinate tags have different branch in xml"}, status=status.HTTP_400_BAD_REQUEST)
                                    sorted_vortex_lon_list = sorted(vortex_lon_list, key=sort_key) #jhhjhjhjjhjhjh
                                    sorted_vortex_lat_list = sorted(vortex_lat_list, key=sort_key)
                                    if len(sorted_vortex_lon_list) == len(sorted_vortex_lat_list):
                                        dict_lat_lon ={}
                                        for i in range(len(sorted_vortex_lon_list)):
                                            dict_lat_lon["X"+"_" + str(i)] = Remainig_tag_attribe_from_xml[sorted_vortex_lon_list[i]]
                                            dict_lat_lon["Y"+"_" + str(i)] = Remainig_tag_attribe_from_xml[sorted_vortex_lat_list[i]]

                                        lat_co = []
                                        LON_co = []
                                        for key in dict_lat_lon:
                                            if "Y" in key:
                                                lat_co.append(key)
                                            elif "X" in key:
                                                LON_co.append(key)
                                        
                                        lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                        LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                        list_x_y_cor = []
                                        if len(lat_co) == len(LON_co):
                                            for i in range(len(LON_co)):
                                                list_x_y_cor.append((dict_lat_lon[LON_co[i]], dict_lat_lon[lat_co[i]])) #for i in range(min(len(lat_co), len(LON_co))))
                                            if pyg(list_x_y_cor).is_valid:
                                                # logger.info("VALID POLYGONE bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
                                                pass
                                            else:
                                                return Response({"Message": "Polygone cordinate have issue cheack", "Polygone":list_x_y_cor}, status=status.HTTP_400_BAD_REQUEST)
                                        
                                        else:
                                            return Response({"Message": "Polygone cordinate have issue Not x and y same element"}, status=status.HTTP_400_BAD_REQUEST)
                                        
                                        if "Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def" in tags_attribe_not_peresent_in_xml:
                                            present_tag_attrib["Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def"] = dict_lat_lon
                                            tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def")
                                            Remainig_tag_attribe_from_xml.pop(x)
                                            Remainig_tag_attribe_from_xml_list.remove(x)
                                        
                                        for i in (sorted_vortex_lon_list + sorted_vortex_lat_list):
                                            Remainig_tag_attribe_from_xml.pop(i)
                                            Remainig_tag_attribe_from_xml_list.remove(i)
                                    else:
                                        return Response({"Message": "Polygone cordinate have issue. X and Y cordinate not same"}, status=status.HTTP_400_BAD_REQUEST)
                                if "Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "PRODUCER_NAME" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================17", x)

                                if "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if ("PRODUCT_CODE" in x or "PRODUCT_INFO" in x)  and "__" not in x and Remainig_tag_attribe_from_xml[x]:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def")
                                                    # tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_INFO")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================18", x)          
                                
                                if "Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "CUSTOMER_REFERENCE" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================19", x)     

                                if "Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE" in tags_attribe_not_peresent_in_xml:
                                    list_of_PROJECTED_CRS_CODE = []
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if ("Coordinate_Reference_System/Projected_CRS" in x or "Coordinate_Reference_System/Geodetic_CRS" in x)  and "__" not in x:
                                            list_of_PROJECTED_CRS_CODE.append({x:Remainig_tag_attribe_from_xml[x]})
                                    if "Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE" in tags_attribe_not_peresent_in_xml:
                                        present_tag_attrib["Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE"] = list_of_PROJECTED_CRS_CODE
                                        tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE")
                                        tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Coordinate_Reference_System/Geodetic_CRS/GEODETIC_CRS_CODE")
                                        Remainig_tag_attribe_from_xml.pop(x)
                                        Remainig_tag_attribe_from_xml_list.remove(x)  
                                        # print("Opration Succesfull==================================20", x)    


                                if "Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "PROCESSING_LEVEL" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================21", x)

                                if "Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "SPECTRAL_PROCESSING" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================22", x)

                                if "Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "Sampling_Settings/RESAMPLING_SPACING" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str):
                                                if "Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================23", x)
                                
                                if "Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "DATA_FILE_FORMAT" in x  and "__" not in x:
                                            if  isinstance(Remainig_tag_attribe_from_xml[x], str) and "image" in Remainig_tag_attribe_from_xml[x]:
                                                if "Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================23", x)
                                
                                if "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "NTILES" in x  and  vf.isdigit() and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================24", x)

                                if "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:
                                        if ("Dimap_Document/Raster_Data/Data_Access/DATA_FILE_TILES" in x or "DATA_FILE_TILES" in x) and "__" not in x:
                                            if  "true" == Remainig_tag_attribe_from_xml[x].lower():
                                                list_tile = []
                                                for y in Remainig_tag_attribe_from_xml_list:
                                                    if "tile_R" in y:
                                                        list_tile.append(y)
                                                value_tile = len(list_tile)
                                                if "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES"] = str(value_tile)
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==================================24", x)
                                            elif  "false" == Remainig_tag_attribe_from_xml[x].lower():
                                                if "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES"] = str(1)
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    print("Opration Succesfull==================================24", x)

                                
                                if "Dimap_Document/Raster_Data/Raster_Dimensions/NROWS" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "NROWS" in x  and  vf.isdigit() and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Dimensions/NROWS" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/NROWS"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/NROWS")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================25", x)

                                
                                if "Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "NCOLS" in x  and  vf.isdigit() and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================26", x)

                                if "Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "NBANDS" in x  and  vf.isdigit() and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================27", x)

                                if "Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "Raster_Encoding/DATA_TYPE" in x  and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================28", x)

                                if "Dimap_Document/Raster_Data/Raster_Encoding/NBITS" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "NBITS" in x  and vf.isdigit() and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Encoding/NBITS" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Encoding/NBITS"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Encoding/NBITS")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================29", x)

                                if "Dimap_Document/Raster_Data/Raster_Encoding/SIGN" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "SIGN" in x   and "__" not in x:
                                            if "Dimap_Document/Raster_Data/Raster_Encoding/SIGN" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Raster_Data/Raster_Encoding/SIGN"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Raster_Data/Raster_Encoding/SIGN")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                print("lllllllllllllllllllllllllllllllllllllllllllll")
                                                # print("Opration Succesfull==============lllllllllllll====================30", x)

                                if "Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "ACQUISITION_RANGE" in x and  vf.isdigit()  and "__" not in x:
                                            if "Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                print("lllllllllllllllllllllllllllllllllllllllllllll")
                                                # print("Opration Succesfull==============lllllllllllll====================31", x)
                                
                                if "Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "PRODUCT_RANGE" in x and  vf.isdigit()  and "__" not in x:
                                            if "Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                print("lllllllllllllllllllllllllllllllllllllllllllll")
                                                # print("Opration Succesfull==============lllllllllllll====================32", x)

                                if "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def" in tags_attribe_not_peresent_in_xml:
                                    list_Band_Spectral_Range = []
                                    list_Band_Spectral_Range_MEASURE_UNIT = []
                                    list_Band_Spectral_Range_MIN = []
                                    list_Band_Spectral_Range_MAX = []
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "Band_Spectral_Range" in x and "BAND_ID" in x  and "__" not in x:
                                            list_Band_Spectral_Range.append(x)
                                        if "Band_Spectral_Range" in x and "MEASURE_UNIT" in x and "__" not in x:
                                            list_Band_Spectral_Range_MEASURE_UNIT.append(x)
                                        if "Band_Spectral_Range" in x and "MIN" in x and "__" not in x:
                                            list_Band_Spectral_Range_MIN.append(x)
                                        if "Band_Spectral_Range" in x and "MAX" in x and "__" not in x:
                                            list_Band_Spectral_Range_MAX.append(x)
                                    list_Band_Spectral_Range_1 = [remove_digits_from_end(item, 1) for item in list_Band_Spectral_Range[:]]
                                    list_Band_Spectral_Range_MEASURE_UNIT_1 = [remove_digits_from_end(item, 1) for item in list_Band_Spectral_Range_MEASURE_UNIT[:]]
                                    list_Band_Spectral_Range_MIN_1 = [remove_digits_from_end(item, 1) for item in list_Band_Spectral_Range_MIN[:]]
                                    list_Band_Spectral_Range_MAX_1 = [remove_digits_from_end(item, 1) for item in list_Band_Spectral_Range_MAX[:]]

                                    for s in [list_Band_Spectral_Range_1, list_Band_Spectral_Range_MEASURE_UNIT_1, list_Band_Spectral_Range_MIN_1, list_Band_Spectral_Range_MAX_1]:
                                        if are_all_elements_same(s):
                                            pass
                                        else:
                                            return Response({"Something_wrong_in_COrdinate":"PLEASE CHEACK co-ordinate tags have different branch in xml"}, status=status.HTTP_400_BAD_REQUEST)
                                    sorted_list_Band = sorted(list_Band_Spectral_Range, key=sort_key) #jhhjhjhjjhjhjh
                                    sorted_list_Band_MEASURE_UNIT = sorted(list_Band_Spectral_Range_MEASURE_UNIT, key=sort_key)
                                    sorted_list_Band_MIN = sorted(list_Band_Spectral_Range_MIN, key=sort_key)
                                    sorted_list_Band_MAX = sorted(list_Band_Spectral_Range_MAX, key=sort_key)
                                    list_Band_Spectral_we = {}
                                    for y in range(len(sorted_list_Band)):
                                        list_Band_Spectral_we["Band_ID" + "_" +  str(y)] = Remainig_tag_attribe_from_xml[sorted_list_Band[y]]
                                        Remainig_tag_attribe_from_xml.pop(sorted_list_Band[y])
                                        Remainig_tag_attribe_from_xml_list.remove(sorted_list_Band[y])
                                        list_Band_Spectral_we["MEASURE_UNIT" + "_" +  str(y)] = Remainig_tag_attribe_from_xml[sorted_list_Band_MEASURE_UNIT[y]]
                                        Remainig_tag_attribe_from_xml.pop(sorted_list_Band_MEASURE_UNIT[y])
                                        Remainig_tag_attribe_from_xml_list.remove(sorted_list_Band_MEASURE_UNIT[y])
                                        list_Band_Spectral_we["MIN" + "_" +  str(y)] =  Remainig_tag_attribe_from_xml[sorted_list_Band_MIN[y]]
                                        Remainig_tag_attribe_from_xml.pop(sorted_list_Band_MIN[y])
                                        Remainig_tag_attribe_from_xml_list.remove(sorted_list_Band_MIN[y])
                                        list_Band_Spectral_we["MAX" + "_" +  str(y)] = Remainig_tag_attribe_from_xml[sorted_list_Band_MAX[y]]
                                        Remainig_tag_attribe_from_xml.pop(sorted_list_Band_MAX[y])
                                        Remainig_tag_attribe_from_xml_list.remove(sorted_list_Band_MAX[y])

                                    if "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def" in tags_attribe_not_peresent_in_xml:
                                        present_tag_attrib["Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def"] = list_Band_Spectral_we
                                        tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def")
                                        # print("Opration Succesfull==============lllllllllllll====================33", x)
                                
                                if "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def"  in tags_attribe_not_peresent_in_xml:
                                    GSD_ACROSS_TRACK_list = {}
                                    GSD_ALONG_TRACK_list = {}

                                    for x in Remainig_tag_attribe_from_xml_list:
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "Ground_Sample_Distance/GSD_ACROSS_TRACK" in x and  "__" not in x:
                                            if isinstance(float(vf), float):
                                                GSD_ACROSS_TRACK_list[x] = Remainig_tag_attribe_from_xml[x]
                                        if "Ground_Sample_Distance/GSD_ALONG_TRACK" in x and "__" not in x:
                                            if isinstance(float(vf), float):
                                                GSD_ALONG_TRACK_list[x] = Remainig_tag_attribe_from_xml[x]
                                    sorted_GSD_ACROSS_TRACK_list = sorted(list(GSD_ACROSS_TRACK_list.keys()), key=sort_key)
                                    sorted_GSD_ALONG_TRACK_list = sorted(list(GSD_ALONG_TRACK_list.keys()), key=sort_key)
                                    counting = 1
                                    identical_ACROSS = [remove_digits_from_end(i, counting) for i in sorted_GSD_ACROSS_TRACK_list[:]]
                                    identical_ALONG = [remove_digits_from_end(i, counting) for i in sorted_GSD_ALONG_TRACK_list[:]]
                                    new_dict_incidence_ACROSS = {}
                                    new_dict_incidence_ALONG = {}
                                    if are_all_elements_same(identical_ACROSS):
                                        for i in range(len(sorted_GSD_ACROSS_TRACK_list)):
                                            new_dict_incidence_ACROSS["D_GSD_AXT" + "_"+ str(i)] = GSD_ACROSS_TRACK_list[sorted_GSD_ACROSS_TRACK_list[i]]
                                    if are_all_elements_same(identical_ALONG):
                                        for i in range(len(sorted_GSD_ALONG_TRACK_list)):
                                            new_dict_incidence_ALONG["D_GSD_ALT" + "_"+ str(i)] = GSD_ALONG_TRACK_list[sorted_GSD_ALONG_TRACK_list[i]]
                                    if "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def" in tags_attribe_not_peresent_in_xml:
                                        present_tag_attrib["Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def"] = new_dict_incidence_ACROSS
                                        present_tag_attrib["D_GSD_ALT"] = new_dict_incidence_ALONG
                                        tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def")
                                        vbn = {**GSD_ACROSS_TRACK_list, **GSD_ALONG_TRACK_list}
                                        for i in vbn:
                                            Remainig_tag_attribe_from_xml.pop(i)
                                            Remainig_tag_attribe_from_xml_list.remove(i)
                                        # print("Opration Succesfull==============lllllllllllll====================34")

                                if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "MISSION" in x   and "__" not in x and "MISSION_INDEX" not in x:
                                            if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================35", x)

                                if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        if "MISSION_INDEX" in x   and "__" not in x:
                                            if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX" in tags_attribe_not_peresent_in_xml:
                                                present_tag_attrib["Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX"] = Remainig_tag_attribe_from_xml[x]
                                                tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX")
                                                Remainig_tag_attribe_from_xml.pop(x)
                                                Remainig_tag_attribe_from_xml_list.remove(x)  
                                                # print("Opration Succesfull==============lllllllllllll====================36", x)

                                if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE" in tags_attribe_not_peresent_in_xml:
                                    for x in Remainig_tag_attribe_from_xml_list:  # you have str  remaining tags
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "IMAGING_DATE" in x   and "__" not in x:
                                            if datetime.strptime(vf, '%Y-%m-%d'):
                                                if "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE" in tags_attribe_not_peresent_in_xml:
                                                    present_tag_attrib["Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE"] = Remainig_tag_attribe_from_xml[x]
                                                    tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE")
                                                    Remainig_tag_attribe_from_xml.pop(x)
                                                    Remainig_tag_attribe_from_xml_list.remove(x)  
                                                    # print("Opration Succesfull==============lllllllllllll====================37", x)

                                if "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def"  in tags_attribe_not_peresent_in_xml:
                                    Acquisition_Angles_INCIDENCE_ANGLE_list = {}
                                
                                    for x in Remainig_tag_attribe_from_xml_list:
                                        vf = Remainig_tag_attribe_from_xml[x]
                                        if "Acquisition_Angles" in x and "INCIDENCE_ANGLE" in x and "INCIDENCE_ANGLE_ALONG_TRACK" not in x and "INCIDENCE_ANGLE_ACROSS_TRACK" not in x and  "__" not in x:
                                            if isinstance(float(vf), float):
                                                Acquisition_Angles_INCIDENCE_ANGLE_list[x] = Remainig_tag_attribe_from_xml[x]
                                    sorted_INCIDENCE_ANGLE_list = sorted(list(Acquisition_Angles_INCIDENCE_ANGLE_list.keys()), key=sort_key)
                                    counting = 1
                                    identical = [remove_digits_from_end(i, counting) for i in sorted_INCIDENCE_ANGLE_list[:]]
                                    new_dict_incidence = {}
                                    if are_all_elements_same(identical):
                                        for i in range(len(sorted_INCIDENCE_ANGLE_list)):
                                            new_dict_incidence["INCIDENCE_ANGLE" + "_"+ str(i)] = Acquisition_Angles_INCIDENCE_ANGLE_list[sorted_INCIDENCE_ANGLE_list[i]]
                                    if "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def" in tags_attribe_not_peresent_in_xml:
                                        present_tag_attrib["Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def"] = new_dict_incidence
                                        tags_attribe_not_peresent_in_xml.remove("Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def")
                                        for i in Acquisition_Angles_INCIDENCE_ANGLE_list:
                                            Remainig_tag_attribe_from_xml.pop(i)
                                            Remainig_tag_attribe_from_xml_list.remove(i)
                                    else:
                                        return Response({"Something_wrong_in_INCIDENCE_ANGLE":"PLEASE CHEACK INCIDENCE_ANGLE tags have different branch in xml"}, status=status.HTTP_400_BAD_REQUEST)
                                        # print("Opration Succesfull==============lllllllllllll====================38")

                                    if "image_data_xml" not in present_tag_attrib:
                                        for data in images_data:
                                            for keys in data:
                                                present_tag_attrib_file_name_xml = present_tag_attrib["file_name_xml"]
                                                if "file_path" == keys:
                                                    data_key = data[keys]
                                                    salsh = data_key[data_key.rfind('/')+1:]             #path[last_slash_index + 1:]
                                                    if salsh[salsh.find("_")+1 : salsh.find('.')] == present_tag_attrib_file_name_xml[present_tag_attrib_file_name_xml.find("_")+1 :present_tag_attrib_file_name_xml.find('.')]:
                                                        if "image_data_xml" not in present_tag_attrib:
                                                            present_tag_attrib["image_data_xml"] = data

                                if count_while == 0:
                                    key_mapping = {
                                                    "/Dimap_Document/Dataset_Identification/DATASET_QL_PATH__href": "DQLNAME",
                                                    "/Dimap_Document/Dataset_Content/CLOUD_COVERAGE__unit": "DCLOUD_UNIT",
                                                    "/Dimap_Document/Dataset_Content/SURFACE_AREA__unit": "DAREA_UNIT",
                                                    "/Dimap_Document/Dataset_Content/SNOW_COVERAGE__unit": "DSNOW_UNIT",
                                                    "Dimap_Document/Dataset_Identification/DATASET_NAME": "DATANAME",
                                                    "Dimap_Document/Dataset_Content/SURFACE_AREA": "DAREA",
                                                    "Dimap_Document/Dataset_Content/CLOUD_COVERAGE": "DCLOUD",
                                                    "Dimap_Document/Dataset_Content/SNOW_COVERAGE": "DSNOW",
                                                    "Dimap_Document/Dataset_Content/Dataset_Extent/Vertex/LON_not_def": "Vertex_LON_LAT",
                                                    "Dimap_Document/Product_Information/Producer_Information/PRODUCER_NAME": "COMP_NA",
                                                    "Dimap_Document/Product_Information/Delivery_Identification/PRODUCT_CODE_not_def": "SATT_NA",
                                                    "Dimap_Document/Product_Information/Delivery_Identification/Order_Identification/CUSTOMER_REFERENCE": "CL_REF",
                                                    "Dimap_Document/Coordinate_Reference_System/Projected_CRS/PROJECTED_CRS_CODE": "DPRJ_TABLE",
                                                    "Dimap_Document/Processing_Information/Product_Settings/PROCESSING_LEVEL": "IMG_DATYPE",
                                                    "Dimap_Document/Processing_Information/Product_Settings/SPECTRAL_PROCESSING":"IMG_DAPROC",
                                                    "Dimap_Document/Processing_Information/Product_Settings/Sampling_Settings/RESAMPLING_SPACING": "D_PIXELX",
                                                    "Dimap_Document/Raster_Data/Data_Access/DATA_FILE_FORMAT": "DFORMAT",
                                                    "Dimap_Document/Raster_Data/Raster_Dimensions/Tile_Set/NTILES": "D_NTILES",
                                                    "Dimap_Document/Raster_Data/Raster_Dimensions/NROWS": "D_NROWS",
                                                    "Dimap_Document/Raster_Data/Raster_Dimensions/NCOLS": "D_NCOLS",
                                                    "Dimap_Document/Raster_Data/Raster_Dimensions/NBANDS": "D_NBANDS",
                                                    "Dimap_Document/Raster_Data/Raster_Encoding/DATA_TYPE": "D_TYPE",
                                                    "Dimap_Document/Raster_Data/Raster_Encoding/NBITS": "D_NBITS",
                                                    "Dimap_Document/Raster_Data/Raster_Encoding/SIGN" : "D_SIGN",
                                                    "Dimap_Document/Radiometric_Data/Dynamic_Range/ACQUISITION_RANGE": "D_AQ_BITS",
                                                    "Dimap_Document/Radiometric_Data/Dynamic_Range/PRODUCT_RANGE": "D_PR_BITS",
                                                    "Dimap_Document/Radiometric_Data/Radiometric_Calibration/Instrument_Calibration/Band_Measurement_List/Band_Spectral_Range/BAND_ID_not_def": "BAND_ID",
                                                    "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ACROSS_TRACK_not_def": "D_GSD_AXT",
                                                    "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Ground_Sample_Distance/GSD_ALONG_TRACK" : "D_GSD_ALT",
                                                    "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION": "SEN_NAME_1",
                                                    "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/MISSION_INDEX" : "SEN_NAME_2",
                                                    "Dimap_Document/Dataset_Sources/Source_Identification/Strip_Source/IMAGING_DATE" : "IMG_DATE",
                                                    "Dimap_Document/Coordinate_Reference_System/Geodetic_CRS/GEODETIC_CRS_CODE" : "DPRJ_TABLE",
                                                    "Dimap_Document/Geometric_Data/Use_Area/Located_Geometric_Values/Acquisition_Angles/INCIDENCE_ANGLE_not_def" : "D_IN_ANGL"
        
                                                        }
                                    present_tag_attrib = {key_mapping.get(k, k): v for k, v in present_tag_attrib.items()}
                                    present_tag_attrib["Remainig_tag_attribe_from_xml"] = Remainig_tag_attribe_from_xml
                                    tags_present_in_xml_file.append(present_tag_attrib)
                                count_while = count_while + 1
                                if count_while == 4:
                                    x = {"Some_tag_attrib_not_found":tags_attribe_not_peresent_in_xml, "file_name":path}
                                    list_data_not_found.append(x)
                                    break
                            COUNT_XML_FILE = COUNT_XML_FILE + 1
                            print(list_data_not_found)

                    except etree.XMLSyntaxError as e:
                        error_message = f"Error parsing XML file: {e}"
                        return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)

                missin_sat = []
                PMS_VALUE = []
                MS_P = []
                cordinate_criteria = []
                date_xml = []
                INCIDENCE_ANGLE_list = []
                pixel_size = []
                for i  in tags_present_in_xml_file:#list of object
                    missin_sat.append(i.get("SATT_NA", "Default_Value"))
                    cordinate_criteria.append(i.get("Vertex_LON_LAT", "NOT_FOUND"))
                    INCIDENCE_ANGLE_list.append(i.get("D_IN_ANGL", "NOT_FOUND"))
                    date_xml.append(i.get("IMG_DATE", "NOT FOUND"))
                    pixel_size.append(i.get("D_PIXELX", None))
                    if i["IMG_DAPROC"] == "PMS" or  i["IMG_DAPROC"] == "PMS-FS":
                        PMS_VALUE.append(i["IMG_DAPROC"])
                    if i["IMG_DAPROC"] in ["P","PAN", "MS", "MS-FS"]:
                        MS_P.append(i["IMG_DAPROC"])
                    
                list_of_obj_in_rep = []
                if selected_mission[1] == "MONO":
                    if PMS_VALUE:
                        if len(PMS_VALUE) == COUNT_XML_FILE and COUNT_XML_FILE == 1:
                            area_coordinate = []
                            for rt in cordinate_criteria[:]:
                                lat_co = []
                                LON_co = []
                                for key in rt:
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                area_coordinate.append([(float(rt[LON_co[i]]), float(rt[lat_co[i]])) for i in range(min(len(lat_co), len(LON_co)))])
                            # X_Z = pyg(area_coordinate)
                            TEST =  area_coordinate[0][0]
                            area_coordinate[0].append(TEST)

                            return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate[0]}, status=status.HTTP_201_CREATED)
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO PANCHROMATIC", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        
                    elif MS_P and not PMS_VALUE:
                        if "MS" in MS_P:
                            MS_C = MS_P.count("MS")
                        elif "MS-FS" in MS_P:
                            MS_C = MS_P.count("MS-FS")
                        else:
                            MS_C = 0
                        if "P" in MS_P:
                            P_C = MS_P.count("P")
                        elif "PAN" in MS_P:
                            P_C = MS_P.count("PAN")
                        else:
                            P_C = 0
                        if (len(MS_P) == COUNT_XML_FILE and MS_C == P_C and COUNT_XML_FILE == 2) or (len(MS_P) == COUNT_XML_FILE and MS_C and COUNT_XML_FILE == 1) or (len(MS_P) == COUNT_XML_FILE and P_C and COUNT_XML_FILE == 1):
                            cord_obj = []
                            for rt in cordinate_criteria:
                                lat_co = []
                                LON_co = []
                                for key in rt:
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                            poly_line = [pyg(i) for i in cord_obj]
                            common_area = poly_line[0]
                            for obj_polygon in poly_line:
                                common_area = common_area.intersection(obj_polygon)
                            if common_area.is_empty:
                                print("There is no common area among the polygons.")
                                return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle Corrdinate points are different in two xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            else:
                                common_area_value = common_area.area
                                print("Common area among the polygons:", common_area_value)
                                area_coor = list(common_area.exterior.coords)
                                area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                first_date = date_xml[0]
                                all_same = all(date == first_date for date in date_xml)
                                if all_same and COUNT_XML_FILE == len(date_xml):
                                    df = []
                                    for i in INCIDENCE_ANGLE_list:
                                        df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                    if are_all_elements_same(df):
                                        return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle incidence_Angle Not Same", "ANGLE": df,  "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                else:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle DATE ISSUE", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        # elif len(MS_P) == COUNT_XML_FILE and MS_C and COUNT_XML_FILE == 1:
                        #     pass
                        # elif len(MS_P) == COUNT_XML_FILE and P_C and COUNT_XML_FILE == 1:
                        #     pass
                        
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle ", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                    else:
                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle and PMS all present", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                
                    #=======================2===========================================
                elif  selected_mission[1] == "STEREO":
                    if PMS_VALUE:
                        if len(PMS_VALUE) == COUNT_XML_FILE and COUNT_XML_FILE == 2:  
                            cord_obj = []
                            for rt in cordinate_criteria:
                                lat_co = []
                                LON_co = []
                                for key in rt:
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                            poly_line = [pyg(i) for i in cord_obj]
                            common_area = poly_line[0]
                            for obj_polygon in poly_line:
                                common_area = common_area.intersection(obj_polygon)
                            if common_area.is_empty:
                                print("There is no common area among the polygons.")
                                return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP MONO MS and P bundle Corrdinate points are different in two xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            else:
        # Compute the area of the common region
                                common_area_value = common_area.area
                                area_coor = common_area.exterior.coords
                                area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                print("Common area among the polygons:", common_area_value)
                                first_date = date_xml[0]
                                all_same = all(date == first_date for date in date_xml)
                                if all_same and COUNT_XML_FILE == len(date_xml):
                                    df = []
                                    for i in INCIDENCE_ANGLE_list:
                                        df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                    if are_all_elements_same(df): #
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP sterio PMS  incidence_Angle are Same", "ANGLE": df,  "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                    else:
                                        return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                else:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP Sterio for PMS DATE ISSUE", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP STERIO PANCHROMATIC", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        
                    elif MS_P and not PMS_VALUE:
                        if "MS" in MS_P:
                            MS_C = MS_P.count("MS")
                        elif "MS-FS" in MS_P:
                            MS_C = MS_P.count("MS-FS")
                        else:
                            MS_C = 0
                        if "P" in MS_P:
                            P_C = MS_P.count("P")
                        elif "PAN" in MS_P:
                            P_C = MS_P.count("PAN")
                        else:
                            P_C = 0
                        
                        if len(MS_P) == COUNT_XML_FILE and MS_C == P_C and COUNT_XML_FILE == 4:
                            cord_obj = []
                            for rt in cordinate_criteria:
                                lat_co = []
                                LON_co = []
                                for key in rt:   #y=lattitude       x= longitude
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                            poly_line = [pyg(i) for i in cord_obj]
                            common_area = poly_line[0]
                            for obj_polygon in poly_line:
                                common_area = common_area.intersection(obj_polygon)
                            if common_area.is_empty:
                                print("There is no common area among the polygons.")
                                return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP STERIO MS and P bundle Corrdinate points are different in 4 xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            else:
        # Compute the area of the common region
                                common_area_value = common_area.area
                                area_coor = common_area.exterior.coords
                                area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                print("Common area among the polygons:", common_area_value)
                                first_date = date_xml[0]
                                all_same = all(date == first_date for date in date_xml)
                                if all_same and COUNT_XML_FILE == len(date_xml):
                                    df = []
                                    for i in INCIDENCE_ANGLE_list:
                                        df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                    if has_duplicates(df):
                                        return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP sterio MS + p  incidence_Angle are have problem", "ANGLE": df,  "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                                else:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIPsterio MS and P bundle date in 4 xml different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        elif (len(MS_P) == COUNT_XML_FILE and MS_C  and COUNT_XML_FILE == 2) or (len(MS_P) == COUNT_XML_FILE and P_C  and COUNT_XML_FILE == 2):
                            if len(set(pixel_size)) == 1 and len(pixel_size)== 2 and None not in pixel_size:
                                cord_obj = []
                                for rt in cordinate_criteria:
                                    lat_co = []
                                    LON_co = []
                                    for key in rt:   #y=lattitude       x= longitude
                                        if "Y" in key:
                                            lat_co.append(key)
                                        elif "X" in key:
                                            LON_co.append(key)
                                    lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                    LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                    cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                                poly_line = [pyg(i) for i in cord_obj]
                                common_area = poly_line[0]
                                for obj_polygon in poly_line:
                                    common_area = common_area.intersection(obj_polygon)
                                if common_area.is_empty:
                                    print("There is no common area among the polygons.")
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP STERIO MS and P bundle Corrdinate points are different in 4 xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                else:
        # Compute the area of the common region
                                    common_area_value = common_area.area
                                    area_coor = common_area.exterior.coords
                                    area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                    print("Common area among the polygons:", common_area_value)
                                    first_date = date_xml[0]
                                    all_same = all(date == first_date for date in date_xml)
                                    if all_same and COUNT_XML_FILE == len(date_xml):
                                        df = []

                                        for i in INCIDENCE_ANGLE_list:
                                            df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                        if len(df)==len(set(df)):
                                            return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                        else:
                                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP sterio MS + p  incidence_Angle are have problem", "ANGLE": df,  "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIPsterio MS and P bundle date in 4 xml different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=HTTP_406_NOT_ACCEPTABLE)
                            
                            else:
                                return Response({"PIXEL NOT FOUND":"PLEASE CHEACK ZIP having only MS required pixel for validation"}, status=HTTP_406_NOT_ACCEPTABLE) 
                        
                        # elif len(MS_P) == COUNT_XML_FILE and MS_C == P_C and COUNT_XML_FILE == 2:
                        #     pass
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP sterio MS and P bundle ", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                    else:
                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP STERIO MS and P bundle and PMS all present", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                elif  selected_mission[1] == "TRI-STEREO":
                    if PMS_VALUE:
                        if len(PMS_VALUE) == COUNT_XML_FILE and COUNT_XML_FILE == 3:
                            cord_obj = []
                            for rt in cordinate_criteria:
                                lat_co = []
                                LON_co = []
                                for key in rt:
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                            poly_line = [pyg(i) for i in cord_obj]
                            common_area = poly_line[0]
                            for obj_polygon in poly_line:
                                common_area = common_area.intersection(obj_polygon)
                            if common_area.is_empty:
                                print("There is no common area among the polygons.")
                                return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP STERIO PMS Corrdinate points are different in two xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            else:
        # Compute the area of the common region
                                common_area_value = common_area.area
                                area_coor = common_area.exterior.coords
                                area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                print("Common area among the polygons:", common_area_value)
                                first_date = date_xml[0]
                                all_same = all(date == first_date for date in date_xml)
                                if all_same and COUNT_XML_FILE == len(date_xml):
                                    df = []
                                    for i in INCIDENCE_ANGLE_list:
                                        df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                    if len(set(df)) == len(df): 
                                        return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-sterio PMS  incidence_Angles are Same", "ANGLE": df,  "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                else:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-Sterio for PMS DATE ISSUE", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO PANCHROMATIC length", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        
                    elif MS_P and not PMS_VALUE:
                        if "MS" in MS_P:
                            MS_C = MS_P.count("MS")
                        elif "MS-FS" in MS_P:
                            MS_C = MS_P.count("MS-FS")
                        else:
                            MS_C = 0

                        if "P" in MS_P:
                            P_C = MS_P.count("P")
                        elif "PAN" in MS_P:
                            P_C = MS_P.count("PAN")
                        else:
                            P_C = 0
                        
                        if len(MS_P) == COUNT_XML_FILE and MS_C == P_C and COUNT_XML_FILE == 6:
                            cord_obj = []
                            for rt in cordinate_criteria:
                                lat_co = []
                                LON_co = []
                                for key in rt:
                                    if "Y" in key:
                                        lat_co.append(key)
                                    elif "X" in key:
                                        LON_co.append(key)
                                lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                            poly_line = [pyg(i) for i in cord_obj]
                            common_area = poly_line[0]
                            for obj_polygon in poly_line:
                                common_area = common_area.intersection(obj_polygon)
                            if common_area.is_empty:
                                return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO MS and P bundle Corrdinate points are different in 6 xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            else:
        # Compute the area of the common region
                                common_area_value = common_area.area
                                area_coor = common_area.exterior.coords
                                area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                print("Common area among the polygons:", common_area_value)
                                first_date = date_xml[0]
                                all_same = all(date == first_date for date in date_xml)
                                if all_same and COUNT_XML_FILE == len(date_xml):
                                    df = []
                                    for i in INCIDENCE_ANGLE_list:
                                        df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                    if has_duplicates(df):
                                        return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO MS and P incidence angle not different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                                else:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-sterio MS and P bundle date in 6 xml different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        
                        elif (len(MS_P) == COUNT_XML_FILE and MS_C  and COUNT_XML_FILE == 3) or (len(MS_P) == COUNT_XML_FILE and P_C  and COUNT_XML_FILE == 3):
                            if  len(set(pixel_size)) == 1 and len(pixel_size)== 3 and None not in pixel_size:
                                cord_obj = []
                                for rt in cordinate_criteria:
                                    lat_co = []
                                    LON_co = []
                                    for key in rt:
                                        if "Y" in key:
                                            lat_co.append(key)
                                        elif "X" in key:
                                            LON_co.append(key)
                                    lat_co.sort(key=lambda x: int(x.split("_")[-1]))
                                    LON_co.sort(key=lambda x: int(x.split("_")[-1]))
                                    cord_obj.append([(rt[lat_co[i]], rt[LON_co[i]]) for i in range(min(len(lat_co), len(LON_co)))])
                            # for k in cord_obj:
                                poly_line = [pyg(i) for i in cord_obj]
                                common_area = poly_line[0]
                                for obj_polygon in poly_line:
                                    common_area = common_area.intersection(obj_polygon)
                                if common_area.is_empty:
                                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO MS and P bundle Corrdinate points are different in 6 xml", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                                else:
        # Compute the area of the common region
                                    common_area_value = common_area.area
                                    area_coor = common_area.exterior.coords
                                    area_coordinate = [(longitude, latitude) for latitude, longitude in area_coor]
                                    print("Common area among the polygons:", common_area_value)
                                    first_date = date_xml[0]
                                    all_same = all(date == first_date for date in date_xml)
                                    if all_same and COUNT_XML_FILE == len(date_xml):
                                        df = []
                                        for i in INCIDENCE_ANGLE_list:
                                            df.append(i.get("INCIDENCE_ANGLE_0", "NOT_FOUND"))
                                        if len(df)==len(set(df)):
                                            return Response({"COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission, "area_coordinate": area_coordinate}, status=status.HTTP_201_CREATED)
                                        else:
                                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO MS and P incidence angle not different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                                    else:
                                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-sterio MS and P bundle date in 6 xml different", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                            
                            else:
                                return Response({"PIXEL NOT FOUND":"PLEASE CHEACK ZIP having only MS required pixel for validation"}, status=HTTP_406_NOT_ACCEPTABLE)
                        else:
                            return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-sterio MS and P bundle ", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                    else:
                        return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP try-STERIO MS and P bundle and PMS all present", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)

                else:
                    return Response({"Something_wrong_in_ZIP":"PLEASE CHEACK ZIP currect option", "COUNT_XML_FILE":COUNT_XML_FILE, "list_data_not_found":list_data_not_found, "tags_present_in_xml_file":tags_present_in_xml_file, "selected_mission":selected_mission}, status=status.HTTP_201_CREATED)
                        
        except Exception as e:
            return Response({"Message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 


@api_view(['POST','GET'])
def optical_mono_sterio_tri_data_save(request):
    if request.method == 'GET':
        pass
        # obj = MarsMainTableData.objects.all()
    elif request.method == 'POST':
        info = request.data
        try:
            with transaction.atomic():
                x = 0
                list_file_name = []
                list_bound_cord = []
                print("dddddddd")
                for dict_img in info.get("zipinfo_set", []):
                    print("wwwwwwwwwwwwwwwwwww")
                    if "IMG_PREVIEW" in dict_img and dict_img["IMG_PREVIEW"]:
                        try:
                            decoded_image_data = base64.b64decode(dict_img["IMG_PREVIEW"])
                            pil_image = Image.open(BytesIO(decoded_image_data))
                            base_dir = settings.BASE_DIR
                            file_name = dict_img["DQLNAME"].split(".")[0]
                            file_name += "-" + str(x) + ".jpg"
                            file_path = os.path.join(base_dir, 'media', file_name)
                            list_file_name.append(file_path)
                            pil_image.save(file_path)
                            with open(file_path, 'rb') as f:
                                image_content = f.read()
                                image_file_object = io.BytesIO(image_content)
                                image_file_object.seek(0)
                                info["zipinfo_set"][x]["IMG_PREVIEW"] = image_file_object
                        except Exception as e:
                            try:
                                for i in list_file_name:
                                    os.remove(i)
                            except Exception as e:
                                return Response({'message': 'removing file', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                            return Response({'message': 'Error processing image data', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        try:
                            dict_img.pop("IMG_PREVIEW", None)
                            info["zipinfo_set"][x] = dict_img
                        except Exception as e:
                            return Response({'message': 'removing IMG_PREVIEW PROBLEM', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    cordi_shape = dict_img.get("geometry_shape", {})
                    cordi_poly = cordi_shape.get("coordinates", None)
                    try:
                        if cordi_poly is not None:
                            print("cordi_poly", cordi_poly)
                            polygon_coordinates = cordi_poly[0]
                            polygon = pyg(polygon_coordinates)
                            if len(cordi_poly) == 1   and polygon.is_valid:
                                pass
                            else:
                                return Response({'message': 'Cordinates are Not creating Proper polygone', "data": dict_img}, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            return Response({'message': 'Cordinates are Not available', "data": dict_img}, status=status.HTTP_400_BAD_REQUEST)
                    except Exception as e:
                        return Response({'message': 'Problem in Bounds', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        pass
                    if "DATACODE" in dict_img.keys():
                        info["zipinfo_set"][x].pop("DATACODE") 
                    else:
                        pass
                    x += 1
                if "zipinfo" in info.keys():
                    info.pop("zipinfo")
                test_poly = info.get("comman_area_shape", {}).get("coordinates", [])
                poly_test = pyg([tuple(i) for i in test_poly[0]])
                if poly_test.is_valid:
                    pass
                else:
                    return Response({'message': 'comman_area_shape polygone Not proper'}, status=status.HTTP_400_BAD_REQUEST)
                
                serializer_a = zipinfoseraliser(data=info)
                if serializer_a.is_valid():
                    serializer_a.save()
                    try:
                        for i in list_file_name:
                            os.remove(i)
                    except Exception as e:
                        return Response({'message': 'removing file problem', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    return Response({'message': 'succesfully save data', "serializer_a": serializer_a.data}, status=status.HTTP_201_CREATED)
                else:
                    try:
                        for i in list_file_name:
                            os.remove(i)
                    except Exception as e:
                        return Response({'message': 'removing file problem', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"errror111": str(e)}, status=status.HTTP_400_BAD_REQUEST)





@api_view(['POST','GET'])
def optical_mono_sterio_tri_data_save_test_run(request):
    if request.method == 'GET':
        pass
        # obj = MarsMainTableData.objects.all()
    elif request.method == 'POST':
        info = request.data
        try:
            x = 0
            list_file_name = []
            list_bound_cord = []

            for dict_img in info.get("zipinfo_set", []):
                if "IMG_PREVIEW" in dict_img and dict_img["IMG_PREVIEW"]:
                    try:
                        decoded_image_data = base64.b64decode(dict_img["IMG_PREVIEW"])
                        pil_image = Image.open(BytesIO(decoded_image_data))
                        base_dir = settings.BASE_DIR
                        file_name = dict_img["DQLNAME"].split(".")[0]
                        file_name += "-" + str(x) + ".jpg"
                        file_path = os.path.join(base_dir, 'media', file_name)
                        list_file_name.append(file_path)
                        pil_image.save(file_path)

                        with open(file_path, 'rb') as f:
                            image_content = f.read()
                            image_file_object = io.BytesIO(image_content)
                            image_file_object.seek(0)
                            info["zipinfo_set"][x]["IMG_PREVIEW"] = image_file_object

                    except Exception as e:
                        for i in list_file_name:
                            try:
                                os.remove(i)
                            except Exception as e:
                                return Response({'message': 'Error removing file', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                        return Response({'message': 'Error processing image data', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)

                else:
                    dict_img.pop("IMG_PREVIEW", None)
                    info["zipinfo_set"][x] = dict_img

                cordi_shape = dict_img.get("geometry_shape", {})
                cordi_poly = cordi_shape.get("coordinates", None)

                if cordi_poly is not None:
                    polygon_coordinates = cordi_poly[0]
                    polygon = pyg(polygon_coordinates)
                    if len(cordi_poly) != 1 or not polygon.is_valid:
                        return Response({'message': 'Coordinates are not creating proper polygon', "data": dict_img}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'message': 'Coordinates are not available', "data": dict_img}, status=status.HTTP_400_BAD_REQUEST)

                if "DATACODE" in dict_img.keys():
                    info["zipinfo_set"][x].pop("DATACODE")
                x += 1

            if "zipinfo" in info.keys():
                info.pop("zipinfo")

            test_poly = info.get("comman_area_shape", {}).get("coordinates", [])
            poly_test = pyg([tuple(i) for i in test_poly[0]])

            if not poly_test.is_valid:
                return Response({'message': 'comman_area_shape polygon not proper'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                serializer_a = zipinfoseraliser(data=info)
                if serializer_a.is_valid():
                    serializer_a.save()
                    for i in list_file_name:
                        try:
                            os.remove(i)
                        except Exception as e:
                            return Response({'message': 'Error removing file', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    return Response({'message': 'Successfully saved data', "serializer_a": serializer_a.data}, status=status.HTTP_201_CREATED)
                else:
                    for i in list_file_name:
                        try:
                            os.remove(i)
                        except Exception as e:
                            return Response({'message': 'Error removing file', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    return Response({'message': 'Validation error', 'errors': serializer_a.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"errror111": str(e)}, status=status.HTTP_400_BAD_REQUEST)





