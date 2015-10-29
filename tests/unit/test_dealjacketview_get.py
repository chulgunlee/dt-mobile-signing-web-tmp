import mock
import json

from rest_framework.reverse import reverse
from rest_framework.response import Response
from tests.test_bases import SigningWebUnitTest
from dt_django_base.core.test_bases import DRFApiMixin
from signingroom.api.views import DealJacketView


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

    
    def test_dealjacket_get_success(self, mock_get_dtmobile):
        
        # generate test request
        request = self.request_factory.get(
            path=self.path,
            format='json',
        )
        request.context_data = self.CONTEXT

        # mock dtmobile request
        mock_get_dtmobile.return_value.get_dealjacket_summary.return_value = Response(self.load_json('dtmobile_get_dealjacket.json'))

        response = self.view(request, self.dealjacket_id, self.deal_id)

    def test_dealjacket_get_fail_summary_404(self, mock_get_dtmobile):
        "Test when the get dj summary failed"
        pass

    def test_dealjacket_get_fail_summary_500(self, mock_get_dtmobile):
        "Test when the get dj summary failed"
        pass

    def test_dealjacket_get_fail_doclist_404(self, mock_get_dtmobile):
        "Test when the get doc list failed"
        pass

    def test_dealjacket_get_fail_doclist_500(self, mock_get_dtmobile):
        "Test when the get doc list failed"
        pass

