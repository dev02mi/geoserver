from django.apps import AppConfig
from django.core.management import call_command
import os
import sys
class AuthentificationConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'authentification'

    def ready(self):
        # Run the custom command to create the token
        if os.environ.get('RUN_CREATE_TOKEN_COMMAND') != 'true':
            os.environ['RUN_CREATE_TOKEN_COMMAND'] = 'true'
            if 'makemigrations' not in sys.argv and 'migrate' not in sys.argv:
                if "CREATESUPERUSER" in sys.argv:
                    sys.argv.remove('CREATESUPERUSER')
                    call_command('create_token')
                    # sys.argv.remove('CREATESUPERUSER')
            
       