import mock
import json

from mock import Mock
from urllib import urlencode
from rest_framework.reverse import reverse
from dt_django_base.core.test_bases import DRFApiMixin
from tests.test_bases import SigningWebUnitTest
from signingroom.api.views import DocDetailView
from signingroom.lib.service_base import *           # NOQA

@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocDetailViewGet(DRFApiMixin, SigningWebUnitTest):
    
    def setUp(self):
        super(TestDocDetailViewGet, self).setUp()
        self.view = DocDetailView.as_view()

        self.url_name = 'docdetail'
        self.dealjacket_id = 1
        self.deal_id = 2
        self.doc_id = 3
        self.version_cd = 'F'

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id, 'doc_id': self.doc_id})
        self.ret = {
            'total_pages': 2,
            'results': [
                { 'PageNo': 1, 'Value': 'a' },
                { 'PageNo': 2, 'Value': 'b' },
            ]
        }


        # mock objects
        self.mock_get_docs_by_dj_id = Mock()
        self.mock_get_docs_by_dj_id.return_value = [
            {
                'document_index_id': 2,
                'latest_doc_version_cd': 'I',
            },
            {
                'document_index_id': 3,
                'latest_doc_version_cd': 'F',
            },
        ]

        self.mock_background_images = Mock()
        self.mock_background_images.return_value = self.ret

    def tearDown(self):
        pass

    def _make_get_request(self, params=None):
        if params is not None:
            path = '%s?%s' % (self.path, urlencode(params))
        else:
            path = self.path

        request = self.request_factory.get(
            path=path,
            format='json',
        )
        request.context_data = self.CONTEXT

        return request

    def test_get_preview_with_version_cd(self, mock_get_doccenter_api):
        mock_get_doccenter_api.return_value.get_docs_by_dj_id = self.mock_get_docs_by_dj_id
        mock_get_doccenter_api.return_value.background_images = self.mock_background_images

        request = self._make_get_request(params={'version': self.version_cd})
        response = self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)
        result = response.data

        self.mock_background_images.assert_called_with(self.doc_id, 'F')
        self.mock_get_docs_by_dj_id.assert_not_called()

        self.assertDictEqual(result, {'id': self.doc_id, 'version': 'F', 'pages': ['a', 'b']})

    def test_get_preview_without_version_cd(self, mock_get_doccenter_api):
        mock_get_doccenter_api.return_value.get_docs_by_dj_id = self.mock_get_docs_by_dj_id
        mock_get_doccenter_api.return_value.background_images = self.mock_background_images

        request = self._make_get_request()
        response = self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)
        result = response.data

        self.mock_background_images.assert_called_with(self.doc_id, 'F')
        self.mock_get_docs_by_dj_id.assert_called_with(self.dealjacket_id)

        self.assertDictEqual(result, {'id': self.doc_id, 'version': 'F', 'pages': ['a', 'b']})
        
