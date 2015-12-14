import mock
import json

from mock import Mock
from tests.test_bases import SigningWebUnitTest

from signingroom.lib.dtmobile import *


class TestDTMobileService(SigningWebUnitTest):
    
    def setUp(self):
        super(TestDTMobileService, self).setUp()
        self.context = { 
            'dealer_code': 12345,
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }
        self.test_service = DTMobileService(self.context)

    def tearDown(self):
        pass

    @mock.patch.object(DTMobileService, 'get', return_value=None)
    def test_get_dealjacket_summary(self, mock_get):
        self.test_service.get_dealjacket_summary(1,2)
        mock_get.assert_called_with('/dealjackets/1/deals/2/')
        
