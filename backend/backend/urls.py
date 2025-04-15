from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentification.urls')),
    path('archival/', include('archival.urls')),
    path('search/', include('search.urls')),

    path('layerstacking/', include('layerstacking.urls')),
    path('createproject/', include('createproject.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #not run
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]

if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)

