import mock

from mock import Mock
from rest_framework import status
from dt_django_base.core.test_bases import DRFApiMixin
from rest_framework.reverse import reverse
from tests.test_bases import SigningWebUnitTest
from signingroom.api.views import DocPrintView
from requests.structures import CaseInsensitiveDict

@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocPrintView(DRFApiMixin, SigningWebUnitTest):

    def setUp(self):
        super(TestDocPrintView, self).setUp()
        self.view = DocPrintView.as_view()

        self.url_name = 'printable'
        self.dealjacket_id = '1'
        self.deal_id = '2'

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id})

    def tearDown(self):
        pass

    def _make_request(self):
        request = self.request_factory.get(
            path=self.path,
        )
        request.context_data = self.CONTEXT

        return request


    def test_printable_get_success(self, mock_get_doccenter_api):

        pdf = 'PDF_CONTENT'
        # generate test request
        request = self._make_request()

        # mock backend services
        resp = Mock()
        resp.headers = CaseInsensitiveDict()
        resp.headers['Content-Disposition'] = 'filename="document.pdf"'
        resp.status_code = 200

        resp.content= pdf

        mock_get_doccenter_api.return_value.merged_pdf.return_value = resp

        response = self.view(request, self.dealjacket_id, self.deal_id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, pdf)

        self.assertEqual(response.get('Content-Disposition'), 'filename="document.pdf"')


    def test_printable_get_filename_failsafe(self, mock_get_doccenter_api):

        pdf = 'PDF_CONTENT'
        # generate test request
        request = self._make_request()

        # mock backend services
        resp = Mock()
        resp.headers = CaseInsensitiveDict()
        resp.status_code = 200

        resp.content= pdf

        mock_get_doccenter_api.return_value.merged_pdf.return_value = resp

        request.GET = dict(docids="1,2,3")

        response = self.view(request, self.dealjacket_id, self.deal_id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, pdf)

        self.assertEqual(response.get('Content-Disposition'), 'filename="1_2_3_documents.pdf"')

