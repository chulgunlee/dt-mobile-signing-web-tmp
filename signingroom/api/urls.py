from django.conf.urls import patterns, include, url

from .views import *


urlpatterns = patterns('',

    # get info from dealjacket
    url(r'^dealjackets/(?P<dealjacket_id>\d+)/deals/(?P<deal_id>\d+)/?$', DealJacketView.as_view()),                         # get package info

    # doc packages views
    url(r'^packages/(?P<pkg_id>\d+)/?$', PackageDetailView.as_view()),                        # get package detail (doc list)
    url(r'^packages/(?P<pkg_id>\d+)/docs/(?P<doc_id>\d+)/?$', DocDetailView.as_view()),       # sign, preview, update, upload, delete doc
    url(r'^packages/(?P<pkg_id>\d+)/doctypes/?$', DocTypeListView.as_view()),                 # doc types
    url(r'^packages/(?P<pkg_id>\d+)/printable/?$', DocPrintView.as_view()),                   # get printable PDF
    url(r'^packages/(?P<pkg_id>\d+)/consents/?$', ConsentListView.as_view()),                 # get consent list
    url(r'^packages/(?P<pkg_id>\d+)/submit/?$', DocSubmitView.as_view()),                     # submit docs
)

