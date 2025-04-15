from rest_framework import serializers
from .models import *

class WCProjectInformationAndInputsSerializer(serializers.ModelSerializer):
    PROJECT_ID = serializers.CharField(read_only=True)
    PROJECT_NAME = serializers.CharField(required=True)
    CREATED_BY = serializers.CharField(required=True)
    CLIENT_ORGANIZATION  = serializers.CharField(required=True)
    EXECUTED_ORGANIZATION = serializers.CharField(required=True)

    class Meta:
        model = WCProjectInformationAndInputs
        fields = '__all__'

        extra_kwargs = {
            'CREATED_BY': {'required': False, 'allow_null': True, 'allow_blank': True},
            'PROJECT_DESCRIPTION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'CROPPING_YEAR': {'required': False, 'allow_null': True, 'allow_blank': True},
            'CROPPING_SEASON': {'required': False, 'allow_null': True, 'allow_blank': True},
            'AREA_INFORMATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            
            # INPUTS DATA
            'AREA_OF_INTEREST': {'required': False, 'allow_null': True, 'allow_blank': True},
            'GROUND_TRUTH': {'required': False, 'allow_null': True, 'allow_blank': True},
            'GIS_MASK_BASEMAP': {'required': False, 'allow_null': True, 'allow_blank': True},
            'WEATHER_DATA': {'required': False, 'allow_null': True, 'allow_blank': True},
            'HISTORICAL_DATA': {'required': False, 'allow_null': True, 'allow_blank': True},
        
        }


    def create(self, validated_data):
        return WCProjectInformationAndInputs.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # PROJECT INFORMATION DATA
        instance.PROJECT_NAME = validated_data.get('PROJECT_NAME', instance.PROJECT_NAME)
        instance.CREATED_BY = validated_data.get('CREATED_BY', instance.CREATED_BY)
        instance.PROJECT_DESCRIPTION = validated_data.get('PROJECT_DESCRIPTION', instance.PROJECT_DESCRIPTION)
        instance.CLIENT_ORGANIZATION = validated_data.get('CLIENT_ORGANIZATION', instance.CLIENT_ORGANIZATION)
        instance.EXECUTED_ORGANIZATION = validated_data.get('EXECUTED_ORGANIZATION', instance.EXECUTED_ORGANIZATION)
        instance.CROPPING_YEAR = validated_data.get('CROPPING_YEAR', instance.CROPPING_YEAR)
        instance.CROPPING_SEASON = validated_data.get('CROPPING_SEASON', instance.CROPPING_SEASON)
        instance.AREA_INFORMATION = validated_data.get('AREA_INFORMATION', instance.AREA_INFORMATION)
        
        # PROJECT INPUTS DATA
        instance.WORKSPACE_LOCATION = validated_data.get('WORKSPACE_LOCATION', instance.WORKSPACE_LOCATION)
        instance.PROJECT_FOLDER = validated_data.get('PROJECT_FOLDER', instance.PROJECT_FOLDER)
        instance.PROJECT_INFORMATION = validated_data.get('PROJECT_INFORMATION', instance.PROJECT_INFORMATION)
        instance.AREA_OF_INTEREST = validated_data.get('AREA_OF_INTEREST', instance.AREA_OF_INTEREST)
        instance.GROUND_TRUTH = validated_data.get('GROUND_TRUTH', instance.GROUND_TRUTH)
        instance.GIS_MASK_BASEMAP = validated_data.get('GIS_MASK_BASEMAP', instance.GIS_MASK_BASEMAP)
        instance.SATELLITE_DATA = validated_data.get('SATELLITE_DATA', instance.SATELLITE_DATA)
        instance.WEATHER_DATA = validated_data.get('WEATHER_DATA', instance.WEATHER_DATA)
        instance.HISTORICAL_DATA = validated_data.get('HISTORICAL_DATA', instance.HISTORICAL_DATA)
        
        
        instance.save()
        return instance


class WCProjectManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WCProjectManagement
        fields = '__all__'  # Include all fields from the ProjectManagement model
        
        extra_kwargs = {
            'STACKING': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UNSUPERVISED_CLASSIFICATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'SUPERVISED_CLASSIFICATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'RECODE_CLUMP_ELIMINATE': {'required': False, 'allow_null': True, 'allow_blank': True},
            'ANALYSIS': {'required': False, 'allow_null': True, 'allow_blank': True},
            'STATISTICS': {'required': False, 'allow_null': True, 'allow_blank': True},
        }
        
    def create(self, validated_data):
    # Custom create logic if necessary
        return WCProjectManagement.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Custom update logic if necessary
        instance.PROJECT_ID = validated_data.get('PROJECT_ID', instance.PROJECT_ID)
        instance.ADMIN_USER = validated_data.get('ADMIN_USER', instance.ADMIN_USER)
        instance.WORK_ASSIGN_USER = validated_data.get('WORK_ASSIGN_USER', instance.UU_USER)
        instance.STACKING = validated_data.get('STACKING', instance.STACKING)
        instance.UNSUPERVISED_CLASSIFICATION = validated_data.get('UNSUPERVISED_CLASSIFICATION', instance.UNSUPERVISED_CLASSIFICATION)
        instance.SUPERVISED_CLASSIFICATION = validated_data.get('SUPERVISED_CLASSIFICATION', instance.SUPERVISED_CLASSIFICATION)
        instance.RECODE_CLUMP_ELIMINATE = validated_data.get('RECODE_CLUMP_ELIMINATE', instance.RECODE_CLUMP_ELIMINATE)
        instance.ANALYSIS = validated_data.get('ANALYSIS', instance.ANALYSIS)
        instance.STATISTICS = validated_data.get('STATISTICS', instance.STATISTICS)
        instance.save()
        return instance



# class CombinedProjectDataSerializer(serializers.Serializer):
#     WC_project_information_Input = WCProjectInformationAndInputsSerializer()
#     # WC_project_inputs = WCProjectsInputsSerializer()
#     WC_project_management = WCProjectManagementSerializer(many=True)

# __________________________________USER DEPARTMENT DATA_________________________________________________

# UD PROJECT INFORMATION & INPUTS DATA

class UDProjectInformationAndInputsSerializer(serializers.ModelSerializer):
    UDPROJECT_ID = serializers.CharField(read_only=True)
    UDPROJECT_NAME = serializers.CharField(required=True)
    UDCREATED_BY = serializers.CharField(required=True)
    UDCLIENT_ORGANIZATION  = serializers.CharField(required=True)
    UDEXECUTED_ORGANIZATION = serializers.CharField(required=True)

    class Meta:
        model = UDProjectInformationAndInputs
        fields = '__all__'

        extra_kwargs = {
            'UDCREATED_BY': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDPROJECT_DESCRIPTION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDCROPPING_YEAR': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDCROPPING_SEASON': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDAREA_INFORMATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            
            # INPUTS DATA
            'UDAREA_OF_INTEREST': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDGROUND_TRUTH': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDGIS_MASK_BASEMAP': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDWEATHER_DATA': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UDHISTORICAL_DATA': {'required': False, 'allow_null': True, 'allow_blank': True},
        
        }


    def create(self, validated_data):
        return UDProjectInformationAndInputs.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # PROJECT INFORMATION DATA
        instance.UDPROJECT_NAME = validated_data.get('UDPROJECT_NAME', instance.UDPROJECT_NAME)
        instance.UDCREATED_BY = validated_data.get('UDCREATED_BY', instance.UDCREATED_BY)
        instance.UDPROJECT_DESCRIPTION = validated_data.get('UDPROJECT_DESCRIPTION', instance.UDPROJECT_DESCRIPTION)
        instance.UDCLIENT_ORGANIZATION = validated_data.get('UDCLIENT_ORGANIZATION', instance.UDCLIENT_ORGANIZATION)
        instance.UDEXECUTED_ORGANIZATION = validated_data.get('UDEXECUTED_ORGANIZATION', instance.UDEXECUTED_ORGANIZATION)
        instance.UDCROPPING_YEAR = validated_data.get('UDCROPPING_YEAR', instance.UDCROPPING_YEAR)
        instance.UDCROPPING_SEASON = validated_data.get('UDCROPPING_SEASON', instance.UDCROPPING_SEASON)
        instance.UDAREA_INFORMATION = validated_data.get('UDAREA_INFORMATION', instance.UDAREA_INFORMATION)
        
        # PROJECT INPUTS DATA
        instance.UDWORKSPACE_LOCATION = validated_data.get('UDWORKSPACE_LOCATION', instance.UDWORKSPACE_LOCATION)
        instance.UDPROJECT_FOLDER = validated_data.get('UDPROJECT_FOLDER', instance.UDPROJECT_FOLDER)
        instance.UDPROJECT_INFORMATION = validated_data.get('UDPROJECT_INFORMATION', instance.UDPROJECT_INFORMATION)
        instance.UDAREA_OF_INTEREST = validated_data.get('UDAREA_OF_INTEREST', instance.UDAREA_OF_INTEREST)
        instance.UDGROUND_TRUTH = validated_data.get('UDGROUND_TRUTH', instance.UDGROUND_TRUTH)
        instance.UDGIS_MASK_BASEMAP = validated_data.get('UDGIS_MASK_BASEMAP', instance.UDGIS_MASK_BASEMAP)
        instance.UDSATELLITE_DATA = validated_data.get('UDSATELLITE_DATA', instance.UDSATELLITE_DATA)
        instance.UDWEATHER_DATA = validated_data.get('UDWEATHER_DATA', instance.UDWEATHER_DATA)
        instance.UDHISTORICAL_DATA = validated_data.get('UDHISTORICAL_DATA', instance.UDHISTORICAL_DATA)
        
        
        instance.save()
        return instance


# UD PROJECT MANAGEMENT DATA

class UDProjectManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UDProjectManagement
        fields = '__all__'  # Include all fields from the ProjectManagement model
        
        extra_kwargs = {
            'UD_STACKING': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UD_UNSUPERVISED_CLASSIFICATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UD_SUPERVISED_CLASSIFICATION': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UD_RECODE_CLUMP_ELIMINATE': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UD_ANALYSIS': {'required': False, 'allow_null': True, 'allow_blank': True},
            'UD_STATISTICS': {'required': False, 'allow_null': True, 'allow_blank': True},
        }
        
    def create(self, validated_data):
    # Custom create logic if necessary
        return UDProjectManagement.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Custom update logic if necessary
        instance.UD_PROJECT_ID = validated_data.get('UD_PROJECT_ID', instance.UD_PROJECT_ID)
        instance.UD_ADMIN_USER = validated_data.get('UD_ADMIN_USER', instance.UD_ADMIN_USER)
        instance.UD_WORK_ASSIGN_USER = validated_data.get('UD_WORK_ASSIGN_USER', instance.UD_UU_USER)
        instance.UD_STACKING = validated_data.get('UD_STACKING', instance.UD_STACKING)
        instance.UD_UNSUPERVISED_CLASSIFICATION = validated_data.get('UD_UNSUPERVISED_CLASSIFICATION', instance.UD_UNSUPERVISED_CLASSIFICATION)
        instance.UD_SUPERVISED_CLASSIFICATION = validated_data.get('UD_SUPERVISED_CLASSIFICATION', instance.UD_SUPERVISED_CLASSIFICATION)
        instance.UD_RECODE_CLUMP_ELIMINATE = validated_data.get('UD_RECODE_CLUMP_ELIMINATE', instance.UD_RECODE_CLUMP_ELIMINATE)
        instance.UD_ANALYSIS = validated_data.get('UD_ANALYSIS', instance.UD_ANALYSIS)
        instance.UD_STATISTICS = validated_data.get('UD_STATISTICS', instance.UD_STATISTICS)
        instance.save()
        return instance


# class CombinedProjectDataSerializer(serializers.Serializer):
#     WC_project_information_Input = WCProjectInformationAndInputsSerializer()
#     # WC_project_inputs = WCProjectsInputsSerializer()
#     WC_project_management = WCProjectManagementSerializer(many=True)


