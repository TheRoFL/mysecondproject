from django.db.models.signals import Signal

session_end_signal = Signal()
session_started_signal = Signal()
session_expired_signal = Signal()

def session_end_handler(sender, **kwargs):
    session = kwargs.get('session')
    if session:
        session_key = session.session_key
        print(f"Сессия завершилась. ID сессии: {session_key}")
    else:
        print("Сессия завершилась, но не удалось получить ID сессии.")


def session_started_handler(sender, **kwargs):
    session = kwargs.get('session')
    if session:
        session_key = session.session_key
        print(f"Новая сессия создана. ID сессии: {session_key}")
    else:
        print("Сессия создана, но не удалось получить ID сессии.")


def session_expired_handler(sender, **kwargs):
    session = kwargs.get('session')
    if session:
        session_key = session.session_key
        print(f"Сессия истекла. ID сессии: {session_key}")
    else:
        print("Истекла сессия, но не удалось получить ID сессии.")


session_expired_signal.connect(session_expired_handler)
session_end_signal.connect(session_end_handler)
session_started_signal.connect(session_started_handler)