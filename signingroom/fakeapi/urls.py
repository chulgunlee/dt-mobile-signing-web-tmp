from django.conf.urls import patterns, include, url
from .views import *


urlpatterns = patterns('',

    url(r'^doclist/(?P<pkg_id>\d+)/?$', DocListView.as_view()),
)
