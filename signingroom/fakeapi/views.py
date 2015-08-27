from rest_framework.views import APIView
from rest_framework.response import Response

import os
import json
from django.views.generic.base import View

from django.http import HttpResponse

from dtplatform.common.base_manager import getManager
from .mobile_manager import MobileManager

class DocPackageView(APIView):

    def get(self, request, pkg_id):
        """
        Get document package detail, including the document list.
        """

        doc_pkg = json.load(open(os.path.dirname(__file__) + '/doc_list_response.json'))

        return Response(doc_pkg)
        


class DocPreviewView(APIView):
    
    def get(self, request, doc_id):
        
        doc_pkg = json.load(open(os.path.dirname(__file__) + '/doc_preview_response.json'))
        return Response(doc_pkg)



class DocPrintView(View):
    def get(self, request, doc_id):
        pass


class SigningRoomInitView(View):

    def get(self, request, pkg_id, doc_id):

        pass


class SigningRoomSigView(View):
    
    def put(self, request, pkg_id, doc_id, signer_type):

        pass


class SigningRoomConsentView(View):

    def put(self, request, pkg_id, signer_type):
        pass

    def delete(self, pkg_id, signer_type):
        pass
