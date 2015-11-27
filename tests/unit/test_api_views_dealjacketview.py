import mock
import json

from mock import MagicMock, Mock
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.response import Response
from tests.test_bases import SigningWebUnitTest
from dt_django_base.core.test_bases import DRFApiMixin
from signingroom.api.views import DealJacketView
from signingroom.lib.service_base import *          # NOQA


@mock.patch('signingroom.api.views.get_doccenter_api')
@mock.patch('signingroom.api.views.get_dtmobile')
class TestDealJacketViewGet(DRFApiMixin, SigningWebUnitTest):
    
    def setUp(self):
        super(TestDealJacketViewGet, self).setUp()
        self.view = DealJacketView.as_view()

        self.url_name = 'dealjacket'
        self.dealjacket_id = '1'
        self.deal_id = '2'

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id})

    def tearDown(self):
        pass

    def _make_request(self):
        request = self.request_factory.get(
            path=self.path,
            format='json',
        )
        request.context_data = self.CONTEXT

        return request


    
    def test_dealjacket_get_success(self, mock_get_dtmobile, mock_get_doccenter_api):
        
        # generate test request
        request = self._make_request()

        # mock backend services
        mock_get_dtmobile.return_value.get_dealjacket_summary.return_value = self.load_json('dtmobile_get_dealjacket.json')
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.return_value = self.load_json('doccenter_get_docs_by_dj_id.json')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)
        
        # assert http status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # assert signer names
        result = response.data
        self.assertEqual(result.get('id'), self.deal_id)
        self.assertEqual(result.get('dealJacketId'), self.dealjacket_id)
        self.assertDictContainsSubset({'buyer': {'firstName': 'app_first_nm', 'lastName': 'app_last_nm'}, 'cobuyer': {'firstName': 'coapp_first_nm', 'lastName': 'coapp_last_nm'}}, result.get('signers'))

        # assert doc attributes
        self.assertEqual(len(result.get('docs', [])), 3)

        doc = result.get('docs')[0]
        self.assertDictContainsSubset({
            'id': 161,
            'docType': 'contract',
            'templateName': 'eContract',
            'requiredForFunding': True,
            'signable': True,
            'status': 'signed',
            'signStatus': {
                'buyer': True,
                'cobuyer': False,
                'dealer': True,
            },
            'isExternal': False,
        }, doc)



    def test_dealjacket_get_fail_summary_404(self, mock_get_dtmobile, mock_get_doccenter_api):
        "Test when the get dj summary failed"

        request = self._make_request()

        mock_get_dtmobile.return_value.get_dealjacket_summary.side_effect = NotFound('Not Found')
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.return_value = self.load_json('doccenter_get_docs_by_dj_id.json')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # assert signer names
        #result = response.data
        #self.assertDictContainsSubset({'buyer': 'Applicant', 'cobuyer': 'Co-Applicant'}, result.get('signers'))

    def test_dealjacket_get_fail_summary_500(self, mock_get_dtmobile, mock_get_doccenter_api):
        "Test when the get dj summary failed"
        request = self._make_request()

        mock_get_dtmobile.return_value.get_dealjacket_summary.side_effect = InternalServerError('Internal server error')
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.return_value = self.load_json('doccenter_get_docs_by_dj_id.json')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # assert signer names
        #result = response.data
        #self.assertDictContainsSubset({'buyer': 'Applicant', 'cobuyer': 'Co-Applicant'}, result.get('signers'))

    def test_dealjacket_get_fail_doclist_404(self, mock_get_dtmobile, mock_get_doccenter_api):
        "Test when the get doc list failed"
        request = self._make_request()

        mock_get_dtmobile.return_value.get_dealjacket_summary.return_value = self.load_json('dtmobile_get_dealjacket.json')
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.side_effect = NotFound('Not Found')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # assert error msg
        result = response.data
        self.assertDictContainsSubset({'status_code': 404, 'message': 'Not Found'}, result)

    def test_dealjacket_get_fail_doclist_500(self, mock_get_dtmobile, mock_get_doccenter_api):
        "Test when the get doc list failed"
        request = self._make_request()

        mock_get_dtmobile.return_value.get_dealjacket_summary.return_value = self.load_json('dtmobile_get_dealjacket.json')
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.side_effect = InternalServerError('Internal Server Error')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # assert error msg
        result = response.data
        self.assertDictContainsSubset({'status_code': 500, 'message': 'Internal Server Error'}, result)
