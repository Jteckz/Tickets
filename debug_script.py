import os
import sys
import traceback

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tickets.settings')

try:
    import django
    django.setup()
    from core import views
    print('Success')
except Exception:
    with open('error.log', 'w') as f:
        traceback.print_exc(file=f)
    print("Error occurred, check error.log")
