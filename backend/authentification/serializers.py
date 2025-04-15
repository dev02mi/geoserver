from rest_framework import serializers
from .models import *
from django.db.models import Q, Subquery
from rest_framework import status
import random
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.response import Response #
from django.contrib.auth.hashers import make_password
import string
from django.contrib.auth import get_user_model
from threading import Thread
from .helpers import *
from django.core.validators import MinLengthValidator
# from rest_framework.validators import RegexValidator
import copy
from django.core.validators import RegexValidator
from datetime import datetime, date
User = get_user_model()
from datetime import date
from rest_framework.exceptions import ValidationError, ErrorDetail
from collections import defaultdict
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken





class login_seria(serializers.Serializer):#active
    USERNAME = serializers.CharField(required=True, allow_blank=False, max_length=100)
    PASSWORD = serializers.CharField(required=True, allow_blank=False, max_length=100)



class forget_pass_seria(serializers.Serializer): #active
    USERNAME = serializers.CharField(required=True, allow_blank=False, max_length=100)


class contact_us_serialiser(serializers.ModelSerializer):
    class Meta:
        model = contact_us
        fields = ['customer_mail', 'customer_mobile_no', 'catagory', 'comment', 'name']

# class SpacelessPasswordValidator(MinLengthValidator): #not working     if not any(char.isupper() for char in value):   and 
#     def __call__(self, value):
#         # Replace spaces and calculate length
#         PASSWORD_errors = {}
#         value = value.strip()
#         if " " in value:
#             # raise ValidationError("Password cannot contain spaces.")
#             PASSWORD_errors.update({"space":"Password cannot contain spaces"})
#         if len(value) < 8:
#             # raise ValidationError("Password should be at least 8 characters long.")
#             PASSWORD_errors.update({"length":"Password should be at least 8 characters long"})
#         if not any(char.isupper() for char in value):
#             # raise ValidationError("Password should contain at least one upper case.")
#             PASSWORD_errors.update({"uppercase":"Password should contain at least one upper case"})
#         if not any(char.islower() for char in value):
#             # raise ValidationError("Password should contain at least one lower case.")
#             PASSWORD_errors.update({"lowercase":"Password should contain at least one lower case"})
#         if not any(char.isdigit() for char in value):
#             # raise ValidationError("Password should contain at least one digit.")
#             PASSWORD_errors.update({"digit":"Password should contain at least one digit"})
#         allowed_special_characters = set("!@#$%^&*")
#         if not any(x in allowed_special_characters for x in value): #or any(x for x in value if not (x.isupper() or x.islower() or x.isdigit())):
#             # raise ValidationError("Password should contain only these special characters: !@#$%^&*  ")
#             PASSWORD_errors.update({"spacialChar":"Password should contain only these special characters: !@#$%^&*  "})
        
#         if PASSWORD_errors:
#             raise ValidationError(PASSWORD_errors)

#         super().__call__(value)

class SpacelessPasswordValidator:
    def __init__(self, min_length=8, allowed_special_characters="!@#$%^&*"):
        self.min_length = min_length
        self.allowed_special_characters = set(allowed_special_characters)
        self.message = {
            "space": "Password Cannot Contain Spaces.",
            "length": f"Password Should Be At Least {self.min_length} Characters Long.",
            "uppercase": "Password Should Contain At Least One Upper Case Letter.",
            "lowercase": "Password Should Contain At Least One Lower Case Letter.",
            "digit": "Password Should Contain At Least One Digit.",
            "spacialChar": f"Password Should Contain At Least One Of These Special Characters: {allowed_special_characters}"
        }

    def __call__(self, value):
        value = value.strip()
        errors = {}

        if " " in value:
            errors["space"] = self.message["space"]
        if len(value) < self.min_length:
            errors["length"] = self.message["length"]
        if not any(char.isupper() for char in value):
            errors["uppercase"] = self.message["uppercase"]
        if not any(char.islower() for char in value):
            errors["lowercase"] = self.message["lowercase"]
        if not any(char.isdigit() for char in value):
            errors["digit"] = self.message["digit"]
        if (not any(char in self.allowed_special_characters for char in value)) or any(x for x in value if not (x.isdigit() or x.isupper() or x.islower() or x in self.allowed_special_characters)):
            errors["spacialChar"] = self.message["spacialChar"]

        if errors:
            # print(errors)
            raise ValidationError(errors)



class mobile_Validator(MinLengthValidator):
    def __call__(self, value):
        # Replace spaces and calculate length
        value1 = value.strip()
        if " " in value1 or not value1.isdigit():
            raise serializers.ValidationError("No Space Or Only Digit For The Mobile No")
        super().__call__(value1)

name_validator = RegexValidator(
    regex="^[A-Za-z]*$",
    message="Only Alphabet Characters Are Allowed."
)

###############################################################################################################################################################################################
class THEME_MODULE_serialiser(serializers.ModelSerializer):
    class Meta:
        model = THEME_MODULE
        fields = '__all__'

class MODUL_VIEW_PERMISSION_serialiser(serializers.ModelSerializer):
    VIEW_Thims = THEME_MODULE_serialiser(source='THEME_MODULE', required=False)
    class Meta:
        model = MODUL_VIEW_PERMISSION
        fields = '__all__'
        # depth = 1
    
    def update(self, instance, validated_data):
        validated_data.pop('USERID', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



#second table 
class User_Detail_Data_Serialiser_All_Field112(serializers.ModelSerializer):#active postUU,patchUU,postAU,PATCHAU,getAU,getUU
    # USERID = serializers.CharField(max_length=6, required=False)
    USERID = serializers.PrimaryKeyRelatedField(queryset=User_login_Data.objects.all(), required=False)
    FIRST_NAME = serializers.CharField(required=True, max_length=20, validators=[name_validator])
    MIDDLE_NAME = serializers.CharField(allow_blank=True, required=False, allow_null=True, max_length=20, validators=[name_validator]) #, default="null"
    LAST_NAME = serializers.CharField(required=True, max_length=20, validators=[name_validator])
    DOB = serializers.DateField(allow_null=True, required=False, format="%Y-%m-%d", input_formats=["%Y-%m-%d", ""]) #1900-01-01 this date always show null
    ORGANIZATION = serializers.CharField(required=True, max_length=100) #organization
    DESIGNATION = serializers.CharField(required=True, max_length=50)#designation
    CITY = serializers.CharField(required=True, max_length=50)
    STATE = serializers.CharField(required=True, max_length=50)
    COUNTRY = serializers.CharField(required=True, max_length=50)
    class Meta:
        model = Users_login_Details_Data
        
        fields = '__all__'
        # depth = 1 
    def __init__(self, *args, **kwargs):
        super(User_Detail_Data_Serialiser_All_Field112, self).__init__(*args, **kwargs)
        self.validation_errors = {}
        
    def validate_DOB(self, value):
        date_string = "1900-01-01"
        date_object = datetime.strptime(date_string, "%Y-%m-%d").date()
        if value == date_object:
            return None  # Convert empty string to null
        return value
    
    # def validate_ADDRESS_1(self, value):
    #     pass
    # def validate_PIN_CODE(self, value):
    #     pass
    
    def validate(self, data):
        address_1 = data.get('ADDRESS_1')
        pin_code = data.get('PIN_CODE')
        context = self.context.get('user_type', None)
        request = self.context.get('request', None)
        if 'DOB' in data:
            try:
                self.validate_DOB(data.get('DOB'))
            except serializers.ValidationError as e:
                self.validation_errors['DOB'] = e.detail
        def validate_pin_code(pin_code):
            if " " in pin_code or not pin_code.isdigit() or len(pin_code) != 6:
                return "Field Accepts Only Digits 0 to 9 And Must Have 6 Digits."
            return None
        if context == "UU" and (request in ["POST", "PUT"]):
            if (not address_1 and not pin_code):
                self.validation_errors.update({"ADDRESS_1 and PIN_CODE": "Both Fields Are Required For The Given USER_TYPE."})
            else:
                if not address_1:
                    self.validation_errors.update({"ADDRESS_1": " Field Is Required For The Given USER_TYPE."})
                if not pin_code:
                    self.validation_errors.update({"PIN_CODE": "Field Is Required For The Given USER_TYPE."})
                else:
                    pin_code_error = validate_pin_code(pin_code)
                    if pin_code_error:
                        self.validation_errors.update({"PIN_CODE": pin_code_error})
            
        if context == "UU" and request =="PATCH":
            if "ADDRESS_1" in data and not address_1:
                self.validation_errors.update({"ADDRESS_1": "Field Is Required For The Given USER_TYPE."})
            if "PIN_CODE" in data:
                if not pin_code:
                    self.validation_errors.update({"PIN_CODE": " Field Is Required For The Given USER_TYPE."})
                else:
                    pin_code_error = validate_pin_code(pin_code)
                    if pin_code_error:
                        self.validation_errors.update({"PIN_CODE": pin_code_error})

        if self.validation_errors:
            raise serializers.ValidationError(self.validation_errors)
        return data
    
    def to_internal_value(self, data):
        try:
            validated_data = super().to_internal_value(data)
        except serializers.ValidationError as exc:
            # self.validation_errors.update(exc.detail)
            self.validation_errors = exc.detail
            validated_data = {key: data[key] for key in data if key not in exc.detail}
        return validated_data
    
    def update(self, instance, validated_data):
        validated_data.pop('USERID', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    

class User_login_Data_serialiser112(serializers.ModelSerializer):#active, Post admin, patch admin, post UU, patchUU, post gu patch gu
    USERID = serializers.CharField(max_length=10, required=False)
    MOBILE_NO = serializers.CharField(max_length=10, validators=[mobile_Validator(10, message="Mobile No Must Be 10 Characters.")], required=False)
    PASSWORD = serializers.CharField(max_length=40, required=False, validators=[SpacelessPasswordValidator()])
    logindata = User_Detail_Data_Serialiser_All_Field112(required=False)
    VIEW_PERMISSION = MODUL_VIEW_PERMISSION_serialiser(required=False)
    VIEW_thim = THEME_MODULE_serialiser(required=False)
    class Meta:
        model = User
        fields = '__all__'
    def __init__(self, *args, caller= None, **kwargs):
        self.caller = caller
        super(User_login_Data_serialiser112, self).__init__(*args, **kwargs)
        self.user_type = None
        self.logindata_1  = None
        self.validation_errors = {}
        self.context_Type = self.context.get("USER_TYPE", "Not in context")
        self.orignal_request = self.context.get('request').method if self.context.get('request') else None
        self._request_method = self.orignal_request 
        self.initiate_login = self.context.get('initiate_login', None)
        if not (self.caller in ["AU", "SU"] and self.context_Type == "UU"):
            if hasattr(self, 'initial_data'):
                self.user_type = self.initial_data.get('USER_TYPE', None)
                if self.user_type is None:
                    self.user_type = self.context_Type
                self.logindata_1 = self.initial_data.get('logindata', None)
                if self.user_type:
                    self.fields['logindata'].context.update({'user_type': self.user_type, "request":self.get_request()})   #run currectly
            if self.get_request() in ['PATCH', 'PUT'] and self.user_type != 'GU':
                if not hasattr(self.instance, 'logindata') or not self.instance.logindata:    
                    if self.initiate_login:
                        self.set_request(initiate_login=self.initiate_login)
                    self.logindata_serializer = User_Detail_Data_Serialiser_All_Field112(data=self.logindata_1,
                    context={'user_type': self.user_type, "request": self.get_request()})
                else:
                    if self.logindata_1: 
                        self.logindata_serializer = User_Detail_Data_Serialiser_All_Field112(
                            instance=self.instance.logindata,
                            data=self.logindata_1,
                                context={'user_type': self.user_type, "request": self.get_request()},partial=True
                                )
            else:
                self.logindata_serializer = None  # or set to a default value if needed
        
        self.set_request()
        if self.get_request() == 'POST' and (self.user_type != 'GU' and self.user_type != 'SU'):
            self.fields['logindata'].required = True
        else:
            self.fields['logindata'].required = False
        if self.get_request() == 'POST'  and self.user_type == 'SU':
            self.fields['MOBILE_NO'].required = False
        else:
            self.fields['MOBILE_NO'].required = True
    
    # def get_usertype(self, request):
    #     if request:
    #         pass

    def get_request(self):
        return self._request_method

    # Setter method for name
    def set_request(self, **kwargs):
        set_req_para = kwargs.get("initiate_login", None)
        if set_req_para:
            self._request_method = "POST"
        else:
            self._request_method = self.orignal_request

    def validate_field(self, field_name, value):
        field = self.fields[field_name]
        try:
            validated_data = field.run_validation(value)
            field.run_validators(validated_data)
            return validated_data
        except ValidationError as exc:
            # print("sssssss", exc)
            if isinstance(exc.detail, dict):
                formatted_errors = {}
                for key, errors in exc.detail.items():
                    if isinstance(errors, list):
                        formatted_errors[key] = [str(err) for err in errors if isinstance(err, ErrorDetail)]
                    elif isinstance(errors, dict):
                        formatted_errors[key] = {sub_key: str(sub_value) for sub_key, sub_value in errors.items() if isinstance(sub_value, ErrorDetail)}
                    else:
                        formatted_errors[key] = str(errors)
            elif isinstance(exc.detail, list):
                formatted_errors = [str(err) for err in exc.detail if isinstance(err, ErrorDetail)]            
            # print("jjjjjjjj",formatted_errors)
            else:
                formatted_errors = str(exc.detail)
            raise ValidationError(formatted_errors)
            # raise ValidationError(formatted_errors)

    def validate_EMAIL(self, value):
        try:
            norm_email = value.lower().strip()
        except Exception as e:
            return Response({"errors":str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        if self.instance is None or not self.instance.USERID:
            if User_login_Data.objects.filter(EMAIL__iexact=norm_email).exists():
                raise serializers.ValidationError("Not Unique Email")
        elif self.instance.USERID:
            if User_login_Data.objects.filter(EMAIL__iexact=norm_email).exclude(USERID=self.instance.USERID).exists():
                raise serializers.ValidationError("Not Unique Email")
            return norm_email
        return norm_email
    

    def validate_SU_APRO_STAT(self, value):
        if value is None or value == "":
            raise serializers.ValidationError("SU_APRO_STAT Cannot Be Empty Or None.")
        return value
    def validate_AU_APRO_STAT(self, value):
        if value is None or value == "":
            raise serializers.ValidationError("SU_APRO_STAT Cannot Be Empty Or None.")
        return value
    
    def validate(self, data):
        self.set_request()

        if 'EMAIL' in data:
            try:
                self.validate_EMAIL(data.get('EMAIL'))
            except serializers.ValidationError as e:
                self.validation_errors['EMAIL'] = e.detail
        if 'SU_APRO_STAT' in data:  
            try:
                self.validate_SU_APRO_STAT(data.get('SU_APRO_STAT'))
            except serializers.ValidationError as e:
                self.validation_errors['SU_APRO_STAT'] = e.detail
        if 'AU_APRO_STAT' in data:  
            try:
                self.validate_AU_APRO_STAT(data.get('AU_APRO_STAT'))
            except serializers.ValidationError as e:
                self.validation_errors['AU_APRO_STAT'] = e.detail
        
        if self.get_request() == 'PUT' and self.user_type == 'UU' and self.logindata_1:
            logindata_serializer = User_Detail_Data_Serialiser_All_Field112(data=self.logindata_1, context={'user_type': self.user_type, "request":self.get_request()})
            if not logindata_serializer.is_valid():
                self.validation_errors.update({"logindata": logindata_serializer.errors})

        if hasattr(self, 'logindata_serializer') and self.logindata_serializer:
            if not self.logindata_serializer.is_valid():
                self.validation_errors.update({"logindata": self.logindata_serializer.errors})
            else:
                data['logindata'] = self.logindata_serializer.validated_data

        if 'USERNAME' in data:
            data['USERNAME'] = data.get("USERNAME", "").replace(" ", "")
        
        user_type = data.get('USER_TYPE', "No user_type")
        # required_fields_user_types = context
        self.set_request()
        opt = None
        try:
            opt = data.get('THEME_OPT').USERID_THEME_OPT
        except:
            try:
                opt = data.get('THEME_OPT')
            except Exception as e:
                self.validation_errors.update({"Thim_opt": "Due To Some Other Field Error Data Type Change And OPT Not Extract unexpected authentification views.py line 385"})
        if self.context_Type =="UU" and (self.get_request() in ['POST', 'PUT']):  #update(self.context)
            admin_user = User_login_Data.objects.filter(USER_TYPE="AU", THEME_OPT=opt, ADMIN_TYPE=data.get("ADMIN_TYPE"), SU_APRO_STAT="APPROVED", AU_APRO_STAT="INPROGRESS")
            if not admin_user:
                self.validation_errors.update({"Admin_error": "No Admin Found"})
                pass

        #     missing_fields = [field for field in ['Q1_ID', 'Q2_ID', 'Q1_AN', 'Q2_AN'] if field not in data]
        #     if missing_fields:
        #         self.validation_errors.update({
        #             field: [f"{field} is required for user type {user_type}"]
        #             for field in missing_fields
        #         })
        #     data['Q1_AN'] = data.get("Q1_AN", "").lower()
        #     data['Q2_AN'] = data.get("Q2_AN", "").lower()
        # else:
        #     pass
        if data.get("USER_TYPE", None) in ["SU", "UU", "GU"]:  #PASSWORD
            # if self.validation_errors
            if not "PASSWORD" in self.validation_errors:
                password = data.get("PASSWORD", None)
                if password:
                    data["PASSWORD"] = make_password(password)
                else:
                    self.validation_errors.update({"PASSWORD": "This Field Is Required For The Given USER_TYPE."})

        if data.get('USER_TYPE') != None:
            if user_type == "AU" or user_type =="UU":
                if (not data.get("THEME_OPT") and not data.get("ADMIN_TYPE")):
                    self.validation_errors.update({"Theme_Section and ADMIN_TYPE": "Both Fields Are Required For The Given USER_TYPE."})
                if not data.get("THEME_OPT"):
                    self.validation_errors.update({"Theme_Section": "This Field Is Required For The Given USER_TYPE."})
                if not data.get("ADMIN_TYPE"):
                    self.validation_errors.update({"ADMIN_TYPE": "This Field Is Required For The Given USER_TYPE."})
        if self.validation_errors:
            raise serializers.ValidationError(self.validation_errors)
        return data
    
    def to_internal_value(self, data):
        try:
            validated_data = super().to_internal_value(data)
        except serializers.ValidationError as exc:
            # print("ddddddddd", exc.detail)
            # self.validation_errors.update(exc.detail)    #correct
            # self.validation_errors = exc.detail
            # for field, errors in exc.detail.items():
            #     self.validation_errors[field] = [
            #         self.fields[field].error_messages.get(err.code, str(err)) if isinstance(err, ErrorDetail) else str(err)
            #         for err in errors
            #     ]
            self.validation_errors = defaultdict(dict)
            for field, errors in exc.detail.items():
                
                if isinstance(errors, list):
                    for err in errors:
                        if isinstance(err, ErrorDetail):
                            self.validation_errors[field][err.code] = str(err)
                        else:
                            self.validation_errors[field] = [str(err) for err in errors]
                elif isinstance(errors, dict):
                    for key, value in errors.items():
                        if isinstance(value, list):
                            # Extract the error messages from list of ErrorDetail
                            self.validation_errors[field][key] = [str(err) for err in value if isinstance(err, ErrorDetail)]
                        else:
                            self.validation_errors[field][key] = str(value)
            validated_data = {key: data[key] for key in data if key not in exc.detail}
        return validated_data
    
    def create(self, validated_data):
        profile_details = validated_data.pop('logindata', {})
        if 'USERID' not in validated_data or validated_data["USERID"]==None:
            last_instance = User_login_Data.objects.all().order_by('-USERID').first()
            if last_instance:
                last_code = int(last_instance.USERID)
                new_code = str(last_code + 1).zfill(6)  
            else:
                new_code = '000001'  
            validated_data['USERID'] = new_code
        PASSWORD_AU = None
        if "PASSWORD" not in validated_data or validated_data["PASSWORD"]==None:
            special_chars = "!@#$%^&*"
            letters = string.ascii_letters
            digits = string.digits
            password_list = [random.choice(special_chars), random.choice(letters), random.choice(digits)]
            remaining_length = 5
            password_list.extend(random.choice(letters + digits + special_chars) for _ in range(remaining_length))
            random.shuffle(password_list)
            PASSWORD_AU = ''.join(password_list)
            print(PASSWORD_AU,  len(PASSWORD_AU))
            
            # if validated_data.get("USER_TYPE")=="SU":
                
            if validated_data.get("USER_TYPE")=="AU":
                try:
                    print("qqqqqqqq", validated_data.get("THEME_OPT").USERID_THEME_OPT)
                    THEME_OPT = THEME_MODULE.objects.get(USERID_THEME_OPT=validated_data.get("THEME_OPT").USERID_THEME_OPT)
                except Exception as e:
                    return Response({"errors":str(e)}, status=status.HTTP_400_BAD_REQUEST)
                # send_admin_password_mail(validated_data.get("EMAIL"),PASSWORD , validated_data.get("USERNAME"), THEME_OPT.THEME_TYPE)   #use to send mail to AU admin for login
            else:
                pass
            validated_data["PASSWORD"] = make_password(PASSWORD_AU)
        else:
            pass

        try:
            instance = User_login_Data.objects.create(**validated_data)
            if validated_data.get("USER_TYPE") not in ["GU", "SU"]: #!="GU":
                Users_login_Details_Data.objects.create(USERID=instance, **dict(profile_details))
            if validated_data.get("USER_TYPE") =="UU":
                obj_thim = THEME_MODULE.objects.get(USERID_THEME_OPT=validated_data.get("THEME_OPT").USERID_THEME_OPT)
                MODUL_VIEW_PERMISSION.objects.create(USERID=instance, THEME_MODULE=obj_thim)
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            raise serializers.ValidationError({'message': 'Something Went Wrong. Please Submit The Form Again.', 'error': str(e)})
        # instance["PASSWORD_AU"] = PASSWORD_AU
        if PASSWORD_AU:
            self._password_au = PASSWORD_AU
        return instance
    def update(self, instance, validated_data):
        data_profile = validated_data.pop("logindata", {})
        view = validated_data.pop("VIEW_PERMISSION", {})
        if self.get_request() =="PUT":
            validated_data.pop('PASSWORD', None)
        else:
            validated_data.pop('USER_TYPE', None)
            if  validated_data.get("SU_APRO_STAT"):
                if instance.USER_TYPE =="AU" and instance.AU_APRO_STAT =="INPROGRESS":
                    if validated_data.get("SU_APRO_STAT") =="APPROVED":
                        if instance.SU_APRO_STAT == "APPROVED":
                            pass
                        else:
                            OPT = instance.THEME_OPT
                            obj = User_login_Data.objects.all().filter(USER_TYPE="UU", THEME_OPT=OPT, SU_APRO_STAT="APPROVED", AU_APRO_STAT="APPROVED", ADMIN_TYPE= instance.ADMIN_TYPE)
                            if obj.exists():
                                EMAIL_Query = obj.values_list('EMAIL', flat=True)
                                EMAIL_ALL = list(EMAIL_Query)
                                USERNAME_UU_Query = obj.values_list('USERNAME', flat=True)
                                USERNAME_UU_LIST = list(USERNAME_UU_Query)
                                
                                # Call mass mail function with both email list and usernames of UU users
                                mass_mail_unblock_admin_bravo(EMAIL_ALL, USERNAME_UU_LIST, validated_data.get("SU_APRO_STAT"))
                            re = validated_data.get("SU_APRO_REM", None)
                            ad = instance.ADMIN_TYPE
                            admin_type_short = (ad[0:2] if ad else "")+"AU" 
                        send_ADMIN_APPROVED_mail_bravo(instance.EMAIL,instance.USERNAME, admin_type_short,email_au=None)
                    elif validated_data.get("SU_APRO_STAT") =="BLOCKED":         # or validated_data.get("SU_APRO_STAT") =="DELETE":
                        if validated_data.get("SU_APRO_STAT") =="BLOCKED" and not "SU_APRO_REM" in validated_data  or  validated_data.get("SU_APRO_REM") in [None, ""]:
                            raise serializers.ValidationError({"errors":"SU_APRO_REM Cannot Be Empty Or None."})
                        OPT = instance.THEME_OPT
                        obj = User_login_Data.objects.all().filter(USER_TYPE="UU", THEME_OPT=OPT, SU_APRO_STAT="APPROVED", AU_APRO_STAT="APPROVED", ADMIN_TYPE= instance.ADMIN_TYPE)
                        if obj.exists():
                            EMAIL_Query = obj.values_list('EMAIL', flat=True)
                            EMAIL_ALL = list(EMAIL_Query)
                            USERNAME_UU_Query = obj.values_list('USERNAME', flat=True)
                            USERNAME_UU_LIST = list(USERNAME_UU_Query)
                            
                            # Call mass mail function with both email list and usernames of UU users
                            mass_mail_block_admin_bravo(EMAIL_ALL, USERNAME_UU_LIST, validated_data.get("SU_APRO_STAT"))
                        ad = instance.ADMIN_TYPE
                        admin_type_short = (ad[0:2] if ad else "") + "AU"
                        instance.SU_APRO_STAT = validated_data.get("SU_APRO_STAT")
                        instance.SU_APRO_REM = validated_data.get("SU_APRO_REM")
                        instance.save()
                        block_admin_mail_bravo(instance.EMAIL, validated_data.get("SU_APRO_STAT"), instance.USERNAME,admin_type_short)
                    elif validated_data.get("SU_APRO_STAT") =="DELETE":
                        # SU_APRO_REM = None
                        ad = instance.ADMIN_TYPE
                        admin_type_short =(ad[0:2] if ad else "") + "AU"
                        send_account_deletion_email_bravo(instance.EMAIL, instance.USERNAME, admin_type_short)
                        
                    else:
                        pass

                        
                elif instance.USER_TYPE in  ["UU", "GU"]:
                    email_au =None
                    if instance.USER_TYPE == "UU":
                        try:
                            obj = User_login_Data.objects.filter(USER_TYPE="AU", THEME_OPT=instance.THEME_OPT.USERID_THEME_OPT, AU_APRO_STAT= "INPROGRESS", ADMIN_TYPE=instance.ADMIN_TYPE).filter(
                                    Q(SU_APRO_STAT="APPROVED") | Q(SU_APRO_STAT="BLOCKED") | Q(SU_APRO_STAT="PENDING")).first()#vfgvfdgfgfg 
                            if obj:
                                email_au  = obj.EMAIL 
                            else:
                                email_au  = None
                        except Exception as e:
                            return Response({"error": str(e), "Message":"Admin Not Present In Database Please Create"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    else:
                        email_au = None
                        pass

                    if validated_data.get("SU_APRO_STAT") == "APPROVED":
                        #change mail to unblocked done by SU
                        send_ADMIN_APPROVED_mail_bravo(instance.EMAIL , instance.USERNAME,instance.USER_TYPE,email_au=email_au) #uu
                    elif validated_data.get("SU_APRO_STAT") == "REJECTED":
                        account_rejection_mail_bravo(instance.EMAIL , instance.USERNAME, instance.USER_TYPE, validated_data.get("SU_APRO_REM"), email_au=email_au)
                    elif  validated_data.get("SU_APRO_STAT") == "DELETE":
                        mail_delete_uu_to_admin_bravo(instance.EMAIL, instance.USERNAME,instance.USER_TYPE ,validated_data.get("SU_APRO_STAT"), x ="SU", email_au=email_au )
                    elif validated_data.get("SU_APRO_STAT") == "BLOCKED":
                        block_admin_mail_bravo(instance.EMAIL, validated_data.get("SU_APRO_STAT"), instance.USERNAME, instance.USER_TYPE, email_au=email_au)
                
                        # if obj:
                        #     EMAIL = [obj.EMAIL]
                        #     x = "SU"
                        #     mail_delete_uu_to_admin_bravo(EMAIL , instance.USERNAME, validated_data.get("SU_APRO_STAT"), x, validated_data.get("SU_APRO_REM"))
                        # else:
                        #     pass
                
            elif validated_data.get("AU_APRO_STAT"):    # is not None and validated_data.get("AU_APRO_STAT") != "" and instance.USER_TYPE =="UU":
                su_mail = User_login_Data.objects.get(USER_TYPE="SU")
                if validated_data.get("AU_APRO_STAT") == "APPROVED":
                    if instance.AU_APRO_STAT == "INPROGRESS" or instance.AU_APRO_STAT == "REJECTED":
                        pass
                        # send_authorised_APPROVED_mail_bravo(instance.EMAIL , instance.USERNAME, instance.THEME_OPT.THEME_TYPE, email_au=su_mail.EMAIL)
                    elif instance.AU_APRO_STAT == "BLOCKED":
                        send_ADMIN_APPROVED_mail_bravo(instance.EMAIL , instance.USERNAME,instance.USER_TYPE,email_au=su_mail.EMAIL) #UU unblocked by AU
                elif validated_data.get("AU_APRO_STAT") == "REJECTED":
                    account_rejection_mail_bravo(instance.EMAIL , instance.USERNAME, instance.USER_TYPE, email_au=su_mail.EMAIL)
                elif  validated_data.get("AU_APRO_STAT") == "DELETE":
                    mail_delete_uu_to_admin_bravo(instance.EMAIL, instance.USERNAME, instance.USER_TYPE ,validated_data.get("AU_APRO_STAT"), x ="AU",email_au=None)
                elif  validated_data.get("AU_APRO_STAT") == "BLOCKED":
                    block_admin_mail_bravo(instance.EMAIL, validated_data.get("AU_APRO_STAT"), instance.USERNAME, instance.USER_TYPE,email_au=su_mail.EMAIL)
                else:
                    pass
            else:
                pass
        validated_data.pop('USERID', None)
        password = validated_data.get("PASSWORD", None)
        if password:
            validated_data["PASSWORD"] = make_password(password)
        for attr, value in validated_data.items():
            print(attr, value)
            setattr(instance, attr, value)
        instance.save()
        if data_profile:
            try:
                logindata_instance = instance.logindata
            except AttributeError:
                logindata_instance = None
            if logindata_instance is None:
                Users_login_Details_Data.objects.create(USERID=instance, **dict(data_profile))
            else:
                Users_login_Details_Data.objects.filter(USERID=instance.USERID).update(**data_profile)
        if view:
            try:
                obj, created = MODUL_VIEW_PERMISSION.objects.get_or_create(USERID=instance, defaults={'THEME_MODULE': THEME_MODULE.objects.get(USERID_THEME_OPT=instance.THEME_OPT.USERID_THEME_OPT)})
                serializer_view = MODUL_VIEW_PERMISSION_serialiser(obj, data=view, partial=True)
                if serializer_view.is_valid():
                    serializer_view.save()
                else:
                    raise serializers.ValidationError(serializer_view.errors)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return instance
    
    def to_representation(self, instance):
        # if not isinstance(instance, User_login_Data):  # Replace User_login_Data with your actual model class
        #     return {}
        if isinstance(instance, dict):
        # Handling the case when instance is validated data (OrderedDict)
            representation = instance
        else:
            representation = super().to_representation(instance)
            if hasattr(instance, 'logindata'):
                representation['logindata'] = User_Detail_Data_Serialiser_All_Field112(instance.logindata).data
        # Check if 'view_permissions' exists in the attributes
            if hasattr(instance, 'VIEW_PERMISSION'):
                representation['VIEW_PERMISSION'] = MODUL_VIEW_PERMISSION_serialiser(instance.VIEW_PERMISSION).data
            else:
                if instance.USER_TYPE == "UU":
                    try:
                        obj_thim = THEME_MODULE.objects.get(USERID_THEME_OPT=instance.THEME_OPT.USERID_THEME_OPT)
                        data_view = MODUL_VIEW_PERMISSION.objects.create(USERID=instance, THEME_MODULE=obj_thim)
                        representation['VIEW_PERMISSION'] = MODUL_VIEW_PERMISSION_serialiser(data_view).data
                    except Exception as e:
                        return Response({"errors":str(e)}, status=status.HTTP_403_FORBIDDEN)
                else:
                    representation['VIEW_PERMISSION'] = None

            if hasattr(instance, 'VIEW_thim'):
                representation['VIEW_thim'] = THEME_MODULE_serialiser(instance.VIEW_thim).data
            else:
                try:
                    if instance.USER_TYPE == "AU" or instance.USER_TYPE == "UU":
                        obj_thim = THEME_MODULE.objects.get(USERID_THEME_OPT=instance.THEME_OPT.USERID_THEME_OPT)
                        representation['VIEW_thim'] = THEME_MODULE_serialiser(obj_thim).data
                    else:
                        representation['VIEW_thim'] = None
                except Exception as e:
                        return Response({"errors":str(e)}, status=status.HTTP_403_FORBIDDEN)
        
        return representation




# ****************  LogOut Serializer API's ***** Created By **RIMANSHU**  


class LogoutSerializer(serializers.Serializer):

    refresh = serializers.CharField()

    default_error_messages = {
        'bad_token' : ('Token Is Expired Or Invalid'),
        'bad_tokens' : ('Does Not Exist In Outstanding Token'),

    }

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()

        except TokenError:
            self.fail('bad_token')



    # def save(self, **kwargs):
    #     try:
    #         # Decode the token to get the token instance
    #         refresh_token = RefreshToken(self.token)
    #         # Delete the token from the database
    #         token_obj = OutstandingToken.objects.get(token=str(refresh_token))
    #         token_obj.delete()
    #         # return Response(status=status.HTTP_204_NO_CONTENT)
    #         return Response({"message": "Token successfully invalidated"}, status=status.HTTP_200_OK)

    #     except TokenError:
    #         self.fail('bad_token')

    #     except OutstandingToken.DoesNotExist:
    #         self.fail('bad_tokens')



from rest_framework import serializers 
# from .models 
# import HTTPRequestResponse
class HTTPRequestResponseSerializer(serializers.ModelSerializer):
    class Meta:        
        model = Testclass        
        fields = '__all__'