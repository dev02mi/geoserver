from django.core.mail import send_mail
# django.core.mail.send_mass_mail() 
# from django.core.mail import send_mass_mail
from django.conf import settings 
import requests
import json
from datetime import datetime

def send_forget_password_mail(email , token, x):
    subject = 'Your forget password link'
    if x == 2:
        message = f'Hi ,  {token}'
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)
        return True
    else:
        message = f'Hi , click on the link to reset your password  http://13.232.99.245:9090/Cpassword/{token}/'
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)
        return True
    

def send_admin_password_mail_rework(EMAIL):
    # subject = 'Micronet password'
    # message = f'Hi ,Admin :"{USERNAME}" Please use this password for login "{PASSWORD}"'
    subject = f'Regarding Your {THEME_OPT}-Admin Login Information'
    message = f'Hi {THEME_OPT}-Admin,\n\nUsername: {USERNAME}\nPassword: {PASSWORD}\n\nPlease use this information for login. \n\nBest regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def send_authorised_APPROVED_mail(EMAIL, AU_APRO_STAT, AU_APRO_REM, USERNAME):
    subject = 'Notification Regarding Your Account Status'
    message =f'Hi {USERNAME},\n\n' \
          f'This is to inform you that your account has been {AU_APRO_STAT.lower()}\n' \
          f'Reason: {AU_APRO_REM}\n\n' \
          f'Please refer to this message for more details.\n\n' \
          f'Best regards,\n GeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True
    
    
def mass_mail_block_admin(EMAIL_LIST, ADMIN_USERNAME, status):
    subject = 'Important: Temporary Suspension of Your Access to Services'
    # message = f'Hi ,Admin :"{ADMIN_USERNAME}" {status} We start your service shortly"'
    message =  f'Hi User,\n\n' \
          f'We regret to inform you that your access to services has been temporarily suspended by the administrator, due to {ADMIN_USERNAME} has been block.\n' \
          f'{status} We will start your service shortly.\n\n' \
          f'Thank you for your understanding.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = EMAIL_LIST
    send_mail(subject, message, email_from, recipient_list)
    return True

def block_admin_mail(EMAIL, SU_APRO_STAT, SU_APRO_REM , USERNAME):
    subject = f'Notification: Your Admin Status is {SU_APRO_STAT.capitalize()}'
    message = f'Hi  ADMIN : {USERNAME},\n\n' \
          f'You are {SU_APRO_STAT.lower()}.\n' \
          f'Reason: {SU_APRO_REM}\n\n' \
          f'Thank you for your attention to this matter.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def UU_resister_mail(EMAIL, USERNAME):
    subject = 'Registration Confirmation: Await Login Approval'
    message = f'Hi USER "{USERNAME}",\n\n' \
          f'Thank you for registering with us!\n' \
          f'Please wait for some time for your login approval.\n' \
          f'Our admin has sent you a message regarding your approval status.\n\n' \
          f'Thank you for your patience.\n\n' \
          f'Best regards,\nnGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def mail_Delete_UU_to_admin(EMAIL_LIST, USERNAME, status, Deleted_by):
    subject = f'User Deletion Notification: {USERNAME} {status.capitalize()} by {Deleted_by}'
    # message = f'Hi ,Admin :" user :{USERNAME}"  status:{status} by {Deleted_by}"'
    message =  f'Hi Admin,\n\n' \
          f'The user "{USERNAME}" has been {status.lower()} by {Deleted_by}.\n\n' \
          f'Thank you for managing user accounts.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = EMAIL_LIST
    send_mail(subject, message, email_from, recipient_list)
    return True

def Delete_UU_mail_to_UU(EMAIL, status,USERNAME, admin_email, DELETE_BY):
    subject = f'Important: Your Account "{USERNAME}" Status Update'
    message = f'Hi User,\n\n' \
          f'Your account "{USERNAME}" has been {status.lower()} and is no longer active.\n' \
          f'Please contact the administrator at {admin_email} for further assistance.\n\n' \
          f'This action was performed by {DELETE_BY}.\n\n' \
          f'Thank you for using our services.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def send_forget_password_mail_admin(EMAIL , token, USERNAME):
    subject = 'Password Change Request OTP'
    message = f'Hi user,\n\n' \
          f'The user "{USERNAME}" has requested a OTP to change their password.\n' \
          f'User OTP: {token}\n\n' \
          f'If you did not request this, please disregard this email.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def send_UU_model_permission(EMAIL , s, USERNAME):
    subject = f'Permission Granted: {s} Access for {USERNAME}'
    message = f'Hi {USERNAME},\n\n' \
              f'You have been granted permission in the application: {s}.\n\n' \
              f'Thank you for using our services.\n\n' \
              f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def send_SU_EMAIL_CREATE(EMAIL , USERNAME):
    subject = f'Account Creation Confirmation for SUPERUSER {USERNAME}'
    message = message = f'Hi SUPERUSER {USERNAME},\n\n' \
          f'Your account has been successfully created.\n\n' \
          f'Thank you for joining us!\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def password_change_mail(EMAIL , USERNAME):
    subject = 'password change'
    message = f'Hi USER {USERNAME},\n\n' \
          f'Your password has been changed successfully.\n\n' \
          f'Thank you for maintaining the security of your account.\n\n' \
          f'Best regards,\nGeoPicX'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

# def mail_change_in_profile_AU_SU(EMAIL , USERNAME, result_dict, remark):
def mail_change_in_profile_AU_SU(*arg):
    subject = f'Profile Data Update Notification for USER {arg[1]}'
    message = f'Hi USER {arg[1]},\n\n' \
          f'Your profile data has been updated. The changes made are:\n\n' \
          f'{arg[2]}\n\n' \
          f'Thank you for keeping your information up-to-date.\n\n' \
          f'Remark : {arg[3]} \n\n' \
          f'Best regards,\nYour Organization'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [arg[0]]
    send_mail(subject, message, email_from, recipient_list)
    return True

def GU_resister_mail(EMAIL, USERNAME):
    subject = subject = f'Account Creation Confirmation for USER {USERNAME}'
    message = f'Hi USER {USERNAME},\n\n' \
          f'Your account has been created successfully.\n\n' \
          f'Thank you for joining us!\n\n' \
          f'Best regards,\nYour Organization'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True

def SU_Singup_link(EMAIL, PASSWORD):
    subject = subject = f'Account Singnup link GEOPIX'
    message = f'Hi USER ,\n\n' \
          f'Your account has been ready to CREATE PLEASE CONFIRM MAIL OTP {PASSWORD}\n\n' \
          f'OPT Valid For Only 5 Minute\n\n' \
          f'Thank you for joining us!\n\n' \
          f'Best regards,\nYour Organization'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True


def SU_Singup_registerlink(EMAIL, token_id, PASSWORD_SU):
    subject = subject = f'Account Singnup link GEOPIX'
    message = f'Hi USER ,\n\n' \
          f'Your account has been ready to login use  this link   http://13.232.99.245:9090/SuperUser?token=${token_id}\n\n' \
          f'Generated_password : {PASSWORD_SU}\n\n'\
          f'Thank you for joining us!\n\n' \
          f'Best regards,\nYour Organization'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [EMAIL]
    send_mail(subject, message, email_from, recipient_list)
    return True
                                                                                      

def GU_resister_mail_bravo_old(EMAIL, USERNAME):
    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
                    "sender": {
                            "name": "GoldenEye",
                            "email": "bhushan.microdev02@gmail.com"
                            },
                    "to": [
                            {
                            "email": EMAIL
                            }
                            ],
                    "subject": "General User Register",
                    "textContent":f'Hi USER {USERNAME},\n\n' \
                                  f'Your account has been created successfully.\n\n' \
                                  f'Thank you for joining us!\n\n' \
                                  f'Best regards,\nYour Organization'
                            })
    headers = {
                'accept': 'application/json',
                'api-key': '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',
                'content-type': 'application/json'
            }
    
    # response = requests.request("POST", url, headers=headers, data=payload)
    print("mail send to GU") 
    response = requests.post(url, headers=headers, data=payload)                



def register_admin_mail_bravo_old(EMAIL, USERNAME, token, them, PASSWORD):
    print("mail to AUUUUU")
    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
                    "sender": {
                            "name": "GoldenEye",
                            "email": "bhushan.microdev02@gmail.com"
                            },
                    "to": [
                            {
                            "email": EMAIL
                            }
                            ],
                    "subject": "General User Register",
                    "textContent":f'Dear Admin User ({them}),\n\n'
                    f'Your Admin User account for GeoPicX has been successfully created by our Super User.\n\n'
                    f'Below are your login details:\n'
                    f'Username: {USERNAME}\n'
                    f'temparary password: {PASSWORD}\n'
                    f'Please note, this OTP is valid for 15 minutes only and is usable only once. To complete your registration, '
                    f'please log in using the OTP within the validity period.\n\n'
                    f'use following link  http://13.232.99.245:9090/SuperUser?token=${token}\n\n'
                    f'If you encounter any issues or need further assistance, please do not hesitate to reach out to our support team.\n\n'
                    f'Best Regards,\n'
                    f'Team GeoPicX'
        
                            })
    headers = {
                'accept': 'application/json',
                'api-key': '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',
                'content-type': 'application/json'
            }
    
    # response = requests.request("POST", url, headers=headers, data=payload)
    print("mail send to AU") 
    response = requests.post(url, headers=headers, data=payload)                                                                                        


#######################################################################################################################################################################

from django.core.mail import send_mail
# django.core.mail.send_mass_mail() 
# from django.core.mail import send_mass_mail
from django.conf import settings 
import json
import requests

class Disclaimer:
    def __init__(self):
        self.disclaimer_text = (
            "<b style='font-size: 11px;'>DISCLAIMER:</b><br>"
            "<span style='font-size: 11px; line-height: 1.0; margin: 0; padding: 0;'>"
            "<i style='font-size: 10px; margin: 0; padding: 0;'>"
            "The contents of this message and any attachments are confidential and are intended solely for the attention and use of the addressee only. Information contained in this message may be subject to legal, professional, or other privilege or may otherwise be protected by other legal rules. This message should not be copied or forwarded to any other person without the express permission of the sender.<br>"
            "If you are not the intended recipient, you are not authorized to disclose, copy, distribute, or retain this message or any part of it. If you have received this message in error, <br>"
            "please notify the sender and destroy the original message. We reserve the right to monitor all e-mail messages passing through our network."
            "</i>"
            "</span><br><br>"
            "<b style='font-size: 11px;'>To know more about us:</b><br>"
            "<span style='font-size: 10px;'>Website: <a href='https://www.micronet.com'>https://www.micronet.com</a></span><br>"
            "<b style='font-size: 11px;'>Follow us on:</b><br>"
            "<span style='font-size: 10px;'>Website: <a href='https://www.micronet.com'>https://www.micronet.com</a></span><br>"
            "<span style='font-size: 10px;'>Facebook: <a href='https://www.facebook.com/micronet'>https://www.facebook.com/micronet</a></span><br>"
            "<span style='font-size: 10px;'>Twitter: <a href='https://twitter.com/micronet_geo'>https://twitter.com/micronet_geo</a></span><br>"
            "<span style='font-size: 10px;'>LinkedIn: <a href='https://www.linkedin.com/company/9999'>https://www.linkedin.com/company/9999</a></span><br>"
            "<span style='font-size: 10px;'>YouTube: <a href='https://www.youtube.com/mnsolution'>https://www.youtube.com/mnsolution</a></span><br>"
        )


    def add_disclaimer(self, email_text):
        return f"{email_text}\n\n{self.disclaimer_text}"


def SU_Singup_link_bravo(EMAIL, USERNAME, PASSWORD):

    disclaimer = Disclaimer()
    email_content = (
        f'Dear {USERNAME} (SU),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'Your creation of SuperUser(SU) account is in process.For initiating the SuperUser account creation, the following One-Time Password (OTP) is to be used:\n\n '
        f'<b>UserName –  {USERNAME}</b>\n'
        f'<b>One Time Password (OTP) - {PASSWORD}</b>\n\n'
        f'Please note, the OTP is valid for <b>15 minutes only</b> and is usable only once. If you encounter any issues or need further assistance, please do not hesitate to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": 'Installation Confirmation For GeoPicX SuperUser Account Creation',
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    if response.status_code == 201:
        print("Signup Link Email Sent To SU Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")

    return response.status_code == 201 

def SU_Singup_registerlink_bravo(EMAIL, USERNAME, token_id):
    disclaimer = Disclaimer()
    email_content =(
        # f'Subject: GeoPicX SuperUser Account Creation and Validation Process\n\n'
        f'Dear {USERNAME} (SU),\n\n'
        f"Welcome to GeoPicX GeoPortal!\n\n"
        f"Your SuperUser Account is temporarily created. This email is to inform you that a new account"
        f"creation link has been successfully generated and is send to you for validation at your end.\n\n"
        f'Please CLICK the following link and give new password during login:\n'
        f'http://13.232.99.245:9090/ChangePassword?token={token_id}\n\n'
        f"Please note that this is valid for <b>2 days</b> and can be used only once. Ensure that the intended"
        f"recipient uses the link within the validity period. If you have any queries or need further assistance,"
        f'please feel free to reach out to our  <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": "GeoPicX SuperUser Account Creation And Validation Process",
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    if response.status_code == 201:
        print("Signup Registration Link Email Sent To SU Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201

def send_SU_EMAIL_CREATE_bravo(EMAIL, USERNAME):
    disclaimer = Disclaimer()
    
    email_content = (
        # f'Subject: Welcome! Your Superuser Account has been Successfully Created\n\n'
        f'Dear {USERNAME} (SU),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'Pleased to inform you that your superuser account has been <b>Successfully Created</b>. You now have access to the system with elevated privileges, allowing you to manage and oversee key operations and manage other accounts.\n\n'
        f'<b><u>Important Security Guidelines:-</u></b>\n'
        f'<b>• Keep Your Password Secure:-</b> Do not share your password. Your account grants extensive access, so its vital that you do not share your password with anyone.\n'
        f'<b>• Always use a strong password:-</b> Ensure that your password is complex, containing a mix of letters, numbers, and special characters.\n'
        f'<b>• Change your password regularly:-</b> It is a good practice to change your password periodically to reduce the risk of unauthorized access.\n'
        f'<b>• Beware of Phishing Attacks:-</b> Be cautious of any emails or messages asking for your login credentials. Always verify the sender before clicking on links or downloading attachments.\n'
        f'<b>• Log Out After Use:-</b> Always log out of your account when you\'ve finished your session, especially if you’re using a shared or public computer.\n'
        f'<b>• Monitor Account Activity:-</b> Regularly review your account activity for any unauthorized access or unusual actions. Report any suspicious activity immediately.\n'
        f'<b>• Secure Your Devices:-</b> Ensure that the devices you use to access the system are secure, with up-to-date antivirus software, and that they are protected by a strong password or biometric lock.\n\n'
        f'If you have any questions or need further assistance, feel free to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.Welcome aboard, and thank you for your commitment to maintaining the security of the system.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": "Welcome! Your Superuser Account Has been Successfully Created",
        "textContent": email_content_with_disclaimer
    })
    
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=payload)
    
    if response.status_code == 201:
        print("Superuser Account Creation Email Sent Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201


def send_forget_password_mail_admin_brevo(EMAIL, TOKEN, USERNAME, user_type_display):
    disclaimer = Disclaimer()
    
    email_content = (
        # f'Subject: OTP for ‘Forget Password’ in GeoPicX Account\n\n'
        f'Dear {USERNAME} ({user_type_display}),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'Your account has initiated a request for changing the password through the ‘Forget Password’ process.'
        f'To activate the account’s change password process, please enter the following One-Time Password (OTP):\n\n'
        f'<b>UserName –</b> {USERNAME} ({user_type_display})\n'
        f'<b>One Time Password (OTP)- {TOKEN}</b> \n\n'
        f'Please note, the OTP is valid for <b>5 minutes only</b>  and is usable only once. If you encounter any issues or need further assistance, '
        f'please do not hesitate to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>./'
        f'Always keep your account information private and avoid sharing your login credentials with others.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    user_payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": "OTP For ‘Forget Password’ In GeoPicX Account",
        "textContent": email_content_with_disclaimer
    })

    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    user_response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=user_payload)

    if user_response.status_code == 201:
        print("Password Change OTP Email Sent To User Successfully.")
    else:
        print(f"Failed To Send Email: User Email Status {user_response.status_code}")
    
    return user_response.status_code == 201   

def password_change_mail_bravo(EMAIL, USERNAME, USER_TYPE):
    disclaimer = Disclaimer()
    
    email_content = (
    f"Dear {USERNAME} ({USER_TYPE}),\n\n"
    f"Welcome to GeoPicX GeoPortal!\n\n"
    f"Pleased to inform you that your PassWord has been <b>Successfully Changed</b>. This update enhances the security of your account, and we want to ensure that you continue to follow best practices to keep your account safe.\n\n"
    f"<b><u>Important Security Guidelines:</u></b>\n"
    f"<b>• Keep Your Password Secure:</b> Do not share your password. Your account grants extensive access, so it's vital that you do not share your password with anyone.\n"
    f"<b>• Always use a strong password:</b> Ensure that your password is complex, containing a mix of letters, numbers, and special characters.\n"
    f"<b>• Change your password regularly:</b> It is a good practice to change your password periodically to reduce the risk of unauthorized access.\n"
    f"<b>• Beware of Phishing Attacks:</b> Be cautious of any emails or messages asking for your login credentials. Always verify the sender before clicking on links or downloading attachments.\n"
    f"<b>• Log Out After Use:</b> Always log out of your account when you've finished your session, especially if you’re using a shared or public computer.\n"
    f"<b>• Monitor Account Activity:</b> Regularly review your account activity for any unauthorized access or unusual actions. Report any suspicious activity immediately.\n"
    f"<b>• Secure Your Devices:</b> Ensure that the devices you use to access the system are secure, with up-to-date antivirus software, and that they are protected by a strong password or biometric lock.\n\n"
    f"If you did not initiate this password change, please contact us immediately so we can take appropriate action. Thank you for your attention to these security measures. If you have any questions or need further assistance, please don't hesitate to reach out to our <b><a href='http://13.232.99.245:9090/ContactForm'>Support Team</a></b>.\n\n"
    f"Best Regards,\n"
    f"Team GeoPicX (Micronet Solutions, Nagpur)"
)
    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": "Your Password Has Been Successfully Changed",
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code == 201:
        print("Password Change Email Sent Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201

# def send_admin_password_mail(EMAIL):
#     # subject = 'Micronet password'
#     # message = f'Hi ,Admin :"{USERNAME}" Please use this password for login "{PASSWORD}"'
#     subject = f'Regarding Your {THEME_OPT}-Admin Login Information'
#     message = f'Hi {THEME_OPT}-Admin,\n\nUsername: {USERNAME}\nPassword: {PASSWORD}\n\nPlease use this information for login. \n\nBest regards,\nGeoPicX'
#     email_from = settings.EMAIL_HOST_USER
#     recipient_list = [EMAIL]
#     send_mail(subject, message, email_from, recipient_list)
#     return True

def block_admin_mail_bravo(EMAIL, status, USERNAME, USER_TYPE, email_au=None):
    disclaimer = Disclaimer()

    email_content = (
        f'Dear {USERNAME} ({USER_TYPE}),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'We wanted to inform you that your user account <b>{USERNAME} ({USER_TYPE})</b> has been <b>Temporarily {status}</b>. The reason for this action is administrative.\n\n'
        f'To resolve this matter and regain access to your account, please request the administration through email (to micronetdevelopers2022@gmail.com), mentioning your username.\n\n'
        f'We apologize for any inconvenience this may cause and are here to assist you. If you have any questions, feel free to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )

    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    # cc_list = [{"email": email_au}] if email_au else []
    mail_dict = {
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        # "cc": cc_list,              #[{"email": email_au}] if email_au else[],
        "subject": f"GeoPicX User Account {status}!",
        "textContent": email_content_with_disclaimer
    }
    if email_au:
        mail_dict["cc"] = [{"email":email_au}]
    payload = json.dumps(mail_dict)

    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=payload)
    
    if response.status_code == 201:
        print("User Account Block Notification Email Sent Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201

def UU_register_mail_bravo(EMAIL, USERNAME):
        disclaimer = Disclaimer()
        email_content = (
            f'Dear {USERNAME} (UU),\n\n'
            f'Welcome to GeoPicX GeoPortal!\n\n'
            f'Your AuthorizedUser account for GeoPicX has been successfully created by our AuthorizedUser.\n\n'
            f'Below are your login details:\n'
            f'<b>Username: {USERNAME} (UU)</b>\n\n'
            f'<b>Please wait for some time for your login Approval.</b>\n'
            f'If you encounter any issues or need further assistance, please do not hesitate to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
            f'Best Regards,\n'
            f"Team GeoPicX (Micronet Solutions, Nagpur)"
        )
        email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

        url = "https://api.brevo.com/v3/smtp/email"
        payload = json.dumps({
            "sender": {
                "name": "GeoPicX",
                "email": "bhushan.microdev02@gmail.com"
            },
            "to": [
                {
                    "email": EMAIL
                }
            ],
            "subject": "Account Creation Notification - GeoPicX Authorized User Account",
            "textContent": email_content_with_disclaimer
        })
        headers = {
            'accept': 'application/json',
            'api-key': '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',
            'content-type': 'application/json'
        }

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code == 201:
            print("Registration Email Sent To UU Successfully.")
        else:
            print(f"Failed To Send Email: {response.status_code}")
        
        return response.status_code == 201 

# def send_authorised_APPROVED_mail_bravo(EMAIL, USERNAME, THEME_OPT, email_au):
#     disclaimer = Disclaimer()

#     email_content = (
#         f'Dear {USERNAME} (UU),\n\n'
#         f'Welcome to GeoPicX GeoPortal!\n\n'
#         f'We are excited to inform you that your account has been successfully Approved and Created! You '
#         f'are now officially part of the GeoPicX community.\n\n'
#         f'You can start using your account immediately. Here are your login details:\n'
#         f'<b>UserName: {USERNAME}</b>\n'
#         f'<b>ThemeName: {THEME_OPT}</b>\n\n'
#         # f'<b>Modules name:{s}</b>'
#         f'We recommend that you log in at your earliest convenience. You can access your account by visiting:\n'
#         f'http://13.232.99.245:9090/Login.\n\n'
#         f'If you have any questions or need assistance with getting started, please don’t hesitate to contact our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
#         f'Thank you for joining us, and we look forward to serving you!\n\n'
#         f'Best Regards,\n'
#         f'Team GeoPicX (Micronet Solutions, Nagpur)'
#     )

#     email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

#     # Create the payload, but only include "cc" if email_au is provided
#     payload = {
#         "sender": {
#             "name": "GeoPicX",
#             "email": "bhushan.microdev02@gmail.com"
#         },
#         "to": [
#             {
#                 "email": EMAIL
#             }
#         ],
#         "subject": "GeoPicX Authorized User Account APPROVAL",
#         "textContent": email_content_with_disclaimer
#     }

#     if email_au:
#         payload["cc"] = [{"email": email_au}]  # Only add cc if email_au is provided

#     headers = {
#         'accept': 'application/json',
#         'api-key': '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',
#         'content-type': 'application/json'
#     }

#     response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=json.dumps(payload))

#     # Debugging the response
#     print(f"Response Status Code: {response.status_code}")
#     print(f"Response Text: {response.text}")

#     if response.status_code == 201:
#         print("Account approval email sent successfully.")
#         return True
#     else:
#         print(f"Failed to send approval email: {response.status_code}, Response: {response.text}")
#         return False



def send_ADMIN_APPROVED_mail_bravo(EMAIL, USERNAME, admin_type_short,email_au):
    disclaimer = Disclaimer()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    email_content = (
        f"Dear {USERNAME} ({admin_type_short}),\n\n"
        f"Welcome to GeoPicX GeoPortal!\n\n "
        f"We are pleased to inform you that your account <b>{USERNAME} ({admin_type_short})</b> has been <b>Successfully UNBLOCKED and restored</b> on {current_time}. After a thorough review, we have resolved the issue that led to the temporary block.\n\n"
        f"You should now be able to log in and access your account without any issues. We recommend that you 'update your password' and review your account activity to ensure the continued security of your account.\n\n"
        f"If you experience any further issues or have any questions, please don't hesitate to reach out to our <b><a href='http://13.232.99.245:9090/ContactForm'>Support Team</a></b>.\n\n"
        f"Thank you for your patience and understanding.\n\n"
        f"Best Regards,\n"
        f"Team GeoPicX (Micronet Solutions, Nagpur)"
)

    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    payload = ({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        # "cc": email_au,
        "subject": "GeoPicX User Account UNBLOCKED/RESTORED!",
        "textContent": email_content_with_disclaimer
    })
    if email_au:
        payload["cc"] = [{"email": email_au}]
    

    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=json.dumps(payload))
    
    if response.status_code == 201:
        print("GeoPicX User Account UNBLOCKED/RESTORED Email Sent Successfully.")
    else:
        print(f"Failed To Send Approval Email: {response.status_code}, Response: {response.text}")
    
    return response.status_code == 201

def account_rejection_mail_bravo(EMAIL, USERNAME, remark, email_au):
    disclaimer = Disclaimer()
    
    email_content = (
        f'Dear {USERNAME} (UU),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'Thank you for your interest in GeoPicX. After carefully reviewing your account creation request, '
        f'we regret to inform you that after careful observation, your account has been <b>REJECTED</b>.\n\n'
        f'The reason for this decision is not meeting our eligibility criteria.\n\n'
        f'We understand this may be disappointing news, and we encourage you to review the requirements '
        f'and reapply if you believe this was a mistake or if you can provide additional information that may '
        f'assist in the approval process.\n\n'
        f'If you have any questions or need further clarification, please feel free to contact our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>. '
        f'We are here to assist you in any way we can.\n\n'
        f'Thank you for your understanding.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )

    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    payload = {
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        # "cc":email_au,
        "subject": "GeoPicX Authorized User Account Rejection",
        "textContent": email_content_with_disclaimer
    }    
    if email_au:
        payload["cc"] = [{"email": email_au}]
    
    
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, data=json.dumps(payload))
    
    if response.status_code == 201:
        print("Account Rejection Email Sent Successfully.")
    else:
        print(f"Failed To Send Rejection Email: {response.status_code}, Response: {response.text}")
    
    return response.status_code == 201

 

def GU_to_UU_UPGRADATION_mail_bravo(EMAIL, USERNAME):
        disclaimer = Disclaimer()
        email_content = (
            f'Dear {USERNAME} (UU),\n\n'
            f'Welcome to GeoPicX GeoPortal! \n\n'
            f'We are pleased to inform you that your General User account has been successfully upgraded to a AuthorizedUser account, as per your request. Your new account status comes with additional features and benefits designed to enhance your experience with GeoPicX.\n\n'
            f'Your account will be validated by the theme Administrator in due course. Please wait till you receive the <b>APPROVAL</b> mail from the administrator.'
            f'If you have any questions about your upgraded account or need assistance with any of the new features, please don’t hesitate to reach out to our If you have any queries or need further assistance, please feel free to reach out to our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>.\n\n'
            f'Thank you for choosing GeoPicX Application. We look forward to continuing to serve you with our enhanced offerings.\n\n'
            f'Best Regards,\n'
            f'Team GeoPicX (Micronet Solutions, Nagpur)'
        )
        email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

        url = "https://api.brevo.com/v3/smtp/email"
        payload = json.dumps({
            "sender": {
                "name": "GeoPicX",
                "email": "bhushan.microdev02@gmail.com"
            },
            "to": [
                {
                    "email": EMAIL
                }
            ],
            "subject": " GeoPicX General User UPGRADATION To Authorized User",
            "textContent": email_content_with_disclaimer
        })
        headers = {
            'accept': 'application/json',
            'api-key': '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',
            'content-type': 'application/json'
        }

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code == 201:
            print("Registration Email Sent To UU Successfully.")
        else:
            print(f"Failed To Send Email: {response.status_code}")
        
        return response.status_code == 201     
    
def mass_mail_block_admin_bravo(EMAIL_LIST, USERNAME_LIST, STATUS):
    disclaimer = Disclaimer()

    for email, username in zip(EMAIL_LIST, USERNAME_LIST):
        email_content = (
            f'Dear {username} (UU),\n\n'
            f'Welcome to GeoPicX GeoPortal!\n\n'
            f'We wanted to inform you that your user account <b>{username} (UU)</b> has been <b>Temporarily {STATUS}</b>. The reason for this action is administrative.\n\n'
            f'To resolve this matter and regain access to your account, please request the administration through email (to micronetdevelopers2022@gmail.com), mentioning your username.\n\n'
            f'We apologize for any inconvenience this may cause and are here to assist you. If you have any questions, feel free to reach out to our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
            f'Best Regards,\n'
            f'Team GeoPicX (Micronet Solutions, Nagpur)'
        )

        email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            'accept': 'application/json',
            'api-key': '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',
            'content-type': 'application/json'
        }

        payload = json.dumps({
            "sender": {
                "name": "GeoPicX",
                "email": "bhushan.microdev02@gmail.com"
            },
            "to": [
                {
                    "email": email
                }
            ],
            "subject": "Important: Temporary Suspension Of Your Access To Services",
            "textContent": email_content_with_disclaimer
        })

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code != 201:
            print(f"Failed To Send Email To {email}: {response.status_code}")

    print("Mass Mail For Block Admin Sent.")
    return True

def mass_mail_unblock_admin_bravo(EMAIL_LIST, USERNAME_LIST, STATUS):
    disclaimer = Disclaimer()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for email, username in zip(EMAIL_LIST, USERNAME_LIST):
        email_content = (
        f"Dear {username} (UU),\n\n"
        f"Welcome to GeoPicX GeoPortal!\n\n "
        f"We are pleased to inform you that your account <b>{username} (UU)</b> has been <b>Successfully UNBLOCKED and restored</b> on {current_time}. After a thorough review, we have resolved the issue that led to the temporary block.\n\n"
        f"You should now be able to log in and access your account without any issues. We recommend that you 'update your password' and review your account activity to ensure the continued security of your account.\n\n"
        f"If you experience any further issues or have any questions, please don't hesitate to reach out to our <b><a href='http://13.232.99.245:9090/ContactForm'>Support Team</a></b>.\n\n"
        f"Thank you for your patience and understanding.\n\n"
        f"Best Regards,\n"
        f"Team GeoPicX (Micronet Solutions, Nagpur)"
)

        email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            'accept': 'application/json',
            'api-key': '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',
            'content-type': 'application/json'
        }

        payload = json.dumps({
            "sender": {
                "name": "GeoPicX",
                "email": "bhushan.microdev02@gmail.com"
            },
            "to": [
                {
                    "email": email
                }
            ],
            "subject": "GeoPicX User Account UNBLOCKED/RESTORED!",
            "textContent": email_content_with_disclaimer
        })

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code != 201:
            print(f"Failed To Send Email To {email}: {response.status_code}")

    print("Mass Mail For Unblock Admin Sent.")
    return True
 

def send_account_deletion_email_bravo(EMAIL, USERNAME, USER_TYPE):
    disclaimer = Disclaimer()
    email_content = (
        f'Dear {USERNAME} ({USER_TYPE}),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'We regret to inform you that your account "{USERNAME} ({USER_TYPE})" has been <b>Permanently Deleted</b>. '
        f'This action was taken due to administrative reason.\n\n'
        f'Please note that this decision is final, and all data associated with your account has been removed from our system. '
        f'Unfortunately, we will not be able to recover any information or restore the account.\n\n'
        f'If you have any questions or believe this action was taken in error, you can contact our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>. '
        f'We are here to provide any further clarification or assistance you may need.\n\n'
        f'We apologize for any inconvenience this may have caused and thank you for your understanding.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": EMAIL
            }
        ],
        "subject": "GeoPicX User Account DELETION",
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    if response.status_code == 201:
        print("Account Deletion Email Sent Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201

def mail_change_in_profile_AU_SU_brevo(*arg):
    disclaimer = Disclaimer()
    
    email_content = (
        # f"Subject: Your Account Profile has been Successfully Updated\n\n"
        f"Dear {arg[1]} ({arg[4]}),\n\n"
        f"Welcome to GeoPicX GeoPortal!\n\n"
        f"We wanted to let you know that the changes you made to your <b>Account Profile</b> "
        f"have been <b>Successfully updated</b> and saved.\n\n"
        f"For details of the changes you recently made, please review your profile to "
        f"ensure that all information is accurate and up to date.\n\n"
        f"If you did not initiate these changes, please contact us immediately so we can "
        f"investigate and take any necessary action to secure your account. Always keep your "
        f"account information private and avoid sharing your login credentials with others.\n\n"
        f"Thank you for keeping your account information up to date. If you have any questions or "
        f"need further assistance, please feel free to reach out to our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>.\n\n"
        f"Best regards,\n"
        f"Team GeoPicX (Micronet Solutions, Nagpur)"
    )
    
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [
            {
                "email": arg[0]
            }
        ],
        "subject": "Your Account Profile Has Been Successfully Updated",
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code == 201:
        print("Profile Update Notification Email Sent Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201


def register_admin_mail_bravo(EMAIL, USERNAME, token, them,admin_type_short):
    disclaimer = Disclaimer()
    print("mail to AUUUUU")
    url = "https://api.brevo.com/v3/smtp/email"
    email_content = (
                    f'Dear {USERNAME} ({admin_type_short}),\n\n'
                    f'Welcome to GeoPicX GeoPortal!\n\n'
                    f'Your ADMINUser Account is temporarily created for the theme <b>{them}</b>. This email is to inform you that a new account creation link has been successfully generated and is send to you for validation at your end.\n\n'
                    # f'<b>old Password : {PASSWORD}</b>\n\n'
                    f'Please CLICK the following link and give new password during login: http://13.232.99.245:9090/ChangePassword?token=${token} \n\n'
                    f'Please note that this is valid for <b>24 hours</b> and can be used only once. Ensure that the intended recipient uses the link within the validity period. If you have any queries or need further assistance,please feel free to reach out to our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>.\n\n'
                    f'Best Regards,\n'
                    f'Team GeoPicX (Micronet Solutions, Nagpur)'     
                    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)
    payload = json.dumps({
                    "sender": {
                            "name": "GeoPicX",
                            "email": "bhushan.microdev02@gmail.com"
                            },
                    "to": [
                            {
                            "email": EMAIL
                            }
                            ],
                    "subject": "GeoPicX ADMINUser Account Creation And Validation Process",
                    "textContent": email_content_with_disclaimer
                     })
    headers = {
                'accept': 'application/json',
                'api-key': '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',
                'content-type': 'application/json'
            }
    
    print("mail send to AU") 
    response = requests.post(url, headers=headers, data=payload)  
    if response.status_code == 201:
        print(f"User Email Sent Successfully Regarding {USERNAME}.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201    

def mail_delete_uu_to_admin_bravo(EMAIL_LIST, USERNAME, USER_TYPE, status, x, email_au=None):
    disclaimer = Disclaimer()
  
    email_content = (
        # f'Subject: GeoPicX User Account DELETION!\n\n'
        f'Dear {USERNAME} ({USER_TYPE}),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'We regret to inform you that your account {USERNAME} ({USER_TYPE}) has been <b>Permanently {status} </b> by {x}. This action was taken due to administrative reason.\n\n'
        f'Please note that this decision is final, and all data associated with your account has been removed from our system. '
        f'Unfortunately, we will not be able to recover any information or restore the account.\n\n'
        f'If you have any questions or believe this action was taken in error, you can contact our <b><a href=\'http://13.232.99.245:9090/ContactForm\'>Support Team</a></b>.'
        f'We are here to provide any further clarification or assistance you may need.\n\n'
        f'We apologize for any inconvenience this may have caused and thank you for your understanding.\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
 
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    dict_email = {
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": [{ "email": EMAIL_LIST}],  # Send to multiple recipients
        # "cc":[{"email": email_au}] if email_au else[],
        "subject": 'GeoPicX User Account DELETION',
        "textContent": email_content_with_disclaimer
    }
    if email_au:
        dict_email["cc"]=[{"email":email_au}]
    payload = json.dumps(dict_email)
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code == 201:
        print(f"User Deletion Email Sent To Admin Successfully Regarding {USERNAME}.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    # return response.status_code == 201

# def Delete_UU_mail_to_UU(EMAIL, status,USERNAME, admin_email, DELETE_BY):
#     subject = f'Important: Your Account "{USERNAME}" Status Update'
#     message = f'Hi User,\n\n' \
#           f'Your account "{USERNAME}" has been {status.lower()} and is no longer active.\n' \
#           f'Please contact the administrator at {admin_email} for further assistance.\n\n' \
#           f'This action was performed by {DELETE_BY}.\n\n' \
#           f'Thank you for using our services.\n\n' \
#           f'Best regards,\nGeoPicX'
#     email_from = settings.EMAIL_HOST_USER
#     recipient_list = [EMAIL]
#     send_mail(subject, message, email_from, recipient_list)
#     return True                                                                                      


def GU_resister_mail_bravo(EMAIL, USERNAME):
    disclaimer = Disclaimer()
    url = "https://api.brevo.com/v3/smtp/email"
    email_content = (
        f'Dear {USERNAME} (GU) ,\n\n' \
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'Your account has been created successfully.\n\n' \
        f'Thank you for joining us!\n\n' \
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'

    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)
    payload = json.dumps({
                    "sender": {
                            "name": "GeoPicX",
                            "email": "bhushan.microdev02@gmail.com"
                            },
                    "to": [
                            {
                            "email": EMAIL
                            }
                            ],
                    "subject": "General User Register",
                    "textContent":email_content_with_disclaimer
                            })
    headers = {
                'accept': 'application/json',
                'api-key': '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',
                'content-type': 'application/json'
            }
    
    # response = requests.request("POST", url, headers=headers, data=payload)
    print("Mail Send To GU") 
    response = requests.post(url, headers=headers, data=payload)    

def send_UU_model_permission_bravo(EMAIL, s, USERNAME, THEME_OPT, SU_EMAIL=None):
    disclaimer = Disclaimer()
    email_content = (
        f'Dear {USERNAME} (UU),\n\n'
        f'Welcome to GeoPicX GeoPortal!\n\n'
        f'We are excited to inform you that your account has been successfully Approved and Created! You '
        f'are now officially part of the GeoPicX community.\n\n'
        f'You can start using your account immediately. Here are your login details:\n'
        f'<b>UserName:- {USERNAME}</b>\n'
        f'<b>ThemeName:- {THEME_OPT}</b>\n'
        f'<b>Modules name:- {s}</b>\n\n'
        f'We recommend that you log in at your earliest convenience. You can access your account by visiting:\n'
        f'http://13.232.99.245:9090/Login.\n\n'
        f'If you have any questions or need assistance with getting started, please don’t hesitate to contact our <b><a href="http://13.232.99.245:9090/ContactForm">Support Team</a></b>.\n\n'
        f'Thank you for joining us, and we look forward to serving you!\n\n'
        f'Best Regards,\n'
        f'Team GeoPicX (Micronet Solutions, Nagpur)'
    )
    email_content_with_disclaimer = disclaimer.add_disclaimer(email_content)

    url = "https://api.brevo.com/v3/smtp/email"
    to_recipients = [{"email": EMAIL}]  # Add the intended user's email
    if SU_EMAIL:  # If Super User email exists, add it to the recipient list
        to_recipients.append({"email": SU_EMAIL})

    payload = json.dumps({
        "sender": {
            "name": "GeoPicX",
            "email": "bhushan.microdev02@gmail.com"
        },
        "to": to_recipients,
        "subject": "GeoPicX Authorized User Account APPROVAL",
        "textContent": email_content_with_disclaimer
    })
    headers = {
        'accept': 'application/json',
        'api-key': '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',
        'content-type': 'application/json'
    }

    response = requests.post(url, headers=headers, data=payload)
    if response.status_code == 201:
        print(f"GeoPicX Authorized User Account APPROVAL Sent To {USERNAME} And SU Successfully.")
    else:
        print(f"Failed To Send Email: {response.status_code}")
    
    return response.status_code == 201     