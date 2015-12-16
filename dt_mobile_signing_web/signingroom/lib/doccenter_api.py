from rest_framework.exceptions import APIException
from signingroom.lib.service_base import ServiceBase, NotFound, InternalServerError


class DocCenterService(ServiceBase):
    """Wrapper for calling `doc-center-api`
    """

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

    def store(self, pdf, doc_id, dj_id, doc_type):
        """
        Store a pdf file to doc-center-api

        Args:
            doc_id: document id
            dj_id: deal jacket id
            template_ds: template description
        """

        data = {
            'doc_index_id': doc_id,
            'external_transaction_id': dj_id,
            'template_document_type': doc_type,
            'base64_document_content': pdf,

            'nonlistable_metadata': {
                'file_name': '%s.pdf' % doc_type,
                'encoding': '',
                'doc_version_code': 'F',
                'document_type': 'pdf',
                'mime_type': 'application/x-pdf',
                'content_type': 'application/x-pdf',
            }
        }

        return self.put('/docs/store/', data=data)

    def signers(self, doc_id, version_cd):
        try:
            return self.get('/docs/%s/signers/?version_cd=%s' % (doc_id, version_cd))
        except (NotFound, InternalServerError):
            return []

    def type_choices(self):
        """Get document template types
        """
        return self.get('/templates/type-choices/')

    def background_images(self, doc_id, version_cd):
        """Get document images
        """
        return self.get('/docs/%s/background-images/' % doc_id, params={'version_cd': version_cd})


def get_doccenter_api(context):
    """Factory method
    """
    return DocCenterService(context)
