from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse

import os
import json
from django.views.generic.base import View

from django.http import HttpResponse

#from dtplatform.common.base_manager import getManager

class DocPackageView(APIView):

    def get(self, request, pkg_id):
        """
        Get document package detail, including the document list.
        """

        doc_pkg = json.load(open(os.path.dirname(__file__) + '/doc_list_response.json'))

        return Response(doc_pkg)


class DocPackagePrintView(View):
    
    def post(self, request, pkg_id):

        """
        Print documents
        """
        return HttpResponse(open(os.path.dirname(__file__) + '/FormRBP-1027_2012.pdf').read(), content_type='application-xpdf')
        

class DocPackageSubmitView(APIView):
    def put(self, request, pkg_id):
        return Response(status=204)



class DocPreviewView(APIView):
    
    def get(self, request, doc_id):
        
        doc_pkg = json.load(open(os.path.dirname(__file__) + '/doc_preview_response.json'))
        return Response(doc_pkg)


class DocUpdateView(APIView):
    
    def put(self, request, doc_id):

        return Response(status=204)


class DocPrintView(View):
    def get(self, request, doc_id):
        pass


class DocTypeListView(APIView):
    def get(self, request):

        doc_pkg = json.load(open(os.path.dirname(__file__) + '/doc_type_list_response.json'))
        return Response(doc_pkg)

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
