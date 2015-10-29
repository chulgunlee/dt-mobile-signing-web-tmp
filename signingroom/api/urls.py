from django.conf.urls import patterns, include, url

from .views import DealJacketView, DocListView, DocDetailView, DocTypeListView, DocPrintView, ConsentListView, DocSubmitView

urlpatterns = patterns('',

    url(r'^dealjackets/(?P<dealjacket_id>\d+)/deals/(?P<deal_id>\d+)/', include([
        url(r'^$', DealJacketView.as_view(), name='dealjacket'),            # get the doc info in a dealjacket
        url(r'^docs/$', DocListView.as_view()),                             # get doc list only
        url(r'^docs/(?P<doc_id>\d+)/$', DocDetailView.as_view()),           # sign, preview, update, upload, delete doc
        url(r'^doctypes/$', DocTypeListView.as_view()),                     # doc types
        url(r'^printable/$', DocPrintView.as_view()),                       # get printable PDF
        url(r'^consents/?$', ConsentListView.as_view()),                    # get consent list
        url(r'^submit/?$', DocSubmitView.as_view()),                        # submit docs
    ])),
)
