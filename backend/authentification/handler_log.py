import logging
from django.apps import apps
from django.conf import settings

class DatabaseLogHandler(logging.Handler):
    
    def emit(self, record):
        Logs_LogEntry = apps.get_model('authentification', 'Logs_LogEntry')  # Use the correct app name
       

        trace = None

        if record.exc_info:
            trace = self.formatException(record.exc_info)

        if getattr(settings, 'DJANGO_DB_LOGGER_ENABLE_FORMATTER', False):
            msg = self.format(record)
        else:
            msg = record.getMessage()
         # Assuming additional data is passed via extra
        # response_status = getattr(record, 'response_status', None)
        # response_data = getattr(record, 'response_data', None)

        try:
            log_entry = Logs_LogEntry(
                level=record.levelname,
                message=msg,
                pathname=record.pathname,
                func_name=record.funcName,
                line_no=record.lineno,
                exc_info=trace
                # response_status=response_status,
                # response_data=response_data
            )
            log_entry.save()
        except Exception as e:
            # pass
            # Handle the exception (e.g., log it to a file or standard error)
            logging.error(f"Failed to save log entry: {e}")

    def format(self, record):
        if self.formatter:
            fmt = self.formatter
        else:
            fmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        if isinstance(fmt, logging.Formatter):
            record.message = record.getMessage()

            if fmt.usesTime():
                record.asctime = fmt.formatTime(record, fmt.datefmt)

            return fmt.formatMessage(record)
        else:
            return fmt.format(record)
        
    def formatException(self, exc_info):
        """Format and return the exception information."""
        if self.formatter:
            return self.formatter.formatException(exc_info)
        return logging.Formatter().formatException(exc_info)
