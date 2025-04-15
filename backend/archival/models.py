from django.db import models
from django.contrib.gis.db import models
from django.utils import timezone
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify


class zipinfo(models.Model):
    zip_code = models.CharField(max_length=10, primary_key=True)
    CL_REF = models.CharField(max_length=50)
    CL_ORDNA =	models.CharField(max_length=50)
    CL_PROJNA =	models.CharField(max_length=100)
    CL_PURPOSE = models.CharField(max_length=100)
    CL_ADDRESS1	= models.CharField(max_length=150)
    CL_ADDRESS2	= models.CharField(max_length=150)
    # SAT_NO = models.CharField(max_length=50, null=True)
    comman_area_shape = models.GeometryField(null=False, blank=False)
    COMP_NA = models.CharField(max_length=50)
    Insert_DATE = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return str(self.zip_code)



class MarsMainTableData(models.Model):
    DATACODE             = models.CharField(max_length=10, primary_key=True)
    zipinfo             = models.ForeignKey(zipinfo, to_field='zip_code', on_delete=models.CASCADE, related_name='zipinfo_set')
    DATANAME             = models.CharField(max_length=100)
    COMP_NA             = models.CharField(max_length=50)#zip
    SATT_NA             = models.CharField(max_length=50)#
    CL_REF             = models.CharField(max_length=50)
    CL_ORDNA             =	models.CharField(max_length=50)
    CL_PROJNA             =	models.CharField(max_length=100)
    CL_PURPOSE             = models.CharField(max_length=100)
    CL_ADDRESS1	            = models.CharField(max_length=150)
    CL_ADDRESS2	            = models.CharField(max_length=150)
    SEN_NAME             =	models.CharField(max_length=20)
    IMG_DATYPE             = models.CharField(max_length=30)#
    IMG_DAPROC             = models.CharField(max_length=20)
    IMG_DATE             =	models.DateField()
    IMG_DT_RNG             = models.CharField(max_length=21)
    DLOCA_CY             =	models.CharField(max_length=100)
    DLOCA_ST             =	models.CharField(max_length=100)
    DLOCA_DT             =	models.CharField(max_length=100)
    DLOCA_LOCA             = models.CharField(max_length=100)
    DAREA             =	models.FloatField()
    DSIZE             = models.CharField(max_length=10)#
    DQLNAME             = models.CharField(max_length=100)
    DFORMAT             = models.CharField(max_length=20)
    DCLOUD             = models.FloatField()
    DSNOW             = models.FloatField() 	
    D_AQ_BITS             =	models.IntegerField()
    D_PR_BITS             =	models.IntegerField()
    DPRJ_TABLE             = models.CharField(max_length=20)
    DPRJ_NAME             =	models.CharField(max_length=6)
    D_NROWS             =	models.IntegerField()	
    D_NCOLS             =	models.IntegerField()
    D_NBANDS             =	models.IntegerField()	
    D_NTILES             =	models.IntegerField()	
    D_TYPE             =	models.CharField(max_length=20)
    D_NBITS             =	models.IntegerField()	
    D_SIGN             =	models.CharField(max_length=10)
    D_IN_ANGL             =	models.FloatField()
    D_GSD_AXT             =	models.FloatField()
    D_GSD_ALT             =	models.FloatField()
    D_PIXELX             =	models.FloatField()
    D_PIXELY             =	models.FloatField()
    AL_DA_PATH             = models.CharField(max_length=150)
    AL_SH_PATH             = models.CharField(max_length=150)
    AL_QL_PATH             = models.CharField(max_length=150)
    XML_FILE             =	models.CharField(max_length=100, unique=True, null=False, blank=False)
    IMG_PREVIEW             = models.ImageField(upload_to='PREVIEW/',  null=True, default=None)
    SAT_NO             =	models.CharField(max_length=50, null=True)#
    geometry_shape             = models.GeometryField()
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['DATACODE'], name='unique_datacode')
        ]
    def __str__(self):
        return str(self.DATACODE)


class MarsBandInformation(models.Model):
    DATACODE = models.ForeignKey(MarsMainTableData, to_field='DATACODE', on_delete=models.CASCADE, related_name='marsbandinformation_set')
    BAND_NAME = models.CharField(max_length=30)
    BAND_S_SPEC = models.FloatField()
    BAND_E_SPEC = models.FloatField()
    def __str__(self):
        return str(self.DATACODE)
    





