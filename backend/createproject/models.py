from django.db import models
from django.db.models import Max
from django.db import transaction

from datetime import date, datetime

# PROJECT INFORMATION & INPUTS DATA
class WCProjectInformationAndInputs(models.Model):
    # *** PROJECT INFORMATION DATA *** #
    PROJECT_ID = models.CharField(max_length=50, unique=True)
    PROJECT_NAME = models.CharField(max_length=50) #FIELD REQUIRED

    CREATION_DATE = models.DateField(auto_now_add=True)
    CREATION_TIME = models.TimeField(auto_now_add=True)

    CREATED_BY = models.CharField(max_length=None, null=True,blank=True)
    PROJECT_DESCRIPTION = models.TextField(max_length=200, blank=True, null=True)
    CLIENT_ORGANIZATION = models.CharField(max_length=50, blank=False) #FIELD REQUIRED
    EXECUTED_ORGANIZATION = models.CharField(max_length=50, blank=False) #FIELD REQUIRED
    CROPPING_YEAR = models.CharField(max_length=None,null=True, blank=True)
    CROPPING_SEASON = models.CharField(max_length=None,null=True, blank=True)
    AREA_INFORMATION = models.TextField(max_length=None, blank=True, null=True)

    # *** Projects Inputs Data *** #

    WORKSPACE_LOCATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    PROJECT_FOLDER = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    PROJECT_INFORMATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED

    # GIS INPUTS FOLDER
    AREA_OF_INTEREST = models.CharField(max_length=None, null=True, blank=True)
    GROUND_TRUTH = models.CharField(max_length=None, null=True, blank=True)
    GIS_MASK_BASEMAP = models.CharField(max_length=None, null=True, blank=True)
    SATELLITE_DATA = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    WEATHER_DATA = models.CharField(max_length=None, null=True, blank=True)
    HISTORICAL_DATA = models.CharField(max_length=None, null=True, blank=True)


    def __str__(self):
        return self.PROJECT_ID

    def save(self, *args, **kwargs):

        if not self.PROJECT_ID:
            with transaction.atomic():
                max_project_id = WCProjectInformationAndInputs.objects.aggregate(max_id=models.Max('PROJECT_ID'))['max_id']
                if max_project_id:
                    max_number = int(max_project_id.replace('AGRI', ''))
                    self.PROJECT_ID = f"AGRI{max_number + 1:04d}"
                else:
                    self.PROJECT_ID = "AGRI0001"
        
        # if not self.CREATION_DATE:
        #     self.CREATION_DATE = date.today()
        # if not self.CREATION_TIME:
        #     self.CREATION_TIME = datetime.now().time()

        super(WCProjectInformationAndInputs, self).save(*args, **kwargs)

    
    # class Meta:
    #     db_table = 'create_project'
    #     ordering = ['-CREATION_DATE']
    #     verbose_name = "Project"
    #     verbose_name_plural = "Projects"
    #     unique_together = ['PROJECT_NAME', 'CREATED_BY']
    #     index_together = ['CLIENT_ORGANIZATION', 'CREATED_BY']


# PROJECTS INPUTS DATA 

# class WCProjectsInputs(models.Model):
#     PROJECT_ID = models.ForeignKey(WCProjectInformation, to_field='PROJECT_ID', on_delete=models.CASCADE, related_name='ProjectInputs')
#     WORKSPACE_LOCATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
#     PROJECT_FOLDER = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
#     PROJECT_INFORMATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED

#     # GIS INPUTS FOLDER
#     AREA_OF_INTEREST = models.CharField(max_length=None, null=True, blank=True)
#     GROUND_TRUTH = models.CharField(max_length=None, null=True, blank=True)
#     GIS_MASK_BASEMAP = models.CharField(max_length=None, null=True, blank=True)
#     SATELLITE_DATA = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
#     WEATHER_DATA = models.CharField(max_length=None, null=True, blank=True)
#     HISTORICAL_DATA = models.CharField(max_length=None, null=True, blank=True)

#     def __str__(self):
#         return self.WORKSPACE_LOCATION

#     class Meta:
#         unique_together = ['PROJECT_ID']
 
 
 
# Project Managements Data

class WCProjectManagement(models.Model):
    PROJECT_ID = models.ForeignKey(WCProjectInformationAndInputs, to_field='PROJECT_ID', on_delete=models.CASCADE, related_name='ProjectManagement')
    ADMIN_USER = models.CharField(max_length=None, blank=False, null=True) #FIELD REQUIRED
    WORK_ASSIGN_USER = models.CharField(max_length=None, null=True, blank=True)
    STACKING = models.CharField(max_length=None, null=True, blank=True)
    UNSUPERVISED_CLASSIFICATION = models.CharField(max_length=None, null=True,blank=True)
    SUPERVISED_CLASSIFICATION = models.CharField(max_length=None, null=True, blank=True)
    RECODE_CLUMP_ELIMINATE = models.CharField(max_length=None, null=True, blank=True)
    ANALYSIS = models.CharField(max_length=None, null=True, blank=True)
    STATISTICS = models.CharField(max_length=None, null=True, blank=True)
 
    def __str__(self):
        return self.ADMIN_USER
 
    def save(self, *args, **kwargs):
        fields_to_check = [
            'WORK_ASSIGN_USER',
            'STACKING',
            'UNSUPERVISED_CLASSIFICATION',
            'SUPERVISED_CLASSIFICATION',
            'RECODE_CLUMP_ELIMINATE',
            'ANALYSIS',
            'STATISTICS'
        ]
       
        for field in fields_to_check:
            if getattr(self, field) == "":
                setattr(self, field, None)
       
        super(WCProjectManagement, self).save(*args, **kwargs)



# __________________________________USER DEPARTMENT DATA_________________________________________________

# UD PROJECT INFORMATION & INPUTS DATA

class UDProjectInformationAndInputs(models.Model):
    # *** UD PROJECT INFORMATION DATA *** #
    UDPROJECT_ID = models.CharField(max_length=50, unique=True)
    UDPROJECT_NAME = models.CharField(max_length=50) #FIELD REQUIRED

    UDCREATION_DATE = models.DateField(auto_now_add=True)
    UDCREATION_TIME = models.TimeField(auto_now_add=True)

    UDCREATED_BY = models.CharField(max_length=None, null=True,blank=True)
    UDPROJECT_DESCRIPTION = models.TextField(max_length=200, blank=True, null=True)
    UDCLIENT_ORGANIZATION = models.CharField(max_length=50, blank=False) #FIELD REQUIRED
    UDEXECUTED_ORGANIZATION = models.CharField(max_length=50, blank=False) #FIELD REQUIRED
    UDCROPPING_YEAR = models.CharField(max_length=None,null=True, blank=True)
    UDCROPPING_SEASON = models.CharField(max_length=None,null=True, blank=True)
    UDAREA_INFORMATION = models.TextField(max_length=None, blank=True, null=True)

    # *** UD Projects Inputs Data *** #

    UDWORKSPACE_LOCATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    UDPROJECT_FOLDER = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    UDPROJECT_INFORMATION = models.CharField(max_length=None, blank=False) #FIELD REQUIRED

    # GIS INPUTS FOLDER
    UDAREA_OF_INTEREST = models.CharField(max_length=None, null=True, blank=True)
    UDGROUND_TRUTH = models.CharField(max_length=None, null=True, blank=True)
    UDGIS_MASK_BASEMAP = models.CharField(max_length=None, null=True, blank=True)
    UDSATELLITE_DATA = models.CharField(max_length=None, blank=False) #FIELD REQUIRED
    UDWEATHER_DATA = models.CharField(max_length=None, null=True, blank=True)
    UDHISTORICAL_DATA = models.CharField(max_length=None, null=True, blank=True)


    def __str__(self):
        return self.UDPROJECT_ID

    def save(self, *args, **kwargs):
        if not self.UDPROJECT_ID:
            with transaction.atomic():
                max_UDproject_id = UDProjectInformationAndInputs.objects.aggregate(max_id=models.Max('UDPROJECT_ID'))['max_id']
                if max_UDproject_id:
                    max_number = int(max_UDproject_id.replace('AGRI', ''))
                    self.UDPROJECT_ID = f"AGRI{max_number + 1:04d}"
                else:
                    self.UDPROJECT_ID = "AGRI0001"
        super(UDProjectInformationAndInputs, self).save(*args, **kwargs)

# ___________________________________________________________________________________________________________________________

#  UD PROJECT MANAGEMENT DATA

class UDProjectManagement(models.Model):
    UD_PROJECT_ID = models.ForeignKey(UDProjectInformationAndInputs, to_field='UDPROJECT_ID', on_delete=models.CASCADE, related_name='UDProjectManagement')
    UD_ADMIN_USER = models.CharField(max_length=None, blank=False, null=True) #FIELD REQUIRED
    UD_WORK_ASSIGN_USER = models.CharField(max_length=None, null=True, blank=True)
    UD_STACKING = models.CharField(max_length=None, null=True, blank=True)
    UD_UNSUPERVISED_CLASSIFICATION = models.CharField(max_length=None, null=True,blank=True)
    UD_SUPERVISED_CLASSIFICATION = models.CharField(max_length=None, null=True, blank=True)
    UD_RECODE_CLUMP_ELIMINATE = models.CharField(max_length=None, null=True, blank=True)
    UD_ANALYSIS = models.CharField(max_length=None, null=True, blank=True)
    UD_STATISTICS = models.CharField(max_length=None, null=True, blank=True)
 
    def __str__(self):
        return self.UD_ADMIN_USER
 
    def save(self, *args, **kwargs):
        fields_to_check = [
            'UD_WORK_ASSIGN_USER',
            'UD_STACKING',
            'UD_UNSUPERVISED_CLASSIFICATION',
            'UD_SUPERVISED_CLASSIFICATION',
            'UD_RECODE_CLUMP_ELIMINATE',
            'UD_ANALYSIS',
            'UD_STATISTICS'
        ]
       
        for field in fields_to_check:
            if getattr(self, field) == "":
                setattr(self, field, None)
       
        super(UDProjectManagement, self).save(*args, **kwargs)



