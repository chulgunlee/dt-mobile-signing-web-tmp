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
from signingroom.lib.common import underscore_to_camelCase


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

        context_data = {
            'dealer_code': '1089761',
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }

        # call dtmobile service
        dm = get_dtmobile(context_data)         # TODO: should generate context from smsession
        deal = dm.get_dealjacket_summary(dealjacket_id, deal_id)

        # call doccenter api to get docs
        dc = get_doccenter_api(context_data)
        docs = dc.get_docs_by_dj_id(dealjacket_id)

        result = {
            'id': str(deal_id),
            'dealJacketId': str(dealjacket_id),
            'signers': {
                'buyer': get_applicant_info(deal, 'applicant'),
                'cobuyer': get_applicant_info(deal, 'coapplicant'),
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
    sign_status = r('sig_status_cd', doc.get('sig_status_cd', 'ALLNS'), ())

    return {
        'id': doc['document_index_id'],
        'docType': doc.get('template_doc_type'),
        'templateName': doc.get('template_document_description'),
        'version': doc.get('latest_doc_version_cd'),
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


def get_applicant_info(deal, applicant):
    """Get singer information from the deal returned by dt-mobile-api

    Args:
        deal: the deal result returned by dealjacket list API
        applicant: 'applicant' or 'coapplicant'

    Returns:
        A dictionary that contains all the available values for specified appliant from the deal data
    """
    
    result = {}
    for k in ('first_name', 'last_name', 'line_1_address', 'city', 'state_code', 'zip_code', 'phone_number'):
        v = deal.get('%s_%s' % (applicant, k))
        if v is not None:
            result[underscore_to_camelCase(k)] = v
    return result

    

class DocDetailView(APIView):
    """Get the detail for specified doc, or update its properties.

    API endpoints:

    - GET /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    - PUT /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    - DELETE /dealjackets/<dealjacket_id>/deals/<deal_id>/docs/<doc_id>/
    """

    def get(self, request, dealjacket_id, deal_id, doc_id):
        """Get the detail of the doc.

        Parameters:

        - `pkg_id`: The package id
        - `doc_id`: document id

        Return value:

        ```json
        {
            "id": <doc id>,
            "pages": [              // all the pages for this doc, ordered in page order
                <base64 encoded image>,
                ...
            ],

        }
        ```

        TODO:

        - consider using incremental loading for pages, if this will gain performance improvement (require profiling)
        """
        dealjacket_id = int(dealjacket_id)
        deal_id = int(deal_id)
        doc_id = int(doc_id)
        version_cd = request.GET.get('version')

        context_data = {
            'dealer_code': '1089761',
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }

        dc = get_doccenter_api(context_data)

        # if version_cd is not defined, get the latest version cd from doclist
        # Yes this is not efficient - need backend to provide single doc retrieval to improve
        if version_cd is None:
            docs = dc.get_docs_by_dj_id(dealjacket_id)
            for doc in docs:
                if int(doc['document_index_id']) == doc_id:
                    version_cd = doc.get('latest_doc_version_cd')
                    break

        response = dc.background_images(doc_id, version_cd)
        pages = response.get('results', [])

        pages = [ page.get('Value') for page in pages ]

        result = {
            'id': doc_id,
            'version': version_cd,
            'pages': pages,
        }

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

    def get(self, request, dealjacket_id, deal_id):
        """Get the doc type list.

        Parameters:

        - `pkg_id`: the package id

        Return value:

        ```json
        {
            "docTypes": [
                {
                    "code": <doc type name(code)>,
                    "name": <humna-readable doc type description>,
                },
            ],
        }
        ```
        """

        # call doccenter api to get docs
        dc = get_doccenter_api(request.context_data)
        doctypes = dc.type_choices()

        result = {
            'docTypes': [{'code': t[0], 'name': t[1]} for t in doctypes]
        }

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
