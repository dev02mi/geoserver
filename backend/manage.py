#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    if len(sys.argv) > 1 and sys.argv[1] == 'createsuperuser':
        print("Ignoring 'createsuperuser' command.")
        return
    try:
        from django.core.management import execute_from_command_line
        # if len(sys.argv) > 1 and sys.argv[1] == 'createsuperuser':
        # # Ignore the 'createsuperuser' command  from django.core.management import execute_from_command_line
        #     print("Ignoring 'createsuperuser' command.")
        #     raise ImportError("This command is not usable.")
        # else:
        #     execute_from_command_line(sys.argv)
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
