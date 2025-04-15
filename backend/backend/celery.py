import os
from time import sleep
from celery import Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task
def add(x,y):
    sleep(20)
    return x + y


#shedule code
# app.conf.beat_schedule = {
#     'every-10-seconds': {
#         'task': 'myapp.tasks.clear_session_cache',
#         'schedule': 10.0,
#         'args': ("14545",)
#     }
# }