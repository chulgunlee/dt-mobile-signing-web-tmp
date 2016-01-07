"""signing_web URL Configuration

"""
from django.conf import settings
from django.conf.urls import include, patterns, url
from django.conf.urls.static import static

from .doclist.views import DocListView


urlpatterns = patterns(
    '',
    url(r'^', include('dt_django_base.healthcheck.urls', namespace='healthcheck', app_name='dt-mobile-signing-web')),
    url(r'^signingroom/', include('signingroom.signingroom.urls')),
    url(r'^dealjackets/(?P<dealjacket_id>\d+)/deals/(?P<deal_id>\d+)/$', DocListView.as_view()),
    url(r'^api/', include('signingroom.api.urls')),
)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
