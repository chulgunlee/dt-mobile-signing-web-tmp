"""signing_web URL Configuration

"""
from django.conf import settings
from django.conf.urls import include, url, patterns
from django.conf.urls.static import static

urlpatterns = patterns('',
    url(r'^signingroom/', include('signingroom.signingroom.urls')),
    url(r'^doclist/', include('signingroom.doclist.urls')),
)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT, view='django.views.static.serve')
