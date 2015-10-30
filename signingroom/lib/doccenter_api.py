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

    def update_funding_in(self, doc_id, needed_for_funding):
        """
        Update required for funding indicator
        """
        return self.put('/docs/%d/funding-in/' % doc_id, data={'needed_for_funding': needed_for_funding})


def get_doccenter_api(context):
    return DocCenterService(context)
