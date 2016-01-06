import mock

from mock import Mock
from rest_framework.reverse import reverse
from dt_django_base.core.test_bases import DRFApiMixin
from tests.test_bases import SigningWebUnitTest
from signingroom.api.views import DocDetailView
from signingroom.lib.service_base import *           # NOQA


@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocDetailViewPut(DRFApiMixin, SigningWebUnitTest):

    def setUp(self):
        super(TestDocDetailViewPut, self).setUp()
        self.view = DocDetailView.as_view()

        self.url_name = 'docdetail'
        self.dealjacket_id = '1'
        self.deal_id = '2'
        self.doc_id = 3

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id, 'doc_id': self.doc_id})

    def tearDown(self):
        pass

    def _make_put_request(self, data):
        request = self.request_factory.put(
            path=self.path,
            format='json',
            data=data,
        )
        request.context_data = self.CONTEXT

        return request

    def test_update_fund_in_true_success(self, mock_get_doccenter_api):

        data = {'requiredForFunding': True}
        request = self._make_put_request(data)

        update_funding_in = Mock(return_value=None)

        mock_get_doccenter_api.return_value.update_funding_in = update_funding_in
        self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)

        update_funding_in.assert_called_with(self.doc_id, True)

    def test_update_fund_in_false_success(self, mock_get_doccenter_api):

        data = {'requiredForFunding': False}
        request = self._make_put_request(data)

        update_funding_in = Mock(return_value=None)

        mock_get_doccenter_api.return_value.update_funding_in = update_funding_in
        self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)

        update_funding_in.assert_called_with(self.doc_id, False)

    def test_update_fund_in_fail(self, mock_get_doccenter_api):
        data = {'requiredForFunding': False}
        request = self._make_put_request(data)

        update_funding_in = Mock(side_effect=InternalServerError)

        mock_get_doccenter_api.return_value.update_funding_in = update_funding_in
        response = self.view(request, self.dealjacket_id, self.deal_id, self.doc_id)

        self.assertEqual(response.status_code, 500)
