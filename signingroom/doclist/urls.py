from django.conf.urls import patterns, url
from .views import DocListView

urlpatterns = patterns('',
    url(r'^(?P<master_index_id>\d+)/?$', DocListView.as_view()),
)
