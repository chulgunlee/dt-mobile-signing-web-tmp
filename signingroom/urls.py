"""signing_web URL Configuration

"""
from django.conf import settings
from django.conf.urls import include, url, patterns
from django.conf.urls.static import static

from .doclist.views import doc_preview_api, doc_package_api, doc_preview_page       # paul

urlpatterns = patterns('',
    url(r'^signingroom/', include('signingroom.signingroom.urls')),
    url(r'^doclist/', include('signingroom.doclist.urls')),
    url(r'^api/', include('signingroom.fakeapi.urls')),
    url(r'^api/doclist/(?P<master_index_id>\d+)/docs/(?P<doc_index_id>\d+)/preview/$', doc_preview_api),        # paul
    url(r'^api/doclist/(?P<master_index_id>\d+)/docs/(?P<doc_index_id>\d+)/page/(?P<page_number>\d+)/$', doc_preview_page),     # paul
    url(r'^api/doclist/(?P<master_index_id>\d+)$', doc_package_api),        # paul
)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT, view='django.views.static.serve')
