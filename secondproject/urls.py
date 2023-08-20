from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django_email_verification import urls as email_urls

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('main.urls')),
    path('menu/', include('Menu.urls')),
    path('profile/', include('Profile.urls')),
    path('cart/', include('Cart.urls')),
    path('banquet/', include('Banquet.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
