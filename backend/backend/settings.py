

from pathlib import Path
import os
from datetime import timedelta
import environ
from environ import Env

env = Env(
    # set casting, default value
    DEBUG=(bool, False)
)
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# env = Env()
env.read_env(BASE_DIR / '.env')

# Assuming this file is in the root of your project directory

# Append the project root to sys.path

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-gjfyu@1-p1xr_sxj8o5$2l4$qdx81j^vw6=1$^2s)5im68ck4!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

AUTH_USER_MODEL = 'authentification.User_login_Data'

# Application definition

INSTALLED_APPS = [
    "daphne",
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'django.contrib.gis',
    'auditlog',
    'rest_framework',
    'rest_framework_gis',
    'authentification.apps.AuthentificationConfig',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'archival',
    'search',
    'layerstacking',
    'createproject',
    'rest_framework_simplejwt.token_blacklist',
]

CORS_ORIGIN_ALLOW_ALL = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',  # for session-based authentication
        'rest_framework.authentication.TokenAuthentication',    # for token-based authentication
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    
}
from rest_framework_simplejwt.settings import api_settings
# from .myapp.middleware import SuperuserMiddleware

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'authentification.middleware.log.AdminCheckMiddleware', ##imp working  
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'authentification.login_file.SuperuserMiddleware',
    # 'authentification.middleware.log.simple_middleware',
    'authentification.middleware.log.MyMiddleware',  #currrent midle    HTTPRequestResponseSerializer  RequestResponseLoggingMiddleware
    'authentification.middleware.log.myCustomMiddleware',
    # 'authentification.middleware.log.HTTPRequestResponseSerializer',
    # 'authentification.middleware.log.RequestResponseLoggingMiddleware',  #save request in log active imp      AdminCheckMiddleware
    # 'auditlog.middleware.AuditlogMiddleware',
    # 'authentification.middleware.log.TrackLoginMiddleware'
       
    
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {

    'default': {
      'ENGINE': 'django.contrib.gis.db.backends.postgis',  #django.contrib.gis.db.backends.postgis  , #django.db.backends.postgresql
        'NAME': 'GEOPICX',
        'USER': 'postgres',
        'HOST': 'localhost',
        'PASSWORD': 'Abcd@1234',
        'PORT': '5432',
    }
}
CORS_ORIGIN_WHITELIST = ['http://localhost:3000']
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Replace with the URL of your React app
    # Add other allowed origins as needed
    
]

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



# Django project settings.py

from datetime import timedelta
...

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}








# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'bhushan.microdev02@gmail.com'
EMAIL_HOST_PASSWORD = 'rwkj sexm bzjp htmc'
EMAIL_USE_TLS = True

AUDITLOG_INCLUDE_ALL_MODELS=True

# django-auditlog
# Mailtrap Email Sending,
#django-simple-history
#Simple-history
# ==================================logs impliment======================
import os

import logging
from django.utils.log import DEFAULT_LOGGING

DJANGO_DB_LOGGER_ENABLE_FORMATTER = True

# LOGGING = DEFAULT_LOGGING.copy()

# LOGGING['formatters']['db'] = {
#     'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
# }

# LOGGING['handlers']['database'] = {
#     'level': 'DEBUG',
#     'class': 'authentification.handler_log.DatabaseLogHandler',  # Ensure this is the correct path
#     'formatter': 'db',
# }

# LOGGING['loggers']['django'] = {
#     'handlers': ['console', 'database'],
#     'level': 'DEBUG',
#     'propagate': True,
# }



import os
from django.conf import settings

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'simple': {
#             'format': '{asctime}:{levelname} - {name} {module}.py (line {lineno:d}). {message}',
#             'style': '{',
#         },
#         'verbose': {
#             'format': '{asctime}:{levelname} - {name} {module}.py (line {lineno:d}). {message}',
#             'style': '{',
#         },
#         'db': {
#             'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#         },
#     },
#     'handlers': {
#         'file': {
#             'class': 'logging.FileHandler',
#             'filename': os.getenv('DJANGO_LOG_FILE', 'general.log'),  # Fallback to 'general.log' if not specified
#             'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),  # Fallback to 'DEBUG' if not specified
#             'formatter': 'verbose',
#         },
#         'console': {
#             'class': 'logging.StreamHandler',
#             'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),  # Fallback to 'DEBUG' if not specified
#             'formatter': 'simple',
#         },
#         'database': {
#             'level': 'DEBUG',
#             'class': 'authentification.handler_log.DatabaseLogHandler',
#             'formatter': 'db',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console', 'file', 'database'],
#             'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
#             'propagate': True,
#         },
#         # Add other loggers as needed
#     },
# }








# LOGGING = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "handlers": {
#         "file": {
#             "class": "logging.FileHandler",
#             "filename":env('DJANGO_LOG_FILE'),     #"general.log",
#             "level":env('DJANGO_LOG_LEVEL'),   #"DEBUG",
#             "formatter": "verbose"   #simple
#         },
        
#         "console": {
#             "class": "logging.StreamHandler",
#             "level":env('DJANGO_LOG_LEVEL'),            #"DEBUG",
#             "formatter": "simple"
#         },
#         'database': {
#                     'level': 'DEBUG',
#                     'class': 'authentification.handler_log.DatabaseLogHandler',  # Ensure this is the correct path
#                     'formatter': 'db',
#                 },
#     },
#     "loggers":{
#         "":{
#             'handlers': ['console', 'database'],
#             'level': 'DEBUG',
#             'propagate': True,
#         },

#     },

#     "formatters": {
#         "simple": {
#             "format": "{asctime}:{levelname} - {name} {module}.py (line {lineno:d}). {message}",
#             "style" : "{"
#         },
#         "verbose": {
#             "format": "{asctime}:{levelname} - {name} {module}.py (line {lineno:d}). {message}",
#             "style": "{",
#         },
#         'db': {
#             'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
#         },
#     }
# }

SESSION_COOKIE_AGE = 7200

MEDIA_ROOT = BASE_DIR /"media"
MEDIA_URL="/media/"
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = None  # Required for cross-origin requests
SESSION_COOKIE_NAME = "sessionid" 


# GDAL_LIBRARY_PATH = os.path.join(BASE_DIR, "Geopicx_Env", "Lib", "site-packages", "osgeo", "gdal.dll")
# GEOS_LIBRARY_PATH = os.path.join(BASE_DIR, "Geopicx_Env", "Lib", "site-packages", "osgeo", "geos_c.dll")
# GDAL_LIBRARY_PATH = r"C:\OSGeo4W\bin\gdal308.dll"
# GEOS_LIBRARY_PATH = r"C:\OSGeo4W\bin\geos_c.dll"


# (my_geopix)
api_settings.USER_ID_FIELD = 'USERID'
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
DATA_UPLOAD_MAX_MEMORY_SIZE = None


# settings.py

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}


CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0' #port 0
CELERY_TIMEZONE = "Asia/Kolkata"
# CELERY_TASK_TRACK_STARTED = True
# CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
SESSION_COOKIE_NAME = 'sessionid'


# CORS_ALLOW_HEADERS = [
#     'content-type',  # Allow Content-Type header
#     'accept',        # Allow Accept header
#     'authorization', # Allow Authorization header (for example, for JWT tokens)
#     'X-Requested-With', # If you're sending requests from a JavaScript client
#     # Add other headers you might need to send in your requests
# ]
SESSION_COOKIE_SAMESITE = "None"  # Required for cross-origin cookies
SESSION_COOKIE_SECURE = False     # False for HTTP, True for HTTPS
CSRF_COOKIE_SAMESITE = "None"     # Same as session cookie
CSRF_COOKIE_SECURE = False        # False for HTTP, True for HTTPS
CORS_ALLOW_CREDENTIALS = True 


CELERY_TASK_IGNORE_RESULT = True  
CELERY_RESULT_BACKEND = None
