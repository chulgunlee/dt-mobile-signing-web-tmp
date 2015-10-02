from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse

import os
import json
from django.views.generic.base import View

from django.http import HttpResponse

#from dtplatform.common.base_manager import getManager

class DealJacketView(APIView):

    """
    Returns some information about the dealjacket required by doccenter.
    """

    def get(self, request, dj_id):
        
        dj_id = int(dj_id)

        result = {
            'id': dj_id,
            'package': {
                'id': 2,
            },
            'signers': {
                'buyer': 'James Green',
                'cobuyer': 'Linda Green',
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

