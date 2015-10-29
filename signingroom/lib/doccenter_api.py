import json
from rest_framework.exceptions import APIException
from signingroom.lib.service_base import ServiceBase


class DocCenterService(ServiceBase):

    SETTING_KEY = 'DOCCENTER_URI'

    def get_docs_by_dj_id(self, dj_id):
        """
        """
        try:
            return self.post('/docs/list-by-exttrans-id/', data={'ext_id': dj_id})
        except APIException:
            return []

    def get_docs_by_pkg_id(self, pkg_id, context):

        try:
            dealer_code = context.get('dealer_code', 0)
            docs = self.get('/document-packages/%d/' % pkg_id, params={'dealer_code': dealer_code})

            return json.loads(docs)             # TODO: workaround, fix this after doc-center-api fixed json encoding issue

        except APIException:
            return []

    def update_funding_in(self, doc_id, needed_for_funding):
        """
        Update required for funding indicator
        """
        return self.put('/docs/%d/funding-in/' % doc_id, data={'needed_for_funding': needed_for_funding})


def get_doccenter_api(context):
    return DocCenterService(context)
