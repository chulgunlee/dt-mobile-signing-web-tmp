from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from .views import SigningRoomView

urlpatterns = patterns('',
    url(r'^(?P<master_index_id>\d+)/?$', SigningRoomView.as_view()),
    url(r'^terms/', TemplateView.as_view(template_name='terms.html')),
    url(r'^thankyou/', TemplateView.as_view(template_name='thankyou.html')),
)
