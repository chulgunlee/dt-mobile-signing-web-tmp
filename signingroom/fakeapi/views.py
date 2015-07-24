from rest_framework.views import APIView
from rest_framework.response import Response

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

        mobile_manager = getManager(MobileManager, request.context_data)
        doc_pkg = mobile_manager.get_doc_pkg(pkg_id)

        doc_pkg = {}

        return Response(doc_pkg)
        


class DocPreviewView(View):
    
    def get(self, doc_id):
        pass



class DocPrintView(View):
    def get(self, doc_id):
        pass


class SigningRoomInitView(View):

    def get(self, pkg_id, doc_id):

        pass


class SigningRoomSigView(View):
    
    def put(self, pkg_id, doc_id, signer_type):

        pass


class SigningRoomConsentView(View):

    def put(self, pkg_id, signer_type):
        pass

    def delete(self, pkg_id, signer_type):
        pass
