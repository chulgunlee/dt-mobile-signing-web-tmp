#from rest_framework.views import APIView
#from rest_framework.response import Response

import json
from django.views.generic.base import View

from django.http import HttpResponse

from dtplatform.common.base_manager import getManager
from .mobile_manager import MobileManager

class DocListView(View):

    def get(self, request, pkg_id):

        mobile_manager =  getManager(MobileManager, request.context_data)
        doc_pkg = mobile_manager.get_doc_pkg(pkg_id)

        return HttpResponse(json.dumps(doc_pkg))
        

