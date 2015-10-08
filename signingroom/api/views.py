from rest_framework.views import APIView
from rest_framework.response import Response
from dt_django_base.api.viewsets import BaseAPIView
from django.http import HttpResponse

import os
import json
from django.views.generic.base import View

from django.http import HttpResponse

from signingroom.lib.dtmobile import get_dtmobile

class DealJacketView(BaseAPIView):

    """
    Returns some information about the dealjacket required by doccenter.
    """

    def get(self, request, dealjacket_id, deal_id):
        
        # format parameters
        dealjacket_id = int(dealjacket_id)
        deal_id = int(deal_id)

        # call dtmobile service
        dm = get_dtmobile()
        response = dm.get_dealjacket_summary(dealjacket_id, deal_id, context=request.context_data)
        deal = json.loads(response.text)

        buyer_name = ' '.join(filter(None, (deal['applicant_first_name'], deal['applicant_last_name'])))
        cobuyer_name = ' '.join(filter(None, (deal['coapplicant_first_name'], deal['coapplicant_last_name'])))


        result = {
            'deal_id': deal_id,
            'dealjacket_id': dealjacket_id,
            'package': {
                'id': 2,
            },
            'signers': {
                'buyer': buyer_name,
                'cobuyer': cobuyer_name,
                'dealer': 'Mark Chart',
            },
        }
        
        return Response(result)

class PackageDetailView(APIView):
    def get(self, request, pkg_id):
        
        pkg_id = int(pkg_id)

        result = json.load(open(os.path.dirname(__file__) + '/package_detail_response.json'))
        result['id'] = pkg_id

        return Response(result)

class DocDetailView(APIView):

    def get(self, request, pkg_id, doc_id):

        doc_id = int(doc_id)
        pkg_id = int(pkg_id)

        result = json.load(open(os.path.dirname(__file__) + '/doc_detail_response.json'))
        result['id'] = doc_id

        return Response(result)

    def put(self, request, pkg_id, doc_id):
        return HttpResponse(status=204)

    def delete(self, request, pkg_id, doc_id):
        return HttpResponse(status=204)

class DocTypeListView(APIView):
    def get(self, request, pkg_id):
        result = json.load(open(os.path.dirname(__file__) + '/doc_type_list_response.json'))
        return Response(result)

class DocSubmitView(APIView):

    def post(self, request, pkg_id):
        return HttpResponse(status=204)

class ConsentListView(APIView):
    def get(self, request, pkg_id):
        result = json.load(open(os.path.dirname(__file__) + '/consent_response.json'))
        return Response(result)

    def put(self, request, pkg_id):
        return HttpResponse(status=204)

