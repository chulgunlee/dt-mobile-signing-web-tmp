import os
import json
from dtplatform.common.test_bases import DTTestBase

from dtplatform.common.constants import DEFAULT_TENANT_CODE
from doorman.tenant_manager import tenantManager  
                                                  
DTCOM = 'DTCOM'                                   
tenantManager.addManager(DEFAULT_TENANT_CODE)     

class SigningWebUnitTest(DTTestBase):
    DEALER_CODE = '12345'
    TENANT_CODE = 'DTCOM'
    CONNECTION_KEY = 'Deal'
    FUSION_PRODUCT_CODE = 'DTCOM'

    def load_json(self, filename):
        "Load json file from tests/json directory (used as test data)"        
        json_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'json', filename)
        return json.load(open(json_file))
