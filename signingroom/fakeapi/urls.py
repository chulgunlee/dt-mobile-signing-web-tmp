from django.conf.urls import patterns, include, url
from .views import *


urlpatterns = patterns('',

    url(r'^packages/(?P<pkg_id>\d+)/?$', DocPackageView.as_view()),
    url(r'^packages/(?P<pkg_id>\d+)/print/?$', DocPackagePrintView.as_view()),
    url(r'docs/(?P<doc_id>\d+)/preview/?$', DocPreviewView.as_view()),
    url(r'docs/(?P<doc_id>\d+)/print/?$', DocPrintView.as_view()),
    url(r'docs/(?P<doc_id>\d+)/?$', DocUpdateView.as_view()),
    url(r'doctypes/?$', DocTypeListView.as_view()),
    url(r'packages/(?P<pkg_id>\d+)/submit/?$', DocPackageSubmitView.as_view()),

    url(r'signingroom/(?P<pkg_id>\d+)/docs/(?P<doc_id>\d+)/?$', SigningRoomInitView.as_view()),
    url(r'signingroom/(?P<pkg_id>\d+)/docs/(?P<doc_id>\d+)/signatures/(?P<signer_type>\w+)/$', SigningRoomSigView.as_view()),
    url(r'signingroom/(?P<pkg_id>\d+)/consents/(?P<signer_type>\w+)/$', SigningRoomConsentView.as_view()),
)
