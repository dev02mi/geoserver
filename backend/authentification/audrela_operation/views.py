# from snippets.models import Snippet
# from snippets.serializers import SnippetSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
import uuid
import redis
import os
import json
from rest_framework.decorators import api_view
import base64
import tempfile
import zipfile
# from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import geopandas as gpd
import pandas as pd
from dbfread import DBF
from shapely.geometry import Point, LineString, Polygon, MultiLineString
from osgeo import ogr, osr
from django.conf import settings
import networkx as nx
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
from django.shortcuts import render
import geopandas as gpd
import json
from shapely.geometry import shape
# Create your views here.
# from mycelery.celery import add 
from authentification.tasks import sub, auderela_file_unzip
from celery.result import AsyncResult



def save_files_to_redis(file_key, shp_file, dbf_file, prj_file):
    # Connect to the Redis database
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

    # Generate a unique session_id
    # session_id = str(uuid.uuid4())
    print(f"Generated session_id: {file_key}")

    # Read the content of each file
    with open(shp_file, 'rb') as shp, open(dbf_file, 'rb') as dbf, open(prj_file, 'rb') as prj:
        shp_content = shp.read()
        dbf_content = dbf.read()
        prj_content = prj.read()

    redis_client.hset(file_key, 'shp', shp_content)
    redis_client.hset(file_key, 'dbf', dbf_content)
    redis_client.hset(file_key, 'prj', prj_content)
    mapping={
        'shp': shp_content,
        'dbf': dbf_content,
        'prj': prj_content
    }
    # Save the files in Redis as a hash
    # redis_client.hset(session_id, mapping)

    print(f"Files saved in Redis under session_id: {file_key}")

    return file_key, mapping



class File_upload(APIView):
    def extract_zip_file(self, zip_file, temp_dir):
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        return zip_ref.namelist()
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self):
        pass
        # try:
        #     return Snippet.objects.get(pk=pk)
        # except Snippet.DoesNotExist:
        #     raise Http404

    def get(self, request, format=None):
        pass
        # snippet = self.get_object(pk)
        # serializer = SnippetSerializer(snippet)
        # return Response(serializer.data)
    def get_or_create_session(self, session_id):
        try:
            session = Session.objects.get(session_key=session_id)
        except Session.DoesNotExist:
            session = Session(session_key=session_id)
            session.save()
        return session

    def post(self, request, format=None):
        # print("dddddddddddddddddddddddddddddddddd")
        # y = sub.apply_async(args=[100,50])
        # session = request.session
        print(request.COOKIES.get("sessionid"))
        session_cookie = request.COOKIES.get("sessionid")
        # Session_cookie = request.COOKIES.get("sessionid")  
        session_cookie = f"{session_cookie}"
        if session_cookie:
            print("Session ID Cookie:", session_cookie)
        else:
            print("No Session ID cookie found")
        print("ddddddddddd")
        file_content = request.FILES.get("file")

        if file_content:
            print("xxxxxxxxxx")
            encoded_content =  base64.b64encode(file_content.read()).decode('utf-8')
            payload = {'doc_file': encoded_content,
                        'sessionid': session_cookie}
            msg = json.dumps(payload)
            file = auderela_file_unzip.apply_async(args=[payload])
            # file = auderela_file_unzip.apply_async(kwargs={"zip_file": payload})args=[zip_file_data]
            # file = auderela_file_unzip.apply_async(args=[None], kwargs={"zip_file": payload})
            # file = auderela_file_unzip.delay(payload) 

            print("vvvvvvvvvvvvvvvvv")
            return Response({"status": "File uploaded successfully", "file_id":file.id }, status=status.HTTP_201_CREATED)
        return Response({"status": "File Not uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        # session_id = str(uuid.uuid4())
        # session["session_id"] = session_id
        # # session_id = session.get("session_id")
        # # session = self.get_or_create_session(session_id)
        # # if not session_id:
        # #     session_id = str(uuid.uuid4())
        # #     session["session_id"] = session_id
        # #     session.save()
        # file_content = request.FILES.get("file")
        # if file_content:
        #     file_key = session_id
        #     print("file_keyfile_keyfile_keyfile_key", file_key)
        #     with tempfile.TemporaryDirectory() as temp_dir:
        #         # zip_file_path = self.save_file(uploaded_zip_file, temp_dir)
        #         extracted_files = self.extract_zip_file(file_content, temp_dir)
        #         required_files = ['.shp', '.dbf','.prj']
        #         hapefile_files_1 = [
        #         os.path.join(temp_dir, f)
        #         for f in extracted_files if any(f.endswith(ext) for ext in required_files)
        #         ]
                
        #         shapefile_files = sorted(
        #         hapefile_files_1,
        #         key=lambda f: required_files.index(next(ext for ext in required_files if f.endswith(ext)))
        #         )
        #         print("extracted_files", extracted_files)
                
        #         # shapefile_files = sorted(
        #         #                 [f for f in extracted_files if any(f.endswith(ext) for ext in required_files)],
        #         #                     key=lambda f: required_files.index(next(ext for ext in required_files if f.endswith(ext)))
        #         #                         )
        #         print("shapefile_filesshapefile_filesshapefile_filesshapefile_files", shapefile_files)
        #         prj_file = [f for f in extracted_files if f.endswith('.prj')]
        #         # data_session_id, file_data_save = save_files_to_redis(file_key, shapefile_files[0], shapefile_files[1], shapefile_files[2])
        #     # redis_client.set(file_key, file_content.read())  # Save file content to Redis
        #     return Response({"status": "File uploaded successfully", "session_id": "data_session_id"}, status=status.HTTP_201_CREATED)
        # else:
        #     return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        # snippet = self.get_object(pk)
        # serializer = SnippetSerializer(snippet, data=request.data)
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        pass
        # snippet = self.get_object(pk)
        # snippet.delete()
        # return Response(status=status.HTTP_204_NO_CONTENT)

















from django.contrib.sessions.backends.db import SessionStore
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import datetime

def set_cookie(response, key, value, days_expire=7):
    if days_expire is None:
        max_age = 365 * 24 * 60 * 60  # one year
    else:
        max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(
        datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age),
        "%a, %d-%b-%Y %H:%M:%S GMT",
    )
    response.set_cookie(
        key=key,
        value=value,
        httponly=True,
        samesite="None",  # Allows cross-site usage
        secure=True,  # Must be True for SameSite=None to work
    )

class SetCookieAPIView(APIView):
    def post(self, request):
        session_id = request.COOKIES.get("sessionid")
        print("Cookie check in while creating:", session_id)
        if session_id:
            existing_session = SessionStore(session_key=session_id)
            if existing_session.exists(session_id):  # Check if the session exists
                print("Existing session is valid.")
                return Response({
                    "message": "Session already exists",
                    "sessionid": session_id,
                })

        new_session = SessionStore()
        new_session.create()  # Generates a new session key and saves the session
        
        # Save custom data in the session (optional)
        # new_session['custom_data'] = "example_value"
        # new_session.save()

        # Retrieve the session key
        session_id = new_session.session_key

        # Set the session ID as a cookie in the response
        print("Session ID:", session_id)
        response = Response({
            "message": "Session created successfully",
            "sessionid": session_id,  # Returning the session ID to the client
        })
        set_cookie(response, "sessionid", session_id)
        return response
    




from rest_framework.views import APIView

import os
import requests
from django.conf import settings
from rest_framework.decorators import api_view
# GeoServer Configurations
GEOSERVER_URL = "http://localhost:8085/geoserver"
GEOSERVER_USER = "admin"
GEOSERVER_PASS = "geoserver"
WORKSPACE = "my_workspace"  # Change as per your workspace

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def upload_shapefile_to_geoserver(request):
    """Uploads a shapefile to GeoServer and returns its WMS/WFS URL."""
    if request.method == "GET":
        file_name = request.GET.get("file_name")
        # return Response({"status": "success", "message": "GET method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        base_dir = os.path.join("media", "shapefiles")
        
        # Construct the full path to the shapefile
        shp_file_path = os.path.join(base_dir, f"{file_name}.shp")
        required_extensions = [".shp", ".shx", ".dbf", ".prj"]
        missing_files = [
            ext for ext in required_extensions if not os.path.exists(os.path.join(base_dir, f"{file_name}{ext}"))
        ]
        
        if missing_files:
            return {"status": "error", "message": f"Missing files: {', '.join(missing_files)} in '{base_dir}'"}
        # Check if the file exists
        # if not os.path.exists(shp_file_path):
        #     return f"Error: File '{file_name}.shp' not found in '{base_dir}'"
        zip_path = os.path.join(base_dir, f"{file_name}.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for ext in required_extensions:
                file_path = os.path.join(base_dir, f"{file_name}{ext}")
                zipf.write(file_path, os.path.basename(file_path))
        # Extract filename without extension
        # filename = os.path.splitext(os.path.basename(shp_file_path))[0]




        # filename = os.path.basename(shp_file_path).split(".")[0]  # Extract file name without extension
        store_name = file_name  # Store name same as filename
        # data_path = os.path.dirname(shp_file_path)

        # GeoServer REST API URL for uploading
        upload_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{store_name}/file.shp"

        # Read the shapefile as binary
        with open(zip_path, "rb") as zip_file:
            response = requests.put(
                upload_url,
                auth=(GEOSERVER_USER, GEOSERVER_PASS),
                files={"file": zip_file},
                headers={"Content-type": "application/zip"},
            )

        # Check if upload was successful
        if response.status_code == 201:
            print(f"✅ {file_name} uploaded successfully to GeoServer!")

            wms_url = (
                f"{GEOSERVER_URL}/{WORKSPACE}/wms?"
                "SERVICE=WMS"
                "&VERSION=1.1.1"
                "&REQUEST=GetMap"
                "&FORMAT=image%2Fpng8"
                "&TRANSPARENT=true"
                "&STYLES"
                f"&LAYERS={WORKSPACE}%3A{file_name}"
                "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage"
                "&SRS=EPSG%3A7767"
                "&WIDTH=768"
                "&HEIGHT=742"
                "&BBOX=908276.9790966115%2C1169876.1720715414%2C922936.459593127%2C1184039.3680720811"
            )
            # Similarly, you can construct the WFS URL if needed:
            wfs_url = (
                f"{GEOSERVER_URL}/{WORKSPACE}/ows?"
                "SERVICE=WFS"
                "&VERSION=1.0.0"
                "&REQUEST=GetFeature"
                f"&typeName={WORKSPACE}:{file_name}"
                "&outputFormat=application/json"
            )

            # Construct WMS & WFS URLs
            # wms_url = f"{GEOSERVER_URL}/{WORKSPACE}/wms?service=WMS&version=1.1.0&request=GetMap&layers={WORKSPACE}:{file_name}&bbox=-180,-90,180,90&width=768&height=330&srs=EPSG:4326&format=image/png"
            # wfs_url = f"{GEOSERVER_URL}/{WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName={WORKSPACE}:{file_name}&outputFormat=application/json"
            return Response({"status": "success", "wms_url": wms_url, "wfs_url": wfs_url},  status=status.HTTP_201_CREATED)

        else:
            print(f"❌ Failed to upload {file_name}. Error: {response.text}")
            return Response({"status": "error", "message": response.text}, status=status.HTTP_400_BAD_REQUEST)

import json
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
import os, io
from django.conf import settings

import os
import geopandas as gpd
from shapely.geometry import shape
import pyproj
import re

class LinkedDict:
    def __init__(self):
        self.mapping = {}
        # self.build_mapping(numbers)

    # def build_mapping(self, numbers):
    #     """Builds the initial mapping from the given list."""
    #     for i, num in enumerate(numbers):
    #         self.mapping[num] = numbers[i + 1:]

    def update_mapping(self, new_numbers):
        """Dynamically updates mapping, preserving order from the new list."""
        for i, num in enumerate(new_numbers):
            if num not in self.mapping:
                # Find the first occurrence of `num` in the list and link it to remaining elements
                self.mapping[num] = new_numbers[i + 1:]
            else:
                break
                

    def get_values(self, key):
        """Fetch linked values for a given key."""
        return self.mapping.get(key, [])
    


    

class Node:
    """Represents a node in a linked list."""
    def __init__(self, value):
        self.value = value
        self.next = None  # Reference to the next node


class LinkedListMapping:
    """Manages linked lists and provides quick lookups."""
    def __init__(self):
        self.heads = {}  # Dictionary storing head nodes for each unique key
        self.tails = {}  # Store last node of each sequence to append efficiently

    def add_sequence(self, sequence):
        """Adds a sequence of numbers to the linked list mapping."""
        if not sequence:
            return  # Ignore empty sequences
        
        prev_node = None
       
        for num in sequence:
            if num in self.heads:  # If number already exists, continue from last node
                # print("CCCCCCCCCC", num)
                
                break
                # prev_node = self.tails[num]
            else:
                # print("aaaaaaaaa", num)
                self.v = 2
                new_node = Node(num)
                self.heads[num] = new_node
                prev_node = new_node  # Start linking from this node
                
            # Link the new numbers
            for next_num in sequence[sequence.index(num) + 1:]:
                # print("bbbbbbb", self.v)
                new_node = Node(next_num)
                prev_node.next = new_node
                prev_node = new_node
            
            self.tails[num] = prev_node  # Update the last node reference

    def get_linked_values(self, key):
        """Returns a list of values linked to the given key."""
        if key not in self.heads:
            return []  # Return empty list if key is not found
        
        values = []
        current = self.heads[key]
        while current:
            values.append(current.value)
            current = current.next
        
        return values



































class Ordering_API(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, pk):
        pass

    def post(self, request,task_id,format=None):
        USERNAME = "admin"
        PASSWORD = "geoserver"
        print("task_id:_____________________________________", task_id)
        redis_key = task_id 
        destination_points = request.data
        print("destination_points", destination_points)
        graph_data = redis_client.get(f"{redis_key}_geojson_graph_gp")
        if not graph_data:
            print("Graph data not found")
            exit()
        graph_data = json.loads(graph_data)
        
        graph_data_int = {int(k): [int(v) for v in values] for k, values in graph_data["graph"].items()}
        # print("Graph data: integer", graph_data_int)
        # return Response(graph_data_int)
        def count_link_path(graph):   #groping lines connected
            visited = set()
            index = 0
            list_connecting_node_new = []
            def dfs(node):
                if node  in visited:
                    return []
                visited.add(node)
                list_group = [node]
                # for neb in graph[node]:
                for neb in graph.get(node, []): #if node not in graph return empty list
                    list_group += dfs(neb)
                return list_group

            for node in graph:
            
                if node not in visited:
                    list_connecting_node_new.append(dfs(node))
              
                    index += 1
            return list_connecting_node_new, index
                    
        xc = count_link_path(graph_data_int)
        def preprocess(arrays):
            hashmap = {}
            for i, subarray in enumerate(arrays):
                for num in subarray:
                    hashmap[num] = i + 1 # Store index and array
            return hashmap

        hashmap = preprocess(xc[0])


        # return Response(xc)
        chunk_count = redis_client.get(f"{redis_key}:count")
        chunk_count = int(chunk_count)
        if not chunk_count:
            print("Task result not found")
            exit()
        chunk_count = int(chunk_count)
        # print("Chunk count:", chunk_count)  
        geojson_str = "".join(redis_client.get(f"{redis_key}:{i}").decode() for i in range(chunk_count))
        print("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
        result = None
        if isinstance(geojson_str, str):  # If result is stored as a string, convert to JSON
            # print("convert into geojson")
            result = json.loads(geojson_str)
        if result:
            max_ordsh = 0
            for feature in result["features"]:
                props = feature.get("properties", {})
                props.setdefault("AUD_ORDSH", 0)
                props.setdefault("AUD_ORDSC", 0)
                # feature["properties"].setdefault("AUD_ORDSH", 0)
                # feature["properties"].setdefault("AUD_ORDSC", 0)
            

            # return Response({"result": result}, status=status.HTTP_201_CREATED)



            for destination_obj in destination_points:

                node_pairs = [
                                (feature["properties"]["AUD_FNODE"], feature["properties"]["AUD_TNODE"]) 
                                        for feature in result.get("features", [])  if int(feature["properties"]["AUD_GRP"]) == destination_obj.get("AUD_GRP")
                    ]#feature["properties"]["AUD_GRP"]
                # return Response(node_pairs)

                # print(node_pairs)
                destination_Node = destination_obj.get("NODEID")
                groping_list_index = hashmap.get(destination_Node)
                group_list = xc[0][groping_list_index-1]
                # print("group_list", group_list)
                subgraph = {key: values  for key, values in graph_data_int.items() if key in group_list}
                single_value_keys_w = [key for key, value in subgraph.items() if len(value) == 1]
                single_value_keys = [key for key in single_value_keys_w if key != destination_Node]
                # single_value_keys = []
                # return Response(single_value_keys)
                print("destination_Node", destination_Node)
                flip_list = []
                path_list = []
                path_list_result = {}
                linked_dict = LinkedDict()

                linked_mapping = LinkedListMapping()
                start_node_not_connect_end = []
                for key in single_value_keys:
                    path = []
                    start_node = key
  # DFS function to capture the specific path from start to target node
                    def dfs_find_path(current, target, visited, path):
                        
                        if linked_mapping.get_linked_values(current):
                            path.extend(linked_mapping.get_linked_values(current))
                            # print("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", path, current)
                            return True
                        path.append(current)  # Add current node to path
                        visited.add(current)

      # If we've reached the target node, return True
                        if current == target:
                            return True

      # Traverse neighbors
                        for neighbor in subgraph.get(current, []):
                            if neighbor not in visited:
              # Recurse with DFS
                                if dfs_find_path(neighbor, target, visited, path): #recurcively check
                                    return True

      # If target isn't reachable through this route, backtrack
                        path.pop()
                        return False

# Find the path from start_node to end_node
                    dfs_find_path(start_node, destination_Node, set(), path)
  # print(path)
                    if path:
                        path_list.append(path)
                        # lst = path #last element 6
                        # linked_dict.update_mapping(path)
                        linked_mapping.add_sequence(path)
                        # for i in range(len(lst) - 1):
                        #     if lst[i] not in path_list_result:
                        #         # print("DICCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC")
                        #         path_list_result[lst[i]] = lst[i+1:] #4
                        #     else:
                        #         break
                           
                        # path_list_result = {lst[i]: lst[i+1:] for i in range(len(lst) - 1)} #4
                        # list_path = ()
                        # for i in range(len(path)-1):
                        #     # list_path.append([path[i], path[i+1]])
                        #     list_path += ((path[i], path[i+1]),)
                        list_path = [(path[i], path[i+1]) for i in range(len(path)-1)]
                        list_path_set = set(list_path)
                        node_pairs = [sublist for sublist in node_pairs if sublist not in list_path_set]
                        result_path = [pair for pair in node_pairs if pair[::-1] in list_path_set]  #those pair need to change
                        if result_path:
                            result_path_set = set(result_path)
                            node_pairs = [sublist for sublist in node_pairs if sublist not in result_path_set]
                            for listl in result_path:
                                if listl not in flip_list:
                                    flip_list.append(listl)
                    else:
                        start_node_not_connect_end.append(start_node)

                # print("flip_list", flip_list)
                # print("start_node_not_connect_end", start_node_not_connect_end)
                # print("path_list", path_list)

                # return Response({"flip_list": flip_list, "start_node_not_connect_end": start_node_not_connect_end, "path_list": path_list})
                result_sub_gp = [
                                feature for feature in result.get("features", [])
                                if feature["properties"].get("AUD_GRP") == destination_obj.get("AUD_GRP")
                                ]
                feature_map = {feature["properties"]["FID"]: feature for feature in result_sub_gp}
                for list_flip in flip_list:
                    for feature in result_sub_gp:
                        if feature["properties"]["AUD_FNODE"] == list_flip[0] and feature["properties"]["AUD_TNODE"] == list_flip[1]:
                            fid = feature["properties"]["FID"]
                            feature["properties"]["AUD_FNODE"] =list_flip[1]
                            feature["properties"]["AUD_TNODE"] =list_flip[0]
                            feature["geometry"]["coordinates"] = feature["geometry"]["coordinates"][::-1]
                            feature_map[feature["properties"]["FID"]] = feature
                            # fid = feature["properties"]["FID"]
                            result_sub_gp =[feat for feat in result_sub_gp if feat["properties"]["FID"] != fid]
                            
                            # print("_____________FLIPING________________")
                            break
                print("_____________FLIPING Complite________________")
                result_sub_gp = [
                            {**feature, 
                             "properties": {
                                **feature["properties"],
                             "AUD_ORDSH": 1 if feature["properties"].get("AUD_FNODE") in single_value_keys else 0,
                             "AUD_ORDSC": 1 if feature["properties"].get("AUD_FNODE") in single_value_keys else 0  
                             }}
                            for feature in feature_map.values()
                                    ]
                fr_node_ord_key =  {
                                    i["properties"]["AUD_FNODE"]: i["properties"]["AUD_ORDSH"]
                                    for i in result_sub_gp
                                    }    
                
                fr_node_ordsc_key =  {
                                    i["properties"]["AUD_FNODE"]: i["properties"]["AUD_ORDSC"]
                                    for i in result_sub_gp
                                    }    
                # print("fr_node_ord_key", fr_node_ord_key)   
                keys_with_zero_value = [key for key, value in fr_node_ord_key.items() if value == 0]

                node_pairs_new = [
                                (feature["properties"]["AUD_FNODE"], feature["properties"]["AUD_TNODE"])
                                        for feature in result_sub_gp 
                                    ]  

                def odering_function():
                    keys_with_zero_value = [key for key, value in fr_node_ord_key.items() if value == 0]
                    while keys_with_zero_value:
                        for num in keys_with_zero_value[:]:
                            # print("num",num)
                            list_fr_node = subgraph[num]
                            # print("first_gflist", list_fr_node)
                            list_fr_node = [node for node in list_fr_node if node not in start_node_not_connect_end]
                            # print("list_fr_node", list_fr_node)
                            output_list_1 = [sublist for sublist in node_pairs_new if sublist[1] == num and sublist[0] in list_fr_node]
                            output_list = [sublist[0] for sublist in output_list_1 if sublist[1] == num and sublist[0] in list_fr_node]
                            # print("output_list", output_list)
        # result_node_val_list = [fr_node_ordering_dict[element] for element in list_fr_node]
        # result_node_val_list = [0 if element == 88 else fr_node_ordering_dict[element] for element in list_fr_node]
                            if output_list:
                                result_node_val_list = [fr_node_ord_key[element] for element in output_list ]
                                result_node_val_list_sc = [fr_node_ordsc_key[element] for element in output_list ]
                                # print("result_node_val_list", result_node_val_list)
                                
                                if not 0 in result_node_val_list and not 0 in result_node_val_list_sc:
                                    add_sc = sum(result_node_val_list_sc)
                                    fr_node_ordsc_key[num] = add_sc
                                    highest_key_list_value = max(result_node_val_list)
                                    count_ele = result_node_val_list.count(highest_key_list_value)
                                    if len(result_node_val_list) == 1:
                                        fr_node_ord_key[num] = highest_key_list_value #+ 1
                                    elif count_ele > 1:
                                        fr_node_ord_key[num] = highest_key_list_value + 1
                                    elif count_ele == 1 and len(result_node_val_list) > 1:
                                        fr_node_ord_key[num] =  highest_key_list_value

                                    # for sublist in output_list_1:
                                    #     node_pairs_new.remove(sublist)
                                    # node_pairs_new[:] = [pair for pair in node_pairs_new if pair not in output_list_1]
                                    output_set = set(output_list_1)  # Convert to a set for O(1) lookups
                                    node_pairs_new[:] = [pair for pair in node_pairs_new if pair not in output_set]

                        keys_with_zero_value = [key for key, value in fr_node_ord_key.items() if value == 0]
                            # node_pairs_new = [sublist for sublist in node_pairs_new if sublist not in output_list_1]
                            # for sublist in output_list_1:
                            #     node_pairs_new.remove(sublist)





                # while keys_with_zero_value:
                #     for num in keys_with_zero_value[:]:
                odering_function()
                    # keys_with_zero_value = [key for key, value in fr_node_ord_key.items() if value == 0]
                    # keys_with_zero_value
                print("ORDERING COMPLETE________________________")
                cv = [key for key, value in fr_node_ord_key.items() if value == 0]
                print(len(cv))
                if cv:
                    return Response({"Message":cv})
                max_value_val = max(fr_node_ord_key.values())

                # return Response({"status": "success", "ordsh": fr_node_ord_key, "ORDSC":fr_node_ordsc_key}, status=status.HTTP_201_CREATED)
                if max_value_val > max_ordsh:
                    max_ordsh = max_value_val
                result_sub_gp = [
                                {
                                        **feature,
                                         "properties": {
                                    **feature["properties"],
                                        "AUD_ORDSH": fr_node_ord_key.get(feature["properties"].get("AUD_FNODE"), 0),
                                        "AUD_ORDSC": fr_node_ordsc_key.get(feature["properties"].get("AUD_FNODE"), 0)
                                         }
                                    }
                                    for feature in result_sub_gp
                           ]
                sub_gp_dict = {feature["properties"]["FID"]: feature for feature in result_sub_gp}

                result["features"] = [
                        sub_gp_dict.get(feature["properties"]["FID"], feature) 
                            for feature in result.get("features", [])
                                ]

            print("________________operationcompleted____________________")
            # return Response({ "result": result}, status=status.HTTP_201_CREATED)
            crs_string = result.get("crs", {}).get("properties", {}).get("name", "EPSG:4326")
            # if crs_string.startswith("EPSG:"):
            #     crs_string = crs_string.split(":")[-1] 
            features = result["features"]
            gdf = gpd.GeoDataFrame(
                            [feature["properties"] for feature in features], 
                                geometry=[shape(feature["geometry"]) for feature in features]
        )
            
            try:
    # Validate and set CRS
                crs = pyproj.CRS.from_user_input(crs_string)  # Ensure CRS is valid
                gdf.set_crs(crs, inplace=True)
                print("Valid CRS set:", crs)

            except Exception as e:
                print(f"Invalid CRS '{crs_string}', falling back to EPSG:4326. Error: {e}")
                gdf.set_crs(epsg=4326, inplace=True)

# Convert to a standard CRS if not already EPSG:4326
            if gdf.crs.to_epsg() != 4326:
                print("Converting CRS to EPSG:4326")
                gdf = gdf.to_crs(epsg=4326)
            # gdf.set_crs(crs_string, inplace=True)
            # shp_output_path = "output_data.shp"

            delete_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{task_id}/featuretypes/{task_id}"
            response = requests.delete(delete_url, auth=(USERNAME, PASSWORD))
            if response.status_code == 200:
                print(f"✅ Layer {task_id} deleted successfully!")
            else:
                print(f"❌ Failed to delete layer {task_id}. Response: {response.text}")



            mem_zip_point = io.BytesIO()
            with tempfile.TemporaryDirectory() as tmpdir:
                shapefile_base_point = os.path.join(tmpdir, f"{task_id}")
                gdf.to_file(shapefile_base_point + ".shp")
                    # gdf.to_file(shapefile_path)
                with zipfile.ZipFile(mem_zip_point, 'w', zipfile.ZIP_DEFLATED) as zf:
                    for root, dirs, files in os.walk(tmpdir):
                        for file in files:
                            file_path = os.path.join(root, file)
                            zf.write(file_path, arcname=file)
                mem_zip_point.seek(0)
                rest_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{task_id}/file.shp"
                headers = {"Content-type": "application/zip"}
                print("__________________________GEOSERVERPOINT____________________________________________________")
                response = requests.put(
                                rest_url,
                            data=mem_zip_point.read(),
                                headers=headers,
                                auth=(USERNAME, PASSWORD))
                if response.status_code == 201:
                    print(f"✅  uploaded successfully Line to GeoServer!")
                    return Response({"status": "success", "max_ordsh": max_ordsh, "node_pairs_new":node_pairs_new}, status=status.HTTP_201_CREATED)
                else:   
                    print(f"❌ Failed to upload Line to GeoServer. Error: {response.text}")
                    return Response({"status": "error", "message": response.text}, status=status.HTTP_400_BAD_REQUEST)










            # base_dir_m = "/mnt/d/Download/Geoserver/data_dir/data/my_workspace"
            # folder_name = redis_key
            # output_folder = os.path.join(base_dir_m, folder_name)
            # os.makedirs(output_folder, exist_ok=True)
            # shp_output_path = os.path.join(output_folder, redis_key+".shp")
            # gdf.to_file(shp_output_path, driver="ESRI Shapefile", encoding="utf-8")
            # print("Shapefile saved to:____________________________", shp_output_path)
            
        # pass
        return Response({"status": "error", "message": "No result found"}, status=status.HTTP_400_BAD_REQUEST)

    # def put(self, request, pk, format=None):
    #     snippet = self.get_object(pk)
    #     serializer = SnippetSerializer(snippet, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, pk, format=None):
    #     snippet = self.get_object(pk)
    #     snippet.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
import hashlib
import random
class Colur_ordsh(APIView):
    """
    Retrieve, update or delete a snippet instance.
    AUD_ORDSH	6
    """
    def get_object(self, pk):
        pass

    def post(self, request,task_id,format=None):
        remove_style_payload = """<layer><defaultStyle/></layer>"""
        USERNAME = "admin"
        PASSWORD = "geoserver"
        STYLE_NAME = "AUD_ORDSH_style"
        GEOSERVER_URL = "http://localhost:8085/geoserver"
        WORKSPACE = "my_workspace"
        print("task_id:_____________________________________", task_id)
        redis_key = task_id 
        data = request.data

        delete_url = f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{task_id}/featuretypes/{task_id}"
        response = requests.delete(delete_url, auth=(USERNAME, PASSWORD))
        if response.status_code == 200:
            print(f"✅ Layer {task_id} deleted successfully!")
        else:
            print(f"❌ Failed to delete layer {task_id}. Response: {response.text}")






        response = requests.put(
                    f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                        auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "text/xml"},
                        data=remove_style_payload,
                        )

        if response.status_code == 200:
            print("✅ Existing style removed successfully!")
        else:
            print(f"❌ Failed to remove style. Status Code: {response.status_code}")
            print(f"Response: {response.text}")
        max_ordsh = data.get("max_ordsh") #start 1 to end max_ordsh 7
        # def random_color():
        #     while True:
        #         color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
        #         if color != "#000000":  # Ensure black is not chosen
        #             return color
        # def random_color():
        #     return "#{:06x}".format(random.randint(0, 0xFFFFFF))
        # ord_list = [i for i in range(1, max_ordsh+1)]
        # print("ord_list", ord_list)
        # color_map = {grp: self.random_color() for grp in ord_list}
        # print("color_map", color_map)
        # ord_list = [i for i in range(1, max_ordsh + 1)]
        # def generate_color_map(max_ordsh):
        #     print("ord_list", ord_list)
        #     # color_map = {0: "#000000"}
        #     color_map = {grp: random_color() for grp in ord_list}
        #     return color_map

        def hash_color(value):
            hash_object = hashlib.md5(str(value).encode())  # Generate hash from value
            return f"#{hash_object.hexdigest()[:6]}"  # Get the first 6 characters as hex color

        def generate_color_map(unique_values):
            color_map = {val: hash_color(val) for val in unique_values}
            color_map[0] = "#000000"  # Default color for 0
            return color_map
        ord_list = list(set([0] + [i for i in range(1, max_ordsh + 1)]))
        color_map = generate_color_map(ord_list)
        # color_map[0] = "#000000"
        # ord_list.insert(0, 0)
        print("color_map", color_map)
        print("ord_list", ord_list)
        sld_rules = "".join(
                                            f"""
                                        <sld:Rule>
                                            <sld:Name>AUD_ORDSH_{grp}</sld:Name>
                                            <sld:Title>Group {grp}</sld:Title>
                                            <ogc:Filter>
                                                <ogc:PropertyIsEqualTo>
                                                <ogc:PropertyName>AUD_ORDSH</ogc:PropertyName>
                                                    <ogc:Literal>{grp}</ogc:Literal>
                                                </ogc:PropertyIsEqualTo>
                                            </ogc:Filter>
                                            <sld:LineSymbolizer>
                                                <sld:Stroke>
                                                    <sld:CssParameter name="stroke">{color_map[grp]}</sld:CssParameter>
                                                    <sld:CssParameter name="stroke-width">{grp+1}</sld:CssParameter>
                                                </sld:Stroke>
                                            </sld:LineSymbolizer>
                                        </sld:Rule>
                                        """
                                        for grp in ord_list
                                    )
        default_rule = """           <!--
                                        <sld:Rule>
                                            <sld:Name>Default_Group</sld:Name>
                                            <sld:Title>Other Groups</sld:Title>
                                            <ogc:ElseFilter/>
                                            <sld:LineSymbolizer>
                                                <sld:Stroke>
                                                <sld:CssParameter name="stroke">#000000</sld:CssParameter>
                                                    <sld:CssParameter name="stroke-width">2</sld:CssParameter>
                                                </sld:Stroke>
                                            </sld:LineSymbolizer>
                                        </sld:Rule>
                                    
                              
                                      <sld:Rule>
                            <PointSymbolizer>
                        <Geometry>
                            <ogc:Function name="endPoint">
                                <ogc:PropertyName>the_geom</ogc:PropertyName>
                            </ogc:Function>
                        </Geometry>
                        <Graphic>
                            <Mark>
                                <WellKnownName>shape://oarrow</WellKnownName>
                                <Fill>
                                <CssParameter name="fill">#000000</CssParameter>
                                <CssParameter name="fill-opacity">0.2</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#000000</CssParameter>
                                    <CssParameter name="stroke-width">0.5</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>30</Size>
                            <Rotation>
                                <ogc:Function name="endAngle">
                                    <ogc:PropertyName>the_geom</ogc:PropertyName>
                                </ogc:Function>
                            </Rotation>
                        </Graphic>
                    </PointSymbolizer>
                        </sld:Rule>   
                            -->
                                        """
        
        sld_template = f"""<?xml version="1.0" encoding="UTF-8"?>
                            <sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" 
                                xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
                                <sld:NamedLayer>
                                <sld:Name>AUD_ORDSH Styling</sld:Name>
                                    <sld:UserStyle>
                                    <sld:Title>Styled by AUD_ORDSH</sld:Title>
                                    <sld:FeatureTypeStyle>
                                            {sld_rules}
                                             {default_rule}
                                        </sld:FeatureTypeStyle>
                                    </sld:UserStyle>
                                </sld:NamedLayer>
                            </sld:StyledLayerDescriptor>"""
        response_to_style = requests.put(
                            f"{GEOSERVER_URL}/rest/styles/AUD_ORDSH_style",
                            auth=(USERNAME, PASSWORD),
                            headers={"Content-Type": "application/vnd.ogc.sld+xml"},
                            data=sld_template,
                        )
        if response_to_style.status_code == 200:
            print("✅ Style created successfully!")
            style_assignment_payload = f"""
                                    <layer>
                                            <defaultStyle>
                                <name>{STYLE_NAME}</name>
                                            </defaultStyle>
                                                                </layer>
                                                                """
            response = requests.put(
                                            f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{task_id}",
                                        auth=(USERNAME, PASSWORD),
                                headers={"Content-Type": "text/xml"},  # Ensure correct headers
                                                    data=style_assignment_payload,
                                                    )
            if response.status_code == 200:
                print(f"✅ Style assigned successfully to {task_id}!")
                return Response({"status": "success"},  status=status.HTTP_201_CREATED)
            else:
                print(f"❌ Failed to assign style. Status Code: {response.status_code}")
                print(f"Response: {response.text}")
                return Response({"status": "error", "message": response.text}, status=status.HTTP_400_BAD_REQUEST)
        else:   
            print(f"❌ Failed to create style. Status Code: {response_to_style.status_code}")
            print(f"Response: {response_to_style.text}")
            return Response({"status": "error", "message": response_to_style.text}, status=status.HTTP_400_BAD_REQUEST)
from pyproj import CRS, Transformer        
from shapely.geometry import mapping
from shapely.wkt import loads
class Polygone_selection(APIView):
    """
    List all snippets, or create a new snippet.
    """
    def get(self, request, format=None):
        # KHASRA_NO = request.query_params.get("Khasra_no")
        KHASRA_NO = request.GET.get("Khasra_no")
        print("KHASRA_NO______", KHASRA_NO)
        # if KHASRA_NO:
            # Perform filtering based on the provided Khasra_no  DHAN_CADAS_ARCHIVE_UTM
            # queryset = YourModel.objects.filter(KHASRA_NO=KHASRA_NO)
        try:
            shapefile_path = settings.MEDIA_ROOT / "FINSHPDATA" / "DHAN_CADAS_FIELD_UTM.shp"
            gdf = gpd.read_file(str(shapefile_path))
        except Exception as e:
            return Response({"error": "Shapefile not found"}, status=status.HTTP_404_NOT_FOUND)
        # else:
        #     # pass
        #     return Response({"error": "Khasra_no not provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        lines = gdf[gdf.geometry.geom_type == "LineString"]
        multilines = gdf[gdf.geometry.geom_type == "MultiLineString"]
        if not lines.empty or not multilines.empty:
            return Response({"status": "LineString/MultiLineString    Present"}, status=status.HTTP_200_OK)
        if KHASRA_NO:
            line_share = {}
            point_share = {}
            # Perform filtering based on the provided Khasra_no
            target_geometry = gdf[gdf['Khasra_Num'] == KHASRA_NO]['geometry'].iloc[0]
            intersecting_geometries = gdf[
                        (gdf['geometry'].intersects(target_geometry)) &
                            (gdf['geometry'] != target_geometry)  # Exclude exact match
                                ]
            num_intersections = len(intersecting_geometries)

            def polygon_edges(polygon):
                print("Polygon:", polygon)

    # Extract exterior edges
                exterior_coords = list(polygon.exterior.coords)
                exterior_edges = [LineString([exterior_coords[i], exterior_coords[i+1]]) for i in range(len(exterior_coords) - 1)]

    # Extract interior (hole) edges
                interior_edges = []
                for interior in polygon.interiors:
                    interior_coords = list(interior.coords)
                    interior_edges.extend(
            [LineString([interior_coords[i], interior_coords[i+1]]) for i in range(len(interior_coords) - 1)]
        )

                print("Exterior Edges:", exterior_edges)
                print("Interior Edges:", interior_edges)

                return exterior_edges + interior_edges

            def find_shared_lines(geom, target_geom):
    
                edges1 = polygon_edges(geom)
                edges2 = polygon_edges(target_geom)

    # print("Edges of Polygon 1:", edges1)
    # print("Edges of Polygon 2:", edges2)

                shared_edges = set()
                shared_points = set()  # Using a set to store unique intersection points

                for edge1 in edges1:
                    for edge2 in edges2:
                        shared_part = edge1.intersection(edge2)
                        if not shared_part.is_empty:
                            if isinstance(shared_part, Point):  # Store unique intersection points
                                POI_n = f"{shared_part.x},{shared_part.y}"
                                print("POINT____________", POI_n)
                                if point_share.get(POI_n):
                                    pass
                                else:
                                    point_share[POI_n] = (max(point_share.values(), default=0)) + 1
                                shared_points.add(point_share[POI_n])
                            else:  # Store shared line segments
                                # print("LINE____________", shared_part)
                                if shared_part.geom_type == "LineString":
                                    line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in shared_part.coords])
                                    if line_share.get(line_points_str):
                                        pass
                                    else:
                                        # print("LINE____________", line_points_str)
                                        line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                                        shared_edges.add(line_share[line_points_str])
                                elif shared_part.geom_type == "MultiLineString":
                                    for line in shared_part.geoms:
                                        line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in line.coords])
                                        # pass
                                        if line_share.get(line_points_str):
                                            pass
                                        else:
                                        # print("LINE____________", line_points_str)
                                            line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                                            shared_edges.add(line_share[line_points_str])

                return shared_edges if shared_edges else None, shared_points if shared_points else None
            
            intersecting_geometries[['shared_line', 'shared_point']] = intersecting_geometries.apply(
                                lambda row: find_shared_lines(row.geometry, target_geometry), axis=1, result_type='expand'
                        )
            intersecting_geometries_display = intersecting_geometries.reset_index(drop=True)
            point_share = {v: k for k, v in point_share.items()}
            geojson_data = {
                        "type": "FeatureCollection",
                            "features": []
                            }
            for _, row in intersecting_geometries_display.iterrows():
    # Extract all non-geometry attributes dynamically
                properties = row.drop(["geometry"]).to_dict()

    # ✅ Main Geometry Feature
                main_feature = {
                        "type": "Feature",
                        "properties": properties,  # Dynamic properties
                        "geometry": mapping(row["geometry"])  # Convert main geometry to GeoJSON
                        }
                geojson_data["features"].append(main_feature)
            

            
            geojson_feature_target = {
                    "type": "Feature",
                    "properties": {
                    "Khasra_Num": KHASRA_NO
                            },
                "geometry": mapping(target_geometry)  # Convert to GeoJSON geometry
                    }
            polygon_coords_outer = geojson_feature_target["geometry"]["coordinates"][0]
            polygon_edges_outer = [LineString([polygon_coords_outer[i], polygon_coords_outer[i + 1]]) 
                       for i in range(len(polygon_coords_outer) - 1)]
            polygon_edges_inner = []
            if len(geojson_feature_target["geometry"]["coordinates"]) > 1:
                for hole in geojson_feature_target["geometry"]["coordinates"][1:]:  # Iterate over holes
                    hole_edges = [LineString([hole[i], hole[i + 1]]) for i in range(len(hole) - 1)]
                    polygon_edges_inner.extend(hole_edges)
            print("line_share.values()_____", line_share.keys())
            # line_segments_inter_poly = [LineString(segment) for segment in line_share.values()]
            line_segments_inter_poly = []
            for segment in line_share.keys():
    # Split the segment by commas to get each pair of coordinates
                coordinates = segment.split(', ')
    
    # Split each coordinate by space and convert to float
                coordinates = [tuple(map(float, coord.split())) for coord in coordinates]
    
    # Create a LineString from the coordinates
                line_segments_inter_poly.append(LineString(coordinates))
            print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
            remaining_edges = set()
            for edge in polygon_edges_outer:
                print("edge____________________", edge)
                modified_edge = edge
                for line in line_segments_inter_poly:
                    intersect = modified_edge.intersection(line)
                    modified_edge = modified_edge.difference(intersect) 
                    print("___ed",modified_edge)
                    if modified_edge.is_empty:
                        break  # 
                if not modified_edge.is_empty:  # Only add non-empty edges
                    # # if line_share.get(modified_edge.wkt):
                    # #     pass
                    # line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in modified_edge.coords])
                    if modified_edge.geom_type == "LineString":
                        line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in modified_edge.coords])
                        if line_share.get(line_points_str):
                            pass
                        else:
                            # print("LINE____________", line_points_str)
                            line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                        remaining_edges.add(line_share.get(line_points_str))
                        # line_share[line_points_str] = max(line_share.values(), default=0) + 1
                    elif modified_edge.geom_type == "MultiLineString":
                        for line in modified_edge.geoms:
                            line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in line.coords])
                            if line_share.get(line_points_str):
                                pass
                            else:
                                # print("LINE____________", line_points_str)
                                line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                            remaining_edges.add(line_share.get(line_points_str))
                            # line_share[line_points_str] = max(line_share.values(), default=0) + 1
                    else:
                        line_points_str = ""
                        print("Unsupported geometry type:____________________________________", modified_edge.geom_type)

                    # remaining_edges.append(modified_edge)
            print("remaining_edges____________", remaining_edges)


            # remaining_edges_in = set()
            if polygon_edges_inner:
                for edge in polygon_edges_inner:
                    modified_edge = edge
                    for line in line_segments_inter_poly:
                        intersect = modified_edge.intersection(line)
                        modified_edge = modified_edge.difference(intersect) 
                        if modified_edge.is_empty:
                            break
                    if not modified_edge.is_empty:  # Only add non-empty edges
                        if modified_edge.geom_type == "LineString":
                            line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in modified_edge.coords])
                            if line_share.get(line_points_str):
                                pass
                            else:
                            # print("LINE____________", line_points_str)
                                line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                            remaining_edges.add(line_share.get(line_points_str))
                        # line_share[line_points_str] = max(line_share.values(), default=0) + 1
                        elif modified_edge.geom_type == "MultiLineString":
                            for line in modified_edge.geoms:
                                line_points_str = ", ".join([f"{point[0]} {point[1]}" for point in line.coords])
                                if line_share.get(line_points_str):
                                    pass
                                else:
                                # print("LINE____________", line_points_str)
                                    line_share[line_points_str] = (max(line_share.values(), default=0)) + 1
                                remaining_edges.add(line_share.get(line_points_str))
                            # line_share[line_points_str] = max(line_share.values(), default=0) + 1
                        else:
                            line_points_str = ""
                            print("Unsupported geometry type:____________________________________", modified_edge.geom_type)

            geojson_feature_target["properties"]["edges_not_share"] = remaining_edges

            orignal_crs = gdf.crs.to_epsg()
            Gcs_projection = CRS.from_epsg(4326)

            line_share ={v: k for k, v in line_share.items()}
            if orignal_crs == Gcs_projection:
                pass
            else:
                transformer = Transformer.from_crs(orignal_crs, Gcs_projection, always_xy=True)
                line_lengths = {}
                for key, coords in line_share.items():
                    points = [tuple(map(float, p.split())) for p in coords.split(", ")]
                    line = LineString(points)
                    line_lengths[key] = line.length
                    transformed_points = [transformer.transform(x, y) for x, y in line.coords]
                    line_share[key] = transformed_points


# Print results
                for key, length in line_lengths.items():
                    print(f"Line {key}: {length:.2f} meters")
                print("___________________________", line_lengths)
                line_share_in_meter ={k: (v,line_lengths[k]) for k, v in line_share.items()}

                for key, coords in point_share.items():
    # Parse coordinates
                    x, y = map(float, coords.split(","))

    # Create a Point
                    # point = Point(x, y)

    # Transform the point
                    transformed_x, transformed_y = transformer.transform(x, y)
                    # transformed_point = Point(transformed_x, transformed_y)
                    # point_share[key] = transformed_point
                    point_share[key] = [transformed_x, transformed_y]
                
                data_file = geojson_data.get("features")
                if  isinstance(data_file, list):
                        print("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                        new_data_fet = []
                        for feature in data_file:
                            geometry = feature.get("geometry")
                            print("__________________fgfgfgfgfggffg")
                            if geometry:
                                coordinates = geometry.get("coordinates")
                                print("DEBUG: Type of coordinates ->", type(coordinates))  # Should be list
                                print("DEBUG: First element in coordinates ->", coordinates[0])
                                if geometry.get("type") == "Polygon":
                                    print("__________________________Polygon")
                                    if isinstance(coordinates[0], tuple):
                                            print("__________________________Polygon11")
                                            new_list_cordinate = []
                                            for cord in coordinates[0]:
                                                x, y = transformer.transform(cord[0], cord[1])
                                                new_list_cordinate.append([x, y])
                                            feature["geometry"]["coordinates"] = [new_list_cordinate]
                target_data = geojson_feature_target.get("geometry")
                if target_data:
                    target_coordinates = target_data.get("coordinates")
                    new_list_coordinates = []

    # Iterate through all rings (outer and inner)
                    # print("DDDDDDDDDDDDDDD__________________________", target_coordinates)
                    for ring in target_coordinates:
                        transformed_ring = []
                        for cordi in ring:
                            x, y = cordi[:2] 
                            new_x, new_y = transformer.transform(x, y)
                            transformed_ring.append([new_x, new_y])
                        new_list_coordinates.append(transformed_ring)

    # Update the geojson structure with transformed coordinates
                    geojson_feature_target["geometry"]["coordinates"] = new_list_coordinates

            return Response({"Message":"Operation Successfull", "geojson_data": geojson_data, "num_intersections": num_intersections, "KHASRA_NO": KHASRA_NO, "line_share_in_meter": line_share_in_meter, "point_share":point_share, "geojson_feature_target":geojson_feature_target}, status=status.HTTP_200_OK)

        else:
            print("___________________No Khasra")
            unique_khasra_nums = gdf["Khasra_Num"].unique()
            print("____unique_khasra_nums", unique_khasra_nums)
            return Response({"status": "No Khasra_no provided", "unique_khasra_nums": unique_khasra_nums}, status=status.HTTP_200_OK)
        








    def post(self, request, format=None):
       pass
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from shapely.geometry import mapping, Polygon, MultiPolygon
from shapely.ops import unary_union
class  Polygone_correction(APIView):
    """
    List all snippets, or create a new snippet.
    """
    def get(self, request, format=None):
        # KHASRA_NO = request.query_params.get("Khasra_no")
        KHASRA_NO = request.GET.get("Khasra_no")
        print("KHASRA_NO______", KHASRA_NO)
        if KHASRA_NO:
            # Perform filtering based on the provided Khasra_no  DHAN_CADAS_ARCHIVE_UTM
            # queryset = YourModel.objects.filter(KHASRA_NO=KHASRA_NO)
            try:
                shapefile_path = settings.MEDIA_ROOT / "FINSHPDATA" / "DHAN_CADAS_ARCHIVE_UTM.shp"
                shapefile_path_grd = settings.MEDIA_ROOT / "FINSHPDATA" / "DHAN_CADAS_FIELD_UTM.shp"
                gdf_orignal = gpd.read_file(str(shapefile_path))
                gdf_ground = gpd.read_file(str(shapefile_path_grd))
            except Exception as e:
                return Response({"error": "Shapefile not found"}, status=status.HTTP_404_NOT_FOUND)
            
            lines = gdf_orignal[gdf_orignal.geometry.geom_type == "LineString"]
            multilines = gdf_orignal[gdf_orignal.geometry.geom_type == "MultiLineString"]
            if not lines.empty or not multilines.empty:
                return Response({"status": "LineString/MultiLineString    Present in orignal"}, status=status.HTTP_200_OK)
            lines_1 = gdf_ground[gdf_ground.geometry.geom_type == "LineString"]
            multilines_1 = gdf_ground[gdf_ground.geometry.geom_type == "MultiLineString"]
            if not lines_1.empty or not multilines_1.empty:
                return Response({"status": "LineString/MultiLineString   field Present"}, status=status.HTTP_200_OK)
            
            target_geometry_orignal = gdf_orignal[gdf_orignal['Khasra_Num'] == KHASRA_NO]['geometry'].iloc[0]  #orignal polygone 
            target_geometry_field = gdf_ground[gdf_ground['Khasra_Num'] == KHASRA_NO]['geometry'].iloc[0]  # field polygone
            intersecting_geometries = gdf_orignal[
                        (gdf_orignal['geometry'].intersects(target_geometry_field)) &
                            (gdf_orignal['geometry'] != target_geometry_orignal)  # Exclude exact match
                                ]
            num_intersections = len(intersecting_geometries)
            # geojson_polygons = []
            features_poly = []
            if num_intersections > 0:
                # for row in intersecting_geometries.geometry:
                for _, row in intersecting_geometries.iterrows():
                    print("__________________________intersecting_geometries")
                    intersection = target_geometry_field.intersection(row.geometry)
                    row_properties = {
                        "original_geometry": mapping(row.geometry)  # OR any attribute you want from the row
                                }
                    # poly_difference1 = target_geometry_orignal.difference(target_geometry_field)  # Remaining part of poly1
                    # poly_difference2 = target_geometry_field.difference(target_geometry_orignal) 
                    if isinstance(intersection, MultiPolygon):
                        for poly in intersection.geoms:
                            features_poly.append({
                            "type": "Feature",
                                "properties": row.drop("geometry").to_dict(),  # all properties except geometry
                            "geometry": mapping(poly)
                                })
                            features_poly[-1]["properties"].update(row_properties)  # Add properties to the last feature
                    elif isinstance(intersection, Polygon):
                        features_poly.append({
                            "type": "Feature",
                             "properties": row.drop("geometry").to_dict(),
                            "geometry": mapping(intersection)
                            })
                        features_poly[-1]["properties"].update(row_properties) 

            ADDAREA = {      #here we take those area in orignal polygone in nebourghing polygone but in field that area present
                "type": "FeatureCollection",
                "features": features_poly
            }

            def convert_to_geojson(geometry, str_arg): #COMMANNAREA, SUBAREA, OUTAREA
                features = []

    # If MultiPolygon, extract individual Polygons
                if isinstance(geometry, MultiPolygon):
                    for poly in geometry.geoms:
                        features.append({
                        "type": "Feature",
                        "geometry": mapping(poly),
                            "properties":{}
                            }) # "properties": {"Khasra_Num": KHASRA_NO}
                        if str_arg != "OUTAREA":
                            features[-1]["properties"]["Khasra_Num"] = KHASRA_NO
                elif isinstance(geometry, Polygon):
                    features.append({
                    "type": "Feature",
                    "geometry": mapping(geometry),
                    "properties":{}
                     })# "properties": {"Khasra_Num": KHASRA_NO}
                    if str_arg != "OUTAREA":
                            features[-1]["properties"]["Khasra_Num"] = KHASRA_NO
                else:
                    raise TypeError("Geometry must be a Polygon or MultiPolygon")

    # Wrap in GeoJSON FeatureCollection
                geojson = {
                "type": "FeatureCollection",
                "features": features
            }

                return geojson

            print("cccccccccccccccccccvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
            intersection_orig_and_field = target_geometry_orignal.intersection(target_geometry_field)
            poly_oruignal_not_in_field_poly = target_geometry_orignal.difference(target_geometry_field)
            poly_field_not_in_orignal = target_geometry_field.difference(target_geometry_orignal) 
            # if not intersecting_geometries.empty:
            #     intersecting_union = unary_union(intersecting_geometries.geometry.tolist())
            #     poly_field_not_in_orignal = poly_field_not_in_orignal.difference(intersecting_union)
            # poly_field_not_in_orignal = poly_field_not_in_orignal.difference(intersecting_geometries) 
            # intersection_orig_and_field = mapping(intersection_orig_and_field)

            for geom in intersecting_geometries.geometry:
                poly_field_not_in_orignal = poly_field_not_in_orignal.difference(geom)
            poly_field_not_in_orignal = poly_field_not_in_orignal.difference(target_geometry_orignal) 
            for geom in intersecting_geometries.geometry:
                poly_field_not_in_orignal = poly_field_not_in_orignal.difference(geom)
            # poly_oruignal_not_in_field_poly = mapping(poly_oruignal_not_in_field_poly)
            print("________________________________intersection")
            OUTAREA =None
            if not poly_field_not_in_orignal.is_empty:
                OUTAREA = convert_to_geojson(poly_field_not_in_orignal, "OUTAREA")
            # OUTAREA = convert_to_geojson(poly_field_not_in_orignal)
            COMMANNAREA = convert_to_geojson(intersection_orig_and_field, "COMMANNAREA")
            SUBAREA = convert_to_geojson(poly_oruignal_not_in_field_poly, "SUBAREA")


            # field_not_intersect = mapping(poly_difference2)
            # poly_difference1 = target_geometry_orignal.difference(target_geometry_field)  # Remaining part of poly1
            # poly_difference2 = target_geometry_field.difference(target_geometry_orignal) 




            ORIGNAL = mapping(target_geometry_orignal)
            FIELD = mapping(target_geometry_field)
            ORIGNAL ={
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": ORIGNAL,
                        "properties": {"Khasra_Num": KHASRA_NO}
                    }
                ]
            }
            FIELD ={
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": FIELD,
                        "properties": {"Khasra_Num": KHASRA_NO}
                    }
                ]
            }
            poly_dict = {
                key: value for key, value in {
                "ADDAREA": ADDAREA,
                "COMMANNAREA": COMMANNAREA,
                "SUBAREA": SUBAREA,
                "OUTAREA": OUTAREA
                     }.items() if value not in [None, {}, [], '', ()]
                }
            # "ORIGNAL":ORIGNAL,"FIELD":FIELD,

            rows = []
            all_keys = set()
            for features in poly_dict.values():
                for feat in features['features']: 
                    # all_keys.update(feat.keys())
                    all_keys.update(feat['properties'].keys())

            print(all_keys)
            for change_area_key, features in poly_dict.items():
                for feat in features['features']:
                    print("__________________________change_area_key", feat["geometry"])
                    geom = shape(feat["geometry"])
                    base_data = {key: feat["properties"].get(key, None) for key in all_keys}
                    base_data["changeArea"] = change_area_key 
                    if change_area_key == "ADDAREA" or change_area_key == "COMMANNAREA" or change_area_key == "OUTAREA":
                        base_data["F_KHASRA"] = KHASRA_NO
                    elif change_area_key == "SUBAREA":
                        base_data["F_KHASRA"] = None
                    if isinstance(geom, MultiPolygon):
                        for poly in geom.geoms:
                            rows.append({**base_data, "geometry": poly})
                    elif isinstance(geom, Polygon):
                        rows.append({**base_data, "geometry": geom})
            for row in rows:
                if "geometry" not in row:
                    print("Missing geometry in row:", row)


            # geojson = {
            #         "type": "FeatureCollection",
            #          "features": [
            #             {
            #             "type": "Feature",
            #             "geometry": mapping(row["geometry"]),
            #             "properties": {k: v for k, v in row.items() if k != "geometry"}
            #                  }
            #                     for row in rows
            #                         ]
            #                         }
            # return Response({"Darta":geojson})
            # return Response({"dffdf":rows})
            gdf = gpd.GeoDataFrame(rows, crs=gdf_orignal.crs, geometry='geometry') 
            output_path = os.path.join(settings.MEDIA_ROOT, 'poly_intersect_file', 'change_areas.shp')
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            gdf.to_file(output_path)
            print(f"Shapefile saved at: {output_path}")
            geojson_data_UNION = json.loads(gdf.to_json())
            geojson_data_UNION["crs"] = {
                    "type": "name",
                    "properties": {
                        "name": str(gdf.crs)
                             }
                            }
            # geojson_string_data_union = json.dumps(geojson_data_UNION)
            # return Response({"geojson_data_UNION":geojson_data_UNION, "ADDAREA": ADDAREA,"ORIGNAL":ORIGNAL,"FIELD":FIELD, "COMMANNAREA":COMMANNAREA, "SUBAREA":SUBAREA, "OUTAREA":OUTAREA, "num_intersections": num_intersections, "KHASRA_NO": KHASRA_NO}, status=status.HTTP_200_OK)
            return Response({"geojson_data_UNION":geojson_data_UNION, "KHASRA_NO": KHASRA_NO}, status=status.HTTP_200_OK)
            # else:
                    







            

















            intersection = target_geometry_orignal.intersection(target_geometry_field)
            poly_difference1 = target_geometry_orignal.difference(target_geometry_field)  # Remaining part of poly1
            poly_difference2 = target_geometry_field.difference(target_geometry_orignal)  # Remaining part of poly2

            # eojson1 = poly_difference1.__geo_interface__
            # geojson2 = poly_difference2.__geo_interface__
            
            orignal_not_intersect = mapping(poly_difference1)  # This is a dict now
            field_not_intersect = mapping(poly_difference2)
            intersection_json = mapping(intersection)

            geojson_orignal = mapping(target_geometry_orignal)
            geojson_field = mapping(target_geometry_field)
            return Response({"KHASRA_NO": "KHASRA_NO", "orignal_not_intersect": orignal_not_intersect, "field_not_intersect": field_not_intersect, "intersection_json":intersection_json, "geojson_orignal":geojson_orignal, "geojson_field":geojson_field}, status=status.HTTP_200_OK)





