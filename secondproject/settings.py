from pathlib import Path
import os

# yandex api a799420a-c448-4042-bb87-b186cb5ffcab
LOGIN_URL = 'login'  # Имя URL для страницы входа
LOGIN_REDIRECT_URL = '/'  # Имя URL для перенаправления после успешного входа

LOGOUT_REDIRECT_URL = '/'
LOGOUT_URL = 'logout'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Asia/Yekaterinburg'
USE_TZ = True

DATE_INPUT_FORMATS = ['%d-%m-%Y']


def verified_callback(user):
    user.is_active = True

# удаление всех временных файлов через 24 часа после создания
SESSION_COOKIE_AGE = 86400
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_SAVE_EVERY_REQUEST = True

# For Django Email Backend
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.yandex.ru'
EMAIL_PORT = 465
EMAIL_HOST_USER = 'theroflx@yandex.ru'
EMAIL_HOST_PASSWORD = 'whespimmmanwnoxh'
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
DEFAULT_FROM_EMAIL = 'theroflx@yandex.ru'
SERVER_EMAIL = 'theroflx@yandex.ru'




AUTHENTICATION_BACKENDS = [
 'django.contrib.auth.backends.ModelBackend',
]
# SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '768144623999-ctp30fbl3junt6genop5o84snn6ovmva.apps.googleusercontent.com' # Google Consumer Key
# SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = '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' # Google Consumer Secret
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Base url to serve media files
MEDIA_URL = '/media/'

# Path where media is stored
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-gz17jzkhmz!zw3#e(eu*bqv(^6)dfs-z^(j(0ez)8y5&6+vkxc'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# mysite/settings.py
# Daphne
ASGI_APPLICATION = "secondproject.asgi.application"
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": [("127.0.0.1", 6379)],
#         },
#     },
# }

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# Application definition

INSTALLED_APPS = [
    'daphne',
    'main.apps.MainConfig',
    'Menu.apps.MenuConfig',
    'Profile.apps.ProfileConfig',
    'Cart.apps.CartConfig',
    'Banquet.apps.BanquetConfig',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_email_verification',

    "rest_framework",

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'Banquet.middleware.SessionEndMiddleware',
    'Banquet.middleware.SessionStartMiddleware',
    'Banquet.middleware.SessionExpiredMiddleware',
]

ROOT_URLCONF = 'secondproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
        ],
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

WSGI_APPLICATION = 'secondproject.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', 
        'NAME': 'my_second_db',
        'USER': 'root',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

STATICFILES_DIRS = [
    BASE_DIR / 'static'
]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
