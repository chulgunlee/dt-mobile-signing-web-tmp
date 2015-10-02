"""signing_web URL Configuration

"""
from django.conf import settings
from django.conf.urls import include, url, patterns
from django.conf.urls.static import static

from .doclist.views import doc_preview_api, doc_package_api, doc_preview_page       # paul

urlpatterns = patterns('',
    url(r'^signingroom/', include('signingroom.signingroom.urls')),
    url(r'^dealjackets/', include('signingroom.doclist.urls')),
    url(r'^api/', include('signingroom.fakeapi.urls')),
)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
