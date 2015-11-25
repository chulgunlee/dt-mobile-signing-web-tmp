import mock

from mock import MagicMock, Mock
from rest_framework import status
from rest_framework.reverse import reverse
from tests.test_bases import SigningWebUnitTest
from dt_django_base.core.test_bases import DRFApiMixin
from signingroom.api.views import DocTypeListView


@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocTypeListView(DRFApiMixin, SigningWebUnitTest):

    def setUp(self):
        super(TestDocTypeListView, self).setUp()
        self.view = DocTypeListView.as_view()

        self.url_name = 'doctypes'
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

    def test_doctypes_get_success(self, mock_get_doccenter_api):

        # generate test request
        request = self._make_request()

        # mock backend services
        mock_get_doccenter_api.return_value.type_choices.return_value = self.load_json('doccenter_type_choices.json')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)
        
        # assert http status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # assert doc types
        result = response.data
        self.assertTrue('docTypes' in result)

        doctypes = result.get('docTypes')
        self.assertDictEqual(doctypes[0], {u'code': u'contract', u'name': u'Contract'})
        self.assertDictEqual(doctypes[1], {u'code': u'contract_addendum', u'name': u'Contract Addendum'}),
        self.assertDictEqual(doctypes[2], {u'code': u'cosignor_notice', u'name': u'CoSignor Notice'}),
        self.assertDictEqual(doctypes[3], {u'code': u'credit_application', u'name': u'Credit Application'}),
        self.assertDictEqual(doctypes[4], {u'code': u'gps_form', u'name': u'GPS Form'}),
        self.assertDictEqual(doctypes[5], {u'code': u'tire_wheel', u'name': u'Tire Wheel'}),
        self.assertDictEqual(doctypes[6], {u'code': u'auto_pay_form', u'name': u'Auto-Pay Form'}),
        self.assertDictEqual(doctypes[7], {u'code': u'unknown', u'name': u'Unknown'})

