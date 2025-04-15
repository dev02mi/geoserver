from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Polygon
# from rest_framework_gis.serializers import GeoFeatureModelListSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from django.core.files.base import ContentFile
# from django.core.files.base import ContentFile
from .models import *
# from base64.fields import Base64ImageField

class FileField(serializers.FileField):
    def to_internal_value(self, data):
        # If the input data is a file-like object, return it directly
        if hasattr(data, 'read') and hasattr(data, 'seek'):
            return data

        # Otherwise, delegate to the parent class for further processing
        return super().to_internal_value(data)
class MarsBandInformationSerializer(serializers.ModelSerializer):
    DATACODE = serializers.CharField(max_length=10, required=False)
    class Meta:
        model = MarsBandInformation
        fields = ['DATACODE', 'BAND_NAME', 'BAND_S_SPEC', 'BAND_E_SPEC']


class MarsMainTableDataSerializer(GeoFeatureModelSerializer):
    zipinfo = serializers.CharField(max_length=10, required=False)
    DATACODE = serializers.CharField(max_length=10, required=False)
    
    IMG_PREVIEW = FileField(required=False)
    marsbandinformation_set = MarsBandInformationSerializer(required=True, many=True)
    class Meta:
        model = MarsMainTableData
        geo_field = "geometry_shape"
        fields = '__all__'
    
    def validate(self, data):
        band_info_data = data.get('marsbandinformation_set')
        if not band_info_data:
            raise ValidationError("Marsbandinformation_set  cannot be empty.")
        return data

    def create(self, validated_data): 
        band_info_data = validated_data.pop('marsbandinformation_set', [])           
        img_preview = validated_data.pop('IMG_PREVIEW', None)
        if img_preview:
            img_data = img_preview.read()
            img_name = validated_data['DQLNAME']
            validated_data['IMG_PREVIEW'] = ContentFile(img_data, name=img_name)
        if 'DATACODE' not in validated_data or validated_data["DATACODE"]==None:
            last_instance = MarsMainTableData.objects.all().order_by('-DATACODE').first()
            if last_instance:
                last_code = int(last_instance.DATACODE)
                new_code = str(last_code + 1).zfill(6)  
            else:
                new_code = '000001'  
            validated_data['DATACODE'] = new_code
        with transaction.atomic():
            try:
                instance = MarsMainTableData.objects.create(**validated_data)
                for band_info in band_info_data:
                    MarsBandInformation.objects.create(DATACODE=instance, **band_info)
            except Exception as e:
                return Response({'message': 'Something Wrong Please Submite form Onece', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return instance

class zipinfoseraliser(GeoFeatureModelSerializer):
    zip_code = serializers.CharField(max_length=10, required=False)
    zipinfo_set = MarsMainTableDataSerializer(required=True, many=True)
    class Meta:
        model = zipinfo
        geo_field = "comman_area_shape"
        fields = '__all__'

    def validate(self, data):
        band_info_data = data.get('zipinfo_set')
        if not band_info_data:
            raise ValidationError("zipinfo_set  cannot be empty.")
        return data
    
    def create(self, validated_data): 
        zipinfo_set_var = validated_data.pop('zipinfo_set', [])          
        if 'zip_code' not in validated_data or validated_data["zip_code"]==None:
            last_instance = zipinfo.objects.all().order_by('-zip_code').first()
            if last_instance:
                last_code = int(last_instance.zip_code)
                new_code = str(last_code + 1).zfill(6)  
            else:
                new_code = '000001'  
            validated_data['zip_code'] = new_code
        with transaction.atomic():
            try:
                instance = zipinfo.objects.create(**validated_data)
                for main_info in zipinfo_set_var:
                    try:
                        band_info_data = main_info.pop('marsbandinformation_set', [])
                        img_preview = main_info.pop('IMG_PREVIEW', None)
                        if img_preview:
                            img_data = img_preview.read()
                            img_name = main_info['DQLNAME']
                            main_info['IMG_PREVIEW'] = ContentFile(img_data, name=img_name)
                        if 'DATACODE' not in main_info or main_info["DATACODE"]==None:
                            last_instance = MarsMainTableData.objects.all().order_by('-DATACODE').first()
                            if last_instance:
                                last_code = int(last_instance.DATACODE)
                                new_code = str(last_code + 1).zfill(6)  
                            else:
                                new_code = '000001'  
                            main_info['DATACODE'] = new_code
                        valid_keys = [field.name for field in MarsMainTableData._meta.fields]
                        filtered_author_data = {k: v for k, v in main_info.items() if k in valid_keys}
                        instance_2 = MarsMainTableData.objects.create(zipinfo=instance, **filtered_author_data)
                        for band_info in band_info_data:
                            MarsBandInformation.objects.create(DATACODE=instance_2, **band_info)
                    except Exception as e:
                        return Response({"Message": str(e)})
            except Exception as e:
                return Response({'message': 'Something Wrong Please Submite form Onece', "errror": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return instance







# https://github.com/openwisp/django-rest-framework-gis/blob/master/README.rst

