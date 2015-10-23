from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from dtplatform.utils.dt_requests import get_json


class DTMobileService(object):

    def __init__(self):
        try:
            self.server_uri = settings.MOBILE_SERVER_URI
        except Exception as e:
            raise ImproperlyConfigured('MOBILE_SERVER_URI not specified: ' + e)


    def _url(self, path, *args):
        """
        Generate service URL
        """
        return self.server_uri + path % args

    def _headers(self, context):
        """
        Generate headers from client API call for web service
        TODO: this might be useless because dt_request support context
        """
        return {
            'DEALER-CODE': context.get('dealer_code'),
            'TENANT-CODE': context.get('tenant_code'),
            'FUSION-PROD-CODE': context.get('fusion_prod_code'),
        }

    def get_dealjacket_summary(self, dealjacket_id, deal_id, context):
        """
        Get deal jacket summary
        Calls /api/mobile/dealjackets/<deal_jacket_id>/deals/<deal_id>
        """
        headers = self._headers(context)
        response = get_json(self._url('/dealjackets/%s/deals/%s/', dealjacket_id, deal_id), context, headers=headers, verify=False)
        return response



def get_dtmobile():

    return DTMobileService()
