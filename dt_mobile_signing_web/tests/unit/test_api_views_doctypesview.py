import mock

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
        self.assertDictEqual(doctypes[0], {u'code': u'contract', u'name': u'Contract', u'isExternal': True})
        self.assertDictEqual(doctypes[1], {u'code': u'contract_addendum', u'name': u'Contract Addendum', u'isExternal': True}),
        self.assertDictEqual(doctypes[2], {u'code': u'cosignor_notice', u'name': u'CoSignor Notice', u'isExternal': False}),
