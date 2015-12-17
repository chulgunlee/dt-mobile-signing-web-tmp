import mock
import json

from mock import Mock
from tests.test_bases import SigningWebUnitTest

from signingroom.lib.doccenter_api import *
from signingroom.lib.service_base import *
from rest_framework.exceptions import APIException


class TestDocCenterService(SigningWebUnitTest):
    
    def setUp(self):
        super(TestDocCenterService, self).setUp()
        self.context = { 
            'dealer_code': 12345,
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }
        self.test_service = DocCenterService(self.context)

    def tearDown(self):
        pass

    @mock.patch.object(DocCenterService, 'post', return_value=None)
    def test_get_docs_by_dj_id(self, mock_post):
        self.test_service.get_docs_by_dj_id(1)
        mock_post.assert_called_with('/docs/list-by-exttrans-id/', data={'ext_id': 1})
        
    @mock.patch.object(DocCenterService, 'post', side_effect=APIException, return_value=None)
    def test_get_docs_by_dj_id(self, mock_post):
        result = self.test_service.get_docs_by_dj_id(1)
        self.assertListEqual(result, [])
        
    @mock.patch.object(DocCenterService, 'put', return_value=None)
    def test_update_funding_in(self, mock_put):
        result = self.test_service.update_funding_in(1, True)
        mock_put.assert_called_with('/docs/1/funding-in/', data={'needed_for_funding':True})

        result = self.test_service.update_funding_in(2, False)
        mock_put.assert_called_with('/docs/2/funding-in/', data={'needed_for_funding':False})

    @mock.patch.object(DocCenterService, 'get')
    def test_type_choices(self, mock_get):
        ret = self.load_json('doccenter_type_choices.json')
        mock_get.return_value = ret

        result = self.test_service.type_choices()
        mock_get.assert_called_with('/templates/type-choices/')
        self.assertListEqual(ret, result)

    @mock.patch.object(DocCenterService, 'get')
    def test_signers_200(self, mock_get):
        ret = ['buyer', 'cobuyer']
        mock_get.return_value = ret

        result = self.test_service.signers(1, 'F')
        mock_get.assert_called_with('/docs/1/signers/?version_cd=F')
        self.assertListEqual(result, ret)

    @mock.patch.object(DocCenterService, 'get')
    def test_signers_404(self, mock_get):
        mock_get.side_effect = NotFound

        result = self.test_service.signers(1, 'F')
        self.assertListEqual(result, [])

    @mock.patch.object(DocCenterService, 'get')
    def test_signers_500(self, mock_get):
        mock_get.side_effect = InternalServerError

        result = self.test_service.signers(1, 'F')
        self.assertListEqual(result, [])

