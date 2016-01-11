import mock

from mock import Mock
from rest_framework.reverse import reverse
from dt_django_base.core.test_bases import DRFApiMixin
from tests.test_bases import SigningWebUnitTest
from signingroom.api.views import DocDetailView
from signingroom.lib.service_base import *           # NOQA


@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocDetailViewDelete(DRFApiMixin, SigningWebUnitTest):

    def setUp(self):
        super(TestDocDetailViewDelete, self).setUp()
        self.view = DocDetailView.as_view()

        self.url_name = 'docdetail'
        self.dealjacket_id = 1
        self.deal_id = 2
        self.doc_id = 3

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id, 'doc_id': self.doc_id})

        # mock objects
        self.destroy_document = Mock()

    def tearDown(self):
        pass

    def _make_delete_request(self, params=None):

        request = self.request_factory.delete(
            path=self.path,
            format='json',
        )
        request.context_data = self.CONTEXT

        return request

    def test_delete_document_ok(self, mock_delete_doccenter_api):
        mock_delete_doccenter_api.return_value.destroy_document = self.destroy_document

        request = self._make_delete_request()
        response = self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)

        self.destroy_document.assert_called_with(self.doc_id)
        self.assertEqual(response.status_code, 204)

    def test_delete_document_404(self, mock_delete_doccenter_api):
        mock_delete_doccenter_api.return_value.destroy_document = self.destroy_document
        self.destroy_document.side_effect = NotFound()

        request = self._make_delete_request()
        response = self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)

        self.destroy_document.assert_called_with(self.doc_id)
        self.assertEqual(response.status_code, 404)
