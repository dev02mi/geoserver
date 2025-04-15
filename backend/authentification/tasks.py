from celery import shared_task, states
import os, io
from django.conf import settings
import asyncio
from channels.layers import get_channel_layer
import shutil
import base64
import networkx as nx
from asgiref.sync import async_to_sync, sync_to_async
import json
from shapely.geometry import Polygon, LineString, MultiLineString, Point
from time import sleep
import tempfile
from asgiref.sync import async_to_sync
import zipfile
from celery import current_task
import numpy as np
import pandas as pd

import geopandas as gpd
import redis
@shared_task
def sub(x,y):
    sleep(20)
    return x - y

@shared_task
def clear_session_cache(id):
    # sleep(5)
    print(f"Session Cache Cleared: {id}")
    return id

def extract_zip_file(zip_file, temp_dir):
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        return zip_ref.namelist()



redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
@shared_task
def  auderela_file_unzip(zip_file):
    print("FFFFFFFFFFFFF")
    task_id = current_task.request.id
    print("Task ID:", task_id)
    print("Sending message to WebSocket channel", zip_file.get('sessionid'))
    with tempfile.TemporaryDirectory() as temp_dir:
        # file = json.loads(zip_file)
        if isinstance(zip_file, dict):
            file_content = zip_file.get('doc_file')
            if not file_content:
                return {"status": "error", "message": "No file content found."}
            
            # if file_content:
            #     # Decode the file content if it's Base64 encoded
                
            #     decoded_file = base64.b64decode(file_content)
            decoded_file = base64.b64decode(file_content)
        extracted_files = extract_zip_file(io.BytesIO(decoded_file), temp_dir)
        required_files = ['.shp',".shx", '.dbf','.prj']
        base_filenames = set(os.path.splitext(f)[0] for f in extracted_files)
        for base_name in base_filenames:
            required_files = [f"{base_name}{ext}" for ext in required_files]

        hapefile_files_1 = [
                os.path.join(temp_dir, f)
                for f in extracted_files if any(f.endswith(ext) for ext in required_files)
                ]
        shapefile_files = sorted(
                hapefile_files_1,
                key=lambda f: required_files.index(next(ext for ext in required_files if f.endswith(ext)))
                )
        print("extracted_files", extracted_files)
        print("shapefile_files", shapefile_files)

        media_dir = os.path.join(settings.MEDIA_ROOT, "shapefiles")  # Change "shapefiles" as needed
        os.makedirs(media_dir, exist_ok=True)

        for file_path in shapefile_files:
            filename = os.path.basename(file_path)
            new_filename = f"{task_id}_{filename}"  # Add task ID as prefix
            dest_path = os.path.join(media_dir, new_filename)
            shutil.copy(file_path, dest_path)  # Copy to media directory
            print(f"✅ Saved {new_filename} to {dest_path}")

        geojson_data = None
        if any(f.endswith('.shp') for f in extracted_files):
            shp_file = next(f for f in shapefile_files if f.endswith('.shp'))
            gdf = gpd.read_file(shp_file)
            multilines = gdf[gdf.geometry.geom_type == "MultiLineString"]
            poly = gdf[gdf.geometry.geom_type == "Polygon"]
            gdf["FID"] = gdf.index
            gdf["AUD_ERR"] = 0 
            print("multilines________________________________", multilines)
            if not multilines.empty:
                 # Default value
                gdf.loc[gdf.geometry.geom_type == "MultiLineString", "AUD_ERR"] = 9
            elif not poly.empty:
                pass
            else:
                # pass
                print("_____________________________________________enter")
                
                gdf["FIRSTPOINT"] = gdf.geometry.apply(lambda x: x.coords[0])
                gdf["LASTPOINT"] = gdf.geometry.apply(lambda x: x.coords[-1])
                tuple_to_number = {}
                def assign_numbering(tuples_list):
    # Dictionary to store unique tuples and their assigned numbers ttf://OpenSymbol#0x2227
                    if not tuple_to_number:
                        current_number = 1
                    else:
                        current_number = max(tuple_to_number.values()) + 1
                    # current_number = max(list(tuple_to_number.values())) + 1  shape://oarrow
                    # List to store the resulting numbering
                    numbering = []

                    for t in tuples_list:
                        # If tuple is already in the dictionary, reuse the number
                        if t in tuple_to_number:
                            numbering.append(tuple_to_number[t])
                        else:
                            # Assign new number to the unique tuple and increment the current_number
                            tuple_to_number[t] = current_number
                            numbering.append(current_number)
                            current_number += 1

                    return numbering

                gdf["AUD_FNODE"] = assign_numbering(gdf["FIRSTPOINT"].tolist())
                gdf["AUD_TNODE"] = assign_numbering(gdf["LASTPOINT"].tolist())
                # max_value = gdf[['AUD_FNODE', 'AUD_TNODE']].values.max()

                def create_undirected_graph(edges):
                    graph = {}
                    for edge in edges:
                        node1, node2 = edge
                        if node1 not in graph:
                            graph[node1] = []
                        if node2 not in graph:
                            graph[node2] = []
                        graph[node1].append(node2)
                        graph[node2].append(node1)
                    return graph
                list_of_lists = gdf[['AUD_FNODE', 'AUD_TNODE']].values.tolist()
                graph = create_undirected_graph(list_of_lists)

                node_dict = {}
                max_value = 0
# Iterate over rows and assign unique indices
                for idx, row in gdf.iterrows():
                    nodes = [row['AUD_FNODE'], row['AUD_TNODE']]
        
                    for node in nodes:
                        if node not in node_dict:  # Assign only if not exists
                            if max_value < node:
                                max_value = node
                            node_dict[node] = idx

                graph_1 = nx.Graph()
                graph_1.add_edges_from(list_of_lists)
                cycles = nx.cycle_basis(graph_1)
                print("Detected Cycles:", cycles)
                nodes_in_loops = set(node for cycle in cycles for node in cycle)
                print("Nodes forming loops:", nodes_in_loops)
                if nodes_in_loops:
                    gdf.loc[gdf['AUD_FNODE'].isin(nodes_in_loops) & gdf['AUD_TNODE'].isin(nodes_in_loops), "AUD_ERR"] = 4
                    # for node in nodes_in_loops:
                    #     index_value = node_dict.get(node, None)
                    #     gdf.at[index_value, "AUD_ERR"] = 4
                    #     print("ADDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDNNNNNNNNNNNNNNNNNNNNNNNN")
                    print("___________________OK______________________________________________________")
                else:
                    def count_link_path(graph):   #groping lines connected
                        visited = set()
                        index = 0
                        list_connecting_node_new = []
                        def dfs(node):
            # nonlocal list_connecting_node_new
                            if node  in visited:
                                return []
                            visited.add(node)
                            list_group = [node]
                            for neb in graph[node]:
                                list_group += dfs(neb)
                # list_connecting_node_new = ensure_index(list_connecting_node_new, index)
                # list_connecting_node_new[index].append(node)
                            return list_group

                        for node in graph:
                            if node not in visited:
                                list_connecting_node_new.append(dfs(node))
                # if len(groping_list) >= 1:
                # list_connecting_node_new.append(groping_list)
                                index += 1
                        return list_connecting_node_new, index
                    
                    xc = count_link_path(graph)
                    def preprocess(arrays):
                        hashmap = {}
                        for i, subarray in enumerate(arrays):
                            for num in subarray:
                                hashmap[num] = i + 1 # Store index and array
                        return hashmap

                    hashmap = preprocess(xc[0])

                    graph_group_obj = {
                        "graph": graph,
                        # "group": xc[0]
                    }

                    geojson_graph = json.dumps(graph_group_obj)
                    redis_client.set(f"{task_id}_geojson_graph_gp", geojson_graph)

                    print("__________________________START__________________________________________",xc[1])
                    # print("HashMap:___________", hashmap.values())
                    gdf["AUD_GRP"] = gdf.apply(lambda row: hashmap.get(row["AUD_FNODE"], -1), axis=1)
                    print("_______________________OK____________________________________________")
                    # gdf["AUD_GRP"] = gdf.apply(lambda row: next((i for i, sublist in enumerate(xc[0]) if row["AUD_FNODE"] in sublist or row["AUD_TNODE"] in sublist), -1),axis=1)
                    # gdf.to_file("modified_shapefile.shp")
                    print("Current columns in gdf:________________", gdf.columns)





                    

                    def add_row_new_dataframe(num):
                        index_value = node_dict.get(num, None)
                        if index_value is None or not isinstance(index_value, int) or not (0 <= index_value < len(gdf)):
                            print(f"⚠️ Warning: Invalid or missing index for NODEID={num}")
                            return {"NODEID": num, "x_cord": None, "y_cord": None, "LI_LINK_IDS": None, 
                                        "geometry": None, "AUD_ERR": None, "AUD_GRP": None}
                        
                        row = gdf.iloc[index_value]

                        if not isinstance(row, (pd.Series, gpd.GeoSeries)):
                            print(f"❌ Error: Row extraction failed for NODEID={num}")
                            return None
                        
                        poin_geom = row.FIRSTPOINT if row.AUD_FNODE == num else row.LASTPOINT

                        aud_err_value = len(graph.get(num, []))  #sum of the node 3
                        aud_err_label = {1: 1, 2: 2, 3: 0}.get(aud_err_value, 3)  # aud_err_value  key according to get value
                        dict_row = {
                                    "NODEID": num,
                                    "x_cord": poin_geom[0],
                                    "y_cord": poin_geom[1],  # ✅ Fixed missing y_cord
                                    "LI_LINKIDS": row.FID,
                                    "geometry": Point(poin_geom),
                                    "AUD_GRP": row.AUD_GRP,
                                    "AUD_ERR": aud_err_label
                                    }       

                        return dict_row


                    


                    all_rows = []
                    for i in range(1, max_value+1): #numbering start from 1,2,3,4
                        all_rows.append(add_row_new_dataframe(i))
                    new_point_gdf = gpd.GeoDataFrame(all_rows, geometry='geometry')
                    new_point_gdf["FID"] = new_point_gdf.index
                    geojson_data_point = json.loads(new_point_gdf.to_json())
                    # gdf["new_point_gdf"] = gdf.index
                    
                    geojson_data_point["crs"] = {
                        "type": "name",
                        "properties": {
                            "name": str(gdf.crs)
                                }
                                }
                    geojson_string_point = json.dumps(geojson_data_point)
                    print("geojson_string_point_____________________________________________________________________________________________________")
                    CHUNK_SIZE = 10 * 1024 * 1024
                    # redis_client.set(task_id, geojson_string)
                    chunks = [geojson_string_point[i:i + CHUNK_SIZE] for i in range(0, len(geojson_string_point), CHUNK_SIZE)]
                    for i, chunk in enumerate(chunks):
                        redis_client.set(f"{task_id}_POINT:{i}", chunk)
                    redis_client.set(f"{task_id}_POINT:count", len(chunks))
                    print("compleet_____________________________________________________________________________________________________")



                
                
            print("gdffffffCRSSSSSSS", gdf.crs.to_epsg())  #EPSG:4326
            geojson_data = json.loads(gdf.to_json())  # Convert to GeoJSON
            
            # print("Sample GeoJSON Output:", json.dumps(geojson_data, indent=2)[:1000])

            geojson_data["crs"] = {
                    "type": "name",
                    "properties": {
                        "name": str(gdf.crs)
                             }
                            }
            
            geojson_string = json.dumps(geojson_data)
            

            print("geojson_string_____________________________________________________________________________________________________")
            CHUNK_SIZE = 10 * 1024 * 1024
            # redis_client.set(task_id, geojson_string)
            chunks = [geojson_string[i:i + CHUNK_SIZE] for i in range(0, len(geojson_string), CHUNK_SIZE)]
            for i, chunk in enumerate(chunks):
                redis_client.set(f"{task_id}:{i}", chunk)
            redis_client.set(f"{task_id}:count", len(chunks))
            print("compleet_____________________________________________________________________________________________________")

            
            
            
        # update_state(state=states.SUCCESS, meta={"task_id": task_id, "status": "Completed"})
        # print(f"✅ Task {task_id} result stored in Redis")

        # sleep(10)
        
        sessionid = zip_file.get('sessionid')
        if sessionid:
        # channel_layer = get_channel_layer()  # Get the channel layer (WebSocket messaging system) shapefile.crs
        # message = {'type': 'send_my_data', 'text': 'Operation done!'}  # Message to send
        # # Send the message to the WebSocket channel
        
        # channel_layer.send(zip_file.get('sessionid'), message)
        # print("Message sent to WebSocket channel")

            channel_layer = get_channel_layer()
            print("layer_________________________________________________________________________________________________", channel_layer)
            # loop = asyncio.get_event_loop()
            # asyncio.set_event_loop(loop)
            message = {'type': 'chat.message', 'text': 'Operation done!'}
        
        # Send the message to the group (sessionid group)
            try:
                async_to_sync(channel_layer.group_send)(
                    sessionid, 
                    {"type": "chat.message", "message": "Celery File processing completed!", "task_key": task_id}
                )
                print(f"✅ WebSocket message sent to group {sessionid}")
            except Exception as e:
                print(f"❌ Error sending message: {e}")

        return  True  #geojson_string
        #     print(f"Message sent to WebSocket for session {sessionid}")
        # else:
        #     print("Session ID not found. No message sent.")
        
        # return True
  











































































@shared_task
def  sss____auderela_file_unzip( zip_file):
    print("FFFFFFFFFFFFF")
    task_id = current_task.request.id
    print("Task ID:", task_id)
    print("Sending message to WebSocket channel", zip_file.get('sessionid'))
    with tempfile.TemporaryDirectory() as temp_dir:
        # file = json.loads(zip_file)
        if isinstance(zip_file, dict):
            file_content = zip_file.get('doc_file')
            if not file_content:
                return {"status": "error", "message": "No file content found."}
            
            # if file_content:
            #     # Decode the file content if it's Base64 encoded
                
            #     decoded_file = base64.b64decode(file_content)
            decoded_file = base64.b64decode(file_content)
        extracted_files = extract_zip_file(io.BytesIO(decoded_file), temp_dir)
        required_files = ['.shp',".shx", '.dbf','.prj']
        base_filenames = set(os.path.splitext(f)[0] for f in extracted_files)
        for base_name in base_filenames:
            required_files = [f"{base_name}{ext}" for ext in required_files]

        hapefile_files_1 = [
                os.path.join(temp_dir, f)
                for f in extracted_files if any(f.endswith(ext) for ext in required_files)
                ]
        shapefile_files = sorted(
                hapefile_files_1,
                key=lambda f: required_files.index(next(ext for ext in required_files if f.endswith(ext)))
                )
        print("extracted_files", extracted_files)
        print("shapefile_files", shapefile_files)

        media_dir = os.path.join(settings.MEDIA_ROOT, "shapefiles")  # Change "shapefiles" as needed
        os.makedirs(media_dir, exist_ok=True)

        for file_path in shapefile_files:
            filename = os.path.basename(file_path)
            new_filename = f"{task_id}_{filename}"  # Add task ID as prefix
            dest_path = os.path.join(media_dir, new_filename)
            shutil.copy(file_path, dest_path)  # Copy to media directory
            print(f"✅ Saved {new_filename} to {dest_path}")

        geojson_data = None
        if any(f.endswith('.shp') for f in extracted_files):
            shp_file = next(f for f in shapefile_files if f.endswith('.shp'))
            gdf = gpd.read_file(shp_file)
            print("gdffffffCRSSSSSSS", gdf.crs.to_epsg())  #EPSG:4326
            geojson_data = json.loads(gdf.to_json())  # Convert to GeoJSON
            geojson_data["crs"] = {
                    "type": "name",
                    "properties": {
                        "name": str(gdf.crs)
                             }
                            }
            geojson_string = json.dumps(geojson_data)

        # sleep(10)
        
        sessionid = zip_file.get('sessionid')
        if sessionid:
        # channel_layer = get_channel_layer()  # Get the channel layer (WebSocket messaging system) shapefile.crs
        # message = {'type': 'send_my_data', 'text': 'Operation done!'}  # Message to send
        # # Send the message to the WebSocket channel
        
        # channel_layer.send(zip_file.get('sessionid'), message)
        # print("Message sent to WebSocket channel")

            channel_layer = get_channel_layer()
            print("layer", channel_layer)
            # loop = asyncio.get_event_loop()
            # asyncio.set_event_loop(loop)
            message = {'type': 'chat.message', 'text': 'Operation done!'}
        
        # Send the message to the group (sessionid group)
            try:
                # loop.run_until_complete(channel_layer.group_send(sessionid, message))
                async_to_sync(channel_layer.group_send)(sessionid, {"type": "chat.message", "message": "celery File processing completed!", "task_key": task_id})
                print(f"✅ Celery task: Message sent to WebSocket group {sessionid}")
                print(f"Celery task: Message sent to group {sessionid}") # Debug print
            except Exception as e:
                print(f"Celery task: Error sending message: {e}")  # Debug print
        return  geojson_string
        #     print(f"Message sent to WebSocket for session {sessionid}")
        # else:
        #     print("Session ID not found. No message sent.")
        
        # return True
  