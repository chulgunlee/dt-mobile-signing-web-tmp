import json
import os

from django.http import HttpResponse
from django.views.generic.base import View
from dt_django_base.api.viewsets import BaseAPIView
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from signingroom.lib.doccenter_api import get_doccenter_api
from signingroom.lib.doccenter_ref import r
from signingroom.lib.dtmobile import get_dtmobile
from signingroom.api.serializers import DocSerializer


class DealJacketView(BaseAPIView):

    """Returns some information about the dealjacket required by doccenter.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/

    """

    def get(self, request, dealjacket_id, deal_id):

        """Get doccenter-related details from deal jacket.

        Parameters:

        - `dealjacket_id`: The deal jacket id
        - `deal_id`: The deal id

        Return value:

        ```json
        {
            "dealjacketId": <the input dealjacket id>,
            "id": <the input deal id>,
            "signers": {
                "buyer": <applicant name>,
                "cobuyer": <co-applicant name>,
                "dealer": <dealer name>,
            },
            "docs": [
                "id": <doc id>,
                "docType": <document template type>,
                "requiredForFunding": true|false,
                "signable": true|false,
                "status": "initial|partially-signed|signed|submitted",
                "signStatus": {
                    "buyer": true|false,
                    "cobuyer": true|false,
                    "dealer": true|false,
                },
                "requiredSigners": ['buyer', 'cobuyer', 'dealer'],
                "isExternal": true|false
            ]
        }
        ```
        """

        # format parameters
        dealjacket_id = int(dealjacket_id)
        deal_id = int(deal_id)

        # call dtmobile service
        try:
            dm = get_dtmobile(request.context_data)         # TODO: should generate context from smsession
            deal = dm.get_dealjacket_summary(dealjacket_id, deal_id)

            buyer_name = ' '.join(filter(None, (deal['applicant_first_name'], deal['applicant_last_name'])))
            cobuyer_name = ' '.join(filter(None, (deal['coapplicant_first_name'], deal['coapplicant_last_name'])))

        except APIException:
            buyer_name = 'Applicant'                # TODO: workaround code for dev
            cobuyer_name = 'Co-Applicant'           # TODO: in prod this need to be deleted because if dtmobile is down this api won't be called

        # call doccenter api to get docs
        dc = get_doccenter_api(request.context_data)
        docs = dc.get_docs_by_dj_id(dealjacket_id)

        result = {
            'id': str(deal_id),
            'dealJacketId': str(dealjacket_id),
            'signers': {
                'buyer': buyer_name,
                'cobuyer': cobuyer_name,
                'dealer': 'Mark Chart',
            },
            'docs': [_convert_doc(doc) for doc in docs],
        }

        return Response(result)


class DocListView(APIView):
    """Get document list only (without dealjacket info such as signers..).

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/
    """

    def get(self, request, dealjacket_id, deal_id):

        """Get document list only (without dealjacket info such as signers..).

        Parameters:

        - `dealjacket_id`: The deal jacket id
        - `deal_id`: The deal id

        Return value:

        ```json
        {
            "docs": [
                {
                    "id": <doc id>,
                    "templateName": <doc template naem>,
                    "requiredForFunding": <true|false>,     // whether this document is required for funding
                    "requiredSigners": [ "buyer", "cobuyer" ],      // a list of buyer|cobuyer|dealer indicating who is required to sign this doc
                    "docType": <doc type>,
                    "signable": <true|false>,
                    "status": <not-signed|partially-signed|signed|submitted|uploaded|initial>,
                    "signStatus": {                     // whether each signer has signed the doc or not
                        "buyer": <true|false>,
                        "cobuyer": <true|false>,
                        "dealer": <true|false>,
                    },
                    "isExternal": <true|false>,
                    "requiredApplicant": <buyer|cobuyer|null>,     // the applicant specification for this doc. null == both
                },
                ...
            ],
        }
        ```

        """
        dealjacket_id = int(dealjacket_id)

        # call doccenter api to get docs
        dc = get_doccenter_api(request.context_data)
        docs = dc.get_docs_by_dj_id(dealjacket_id)

        result = {'docs': [_convert_doc(doc) for doc in docs]}

        return Response(result)


def _convert_doc(doc):
    sign_status = r('sig_status_cd', doc.get('sig_status_cd', ()))

    return {
        'id': doc['document_index_id'],
        'docType': doc.get('template_doc_type'),
        'templateName': doc.get('template_document_description'),
        'requiredForFunding': r('bool', doc.get('needed_for_funding')),
        'requireFullReview': False,             # TODO
        'signable': r('bool', doc.get('electronic_sig')),
        'status': r('document_status', doc.get('document_status_cd')),
        'signStatus': {                         # TODO
            'buyer': 'buyer' in sign_status,
            'cobuyer': 'cobuyer' in sign_status,
            'dealer': 'dealer' in sign_status,
        },
        'requiredSigners': ['buyer', 'cobuyer', 'dealer'],

        'isExternal': r('bool', doc.get('external')),
    }


class DocDetailView(APIView):
    """Get the detail for specified doc, or update its properties.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    - PUT /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    - DELETE /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    """

    def get(self, request, pkg_id, doc_id):
        """Get the detail of the doc.

        Parameters:

        - `pkg_id`: The package id
        - `doc_id`: document id

        Return value:

        ```json
        {
            "id": <doc id>,
            "packageId": <doc package id>,
            "docType": <doc type>,
            "templateName": <doc template naem>,
            "requiredForFunding": <true|false>,     // whether this document is required for funding
            "requiredFullReview": <true|false>,     // whether the signer has to review the whole doc before he can sign
            "signable": <true|false>,
            "requiredSigners": [ "buyer", "cobuyer" ],      // a list of buyer|cobuyer|dealer indicating who is required to sign this doc
            "signStatus": {                     // whether each signer has signed the doc or not
                "buyer": <true|false>,
                "cobuyer": <true|false>,
                "dealer": <true|false>,
            },
            "isExternal": <true|false>,
            "sigBlocks": [
                { "type": "buyer", "style": "" },
                { "type": "cobuyer", "style": "" },
            ],

            "pages": [              // all the pages for this doc, ordered in page order
                <base64 encoded image>,
                ...
            ],

        }
        ```

        TODO:

        - consider using incremental loading for pages, if this will gain performance improvement (require profiling)
        """

        doc_id = int(doc_id)

        result = json.load(open(os.path.dirname(__file__) + '/doc_detail_response.json'))
        result['id'] = doc_id

        return Response(result)

    def put(self, request, dealjacket_id, deal_id, doc_id):
        """
        Update the document properties.

        NOTE this API will NOT update the whole object; instead it will update specified fields only (equivalent to `PATCH` which is not implement).

        Parameters:

        - `dealjacket_id`: deal jacket id
        - `deal_id`: deal id
        - `doc_id`: document id

        - data:

            {
                "docType": "",
                "applicant": "buyer" | "cobuyer" | null,
                "requiredForFunding": true | false,
                "pdf": "",           // base64 encoded PDF binary
            }

        Return value:

        - Returns http 204 if success.
        - Returns http 400 if error happened.

        Note:

        - Only external docs can be updated with "pdf" property.

        """
        doc_id = int(doc_id)
        dc = get_doccenter_api(request.context_data)

        serializer = DocSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.data

        # update needed_for_funding indicator
        if 'requiredForFunding' in data:
            required_for_funding = data.get('requiredForFunding')
            if not isinstance(required_for_funding, bool):
                raise ValidationError('requiredForFunding must be a boolean value.')

            # update through doccenter API
            dc.update_funding_in(doc_id, required_for_funding)

        # upload PDF file
        if 'pdf' in data:
            base64_pdf = data.get('pdf')
            doc_type = data.get('docType')
            scan_applicant = data.get('applicant')
            dc.store(base64_pdf, doc_id, dealjacket_id, doc_type)

        return HttpResponse(status=204)

    def delete(self, request, pkg_id, doc_id):
        """
        Delete uploaded document.

        Parameters:

        - `pkg_id`: The package id
        - `doc_id`: document id

        Return value:

        - Returns http 204 if success.
        - Returns http 400 if error happened.

        """
        return HttpResponse(status=204)


class DocPrintView(View):
    """Get printable pdf document.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/printable?docids=1,2,3
    """

    def get(self, request, pkg_id):
        """Get printable pdf. The server will merge specified docs into one pdf and return it to caller.

        Parameters:

        - `pkg_id`: The package id
        - [QS] `docids`: a comma-delimited list which specifies the docs that needs to be merged and printed.

        Return value:

        An `application/x-pdf` with binary PDF data.
        """
        pass


class DocTypeListView(APIView):
    """Get the doc type list.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/doctypes/
    """

    def get(self, request, pkg_id):
        """Get the doc type list.

        Parameters:

        - `pkg_id`: the package id

        Return value:

        ```json
        {
            "packageId": <doc package id>,
            "docTypes": [
                {
                    "id": <doc type id>,
                    "docTypeName": <doc type name(code)>,
                    "name": <humna-readable doc type description>,
                    "requiredApplicant": <buyer|cobuyer|null>,     // the applicant specification for this doc. null == both
                },
            ],
        }
        ```
        """

        result = json.load(open(os.path.dirname(__file__) + '/doc_type_list_response.json'))
        return Response(result)


class DocSubmitView(APIView):
    """Submit documents to lender

    API endpoints:

    - POST /dealjackets/<dealjacket_id>/deals/<deal_id>/submit/
    """

    def post(self, request, pkg_id):
        """Submit specified documents to the lender.

        Parameters:

        - `pkg_id`: package id
        - data: `{ "docIds": [1,2,3,4] }`  -- docs that need to be submitted to the lender

        Return value:

        - Returns http 204 if success.
        - Returns http 400 if error happened.
        """

        return HttpResponse(status=204)


class ConsentListView(APIView):
    """Provide operations to user consents.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/consents/
    - PUT /dealjackets/<dealjacket_id>/deals/<deal_id>/consents/
    """
    def get(self, request, pkg_id):
        """Get the user consents

        Basically this returns the same value as in the package detail request.

        Parameters:

        - `pkg_id`: package id

        Return value:

        ```json
        {
            "id": <doc package id>,
            "consents": {               // buyer consents
                "buyer": <true|false>,
                "cobuyer": <true|false>,
            },
        }
        ```
        """
        result = json.load(open(os.path.dirname(__file__) + '/consent_response.json'))
        return Response(result)

    def put(self, request, pkg_id):
        """Update user consents

        Parameters:

        - `pkg_id`: package id
        - data: { "buyer": <true|false>, "cobuyer": <true|false> }

        Return value:

        - Returns http 204 if success.
        - Returns http 400 if error happened.
        """
        return HttpResponse(status=204)
