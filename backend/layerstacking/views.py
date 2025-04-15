from django.shortcuts import render,redirect, HttpResponse
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.response import Response 
from rest_framework import status
import rasterio
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

# Create your views here.

def home(request):
    return render(request, 'archival/home.html')

# @api_view(['POST','GET'])
# def LayerStacking(request):
#     if request.method == 'POST':
#         filepath = request.FILES.getlist('file')

#         import rasterio
#         band_names = filepath.descriptions

#         print("👍💕👍",filepath)
#         print(f'The image bands are named: {", ".join(band_names)}')

#     else:
#         return Response({""})

@api_view(['POST', 'GET'])
def LayerStacking(request):
    if request.method == 'POST':
        files = request.FILES.getlist('file')
        if not files:
            return Response({'error': 'No files uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        band_names = []
        # global file_paths  # Use global to access and update the file_paths list
        
        for file in files:
            print("files🤔",file)
            # Save the file to a temporary location
            file_name = default_storage.save(file.name, ContentFile(file.read()))
            file_path = default_storage.path(file_name)
            # file_paths.append(file_path)

            try:
                with rasterio.open(file_path) as src:
                    # Print metadata for debugging
                    # print(f"Metadata for {file.name}:")
                    # print("MetaData: ",src.meta)
                    # print("TagData: ",src.tags())
                    data_type = src.meta['dtype']
                    # print("DATA_TYPE:", data_type)

                    # Attempt to get band descriptions
                    descriptions = src.descriptions
                    if descriptions is None or all(desc is None for desc in descriptions):
                        # If no descriptions, generate default names
                        # descriptions = [f'Band {i+1}' for i in range(src.count)]
                        descriptions = [f'{i+1}' for i in range(src.count)]
                    else:
                        # Replace None descriptions with 'Unknown Band'
                        descriptions = [desc if desc is not None else 'Unknown Band' for desc in descriptions]

                    band_names.extend(descriptions)
            except rasterio.errors.RasterioIOError as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            # finally:
            #     # Clean up the saved file
            #     if default_storage.exists(file_name):
            #         default_storage.delete(file_name)

        print("Files uploaded:", files)
        print(f'The image bands are named: {", ".join(band_names)}')

        return Response({'band_names': band_names,'data_Type': data_type}, status=status.HTTP_200_OK)

    return Response({'message': 'Send a POST request with TIFF files to get their band names.'})



@api_view(['POST'])
def stack_bands(request):
    if request.method == 'POST':
        selected_bands = request.data.get('selected_bands', [])
        print(selected_bands)

        # Strip extra text (like (1)) from filenames
        cleaned_files = [filename.split(' ')[0] for filename in selected_bands]
        print("Cleaned Files:", cleaned_files)

        # Split bands from filenames
        cleaned_bands = [filename.split('(')[-1].split(')')[0] for filename in selected_bands]
        print("Cleaned bands:", cleaned_bands)
        
        # Convert strings to integers using list comprehension and int() function
        cleaned_bands_int = [int(band_str) for band_str in cleaned_bands]
        print("Cleaned bands as integers:", cleaned_bands_int)

        directory = os.path.normpath(settings.MEDIA_ROOT).replace("\\", "/")
        
        output_directory = request.data.get('outputSavePath')
        
         # Check if output directory is provided and not empty
        if not output_directory:
            return Response({'error': 'Output directory path is required and cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        print(output_directory)

        file_paths = [os.path.join(directory, filename) for filename in cleaned_files]

        # Verify that all files exist before proceeding
        for file_path in file_paths:
            if not os.path.exists(file_path):
                return JsonResponse({'error': f'File {file_path} does not exist in the directory'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read metadata from the first file to set up the output file
            with rasterio.open(file_paths[0]) as src0:
                meta = src0.meta

            # Update meta to reflect the number of layers
            meta.update(count=len(file_paths))

            output_file = os.path.join(output_directory, 'stacked_image.tif') # OutPut file path

            with rasterio.open(output_file, 'w', **meta) as dst:
                for id, file_path in enumerate(file_paths, start=1):
                    with rasterio.open(file_path) as src1:
                        dst.write_band(id, src1.read(1))

            return JsonResponse({'message': 'Bands stacked successfully', 'output_file': output_file}, status=status.HTTP_200_OK)
        
        except rasterio.errors.RasterioIOError as e:
            return JsonResponse({'error': f'Error processing files: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        finally:
            # Clean up the saved files
            for file_path in file_paths:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
 
            # Clear the global file_paths list
            file_paths.clear()


    return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

