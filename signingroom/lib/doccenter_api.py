import json 
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from dtplatform.utils.dt_requests import get_json, post_json, put_json


class DocCenterService(object):

    def __init__(self):
        try:
            self.server_uri = settings.DOCCENTER_URI
        except Exception as e:
            raise ImproperlyConfigured('DOCCENTER_URI not specified: ' + e)


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
            'Accept': 'application/json',
        }

    def get_docs_by_dj_id(self, dj_id, context):
        """
        """

        headers = self._headers(context)
        response = post_json(self._url('/docs/list-by-exttrans-id/'), context=context, payload={ 'ext_id': dj_id }, headers=headers)

        if response.status_code == 200:
            docs = json.loads(response.text)
                
        else:
            docs = []

        return docs


    def get_docs_by_pkg_id(self, pkg_id, context):

        headers = self._headers(context)
        dealer_code = context.get('dealer_code', 0)
        response = get_json(self._url('/document-packages/%d/', pkg_id), context=context, params={ 'dealer_code': dealer_code }, headers=headers)

        if response.status_code == 200:
            docs = json.loads(response.text)
            docs = json.loads(docs)             # TODO: workaround, fix this after doc-center-api fixed json encoding issue 

        else:
            docs = []

        return docs

    def update_funding_in(self, doc_id, needed_for_funding, context):
        """
        Update required for funding indicator
        """
        headers = self._headers(context)
        response = put_json(self._url('/docs/%d/funding_in/', doc_id), context=context, headers=headers, payload={ 'needed_for_funding': needed_for_funding })

        return response


def get_doccenter_api():
    return DocCenterService()
