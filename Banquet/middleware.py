from django.utils.deprecation import MiddlewareMixin
from django.contrib.sessions.models import Session
from django.db.models.signals import post_delete, post_save
from .signals import session_end_signal, session_started_signal
from django.utils import timezone
from django.contrib.auth.models import User
from Banquet.models import *
from Cart.models import *
from Banquet.models import *

class SessionEndMiddleware(MiddlewareMixin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        post_delete.connect(self.session_end_handler, sender=Session)

    def session_end_handler(self, sender, instance, **kwargs):
        session_end_signal.send(sender=sender, session=instance)


class SessionStartMiddleware(MiddlewareMixin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        post_save.connect(self.session_started_handler, sender=Session)

    def session_started_handler(self, sender, instance, created, **kwargs):
        if created:
            session_started_signal.send(sender=sender, session=instance)


class SessionExpiredMiddleware(MiddlewareMixin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def process_request(self, request):
        # Убедитесь, что истекшие сессии очищаются перед обработкой каждого запроса
        data_to_delete = Session.objects.filter(expire_date__lt=timezone.now())
        for object in data_to_delete:
            try:
                user_to_delete = User.objects.get(username=object.session_key)
                user_to_delete.delete()
            except User.DoesNotExist:
                pass


        Session.objects.filter(expire_date__lt=timezone.now()).delete()

    def process_response(self, request, response):
        return response

    def process_exception(self, request, exception):
        pass