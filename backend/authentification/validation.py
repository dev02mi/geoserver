from django.core.exceptions import ValidationError
from django.db import models
import re
# from .models import User_login_Data

def validate_no_dot(value):
    value12 = value.strip()
    if " " in value12 or  '.' in value12 or len(value12) < 6 or not (any(char.isalpha() for char in value12) and re.match("^[a-zA-Z0-9@%&*_\-]*$", value12)): 
        raise ValidationError("Usernames Cannot Contain Space, Dots And Less Than Six Charector And Required Atleat One Letter And Only Accept Spacial Charectors Are @%&*")
    
# def email_validation(value):
#     norm_email = value.lower().strip()
#     if User_login_Data.objects.filter(EMAIL__iexact=norm_email).exists():
#             raise ValidationError("Not unique email")
    
    #     value12 = value.replace(" ", "")
    # print(value12)
def validate_password(value):
    value = value.strip()

    if " " in value:
        raise ValidationError("Password Cannot Contain Spaces.")
    
    if len(value) < 8:
        raise ValidationError("Password Should Be At Least 8 Characters Long.")
    
    if not any(char.isalpha() for char in value):
        raise ValidationError("Password Should Contain At Least One Alphabet Character.")
    
    if not any(char.isdigit() for char in value):
        raise ValidationError("Password Should Contain At Least One Digit.")
    
    # if not any(x in "!@#$%^&*" for x in value):
    #     raise ValidationError("Password should contain at least one of the special characters: !@#$%^&*")
    allowed_special_characters = set("!@#$%^&*")
    if (not any(x in allowed_special_characters for x in value)) or any(x for x in value if not (x.isalpha() or x.isdigit()  or x in allowed_special_characters)):
        raise ValidationError("Password Should Contain Only The Special Characters: !@#$%^&*  ")


# def validate_numeric(value):
#     if not value.isdigit():
#         raise ValidationError('LAN_LINE must contain only numeric characters.')
 