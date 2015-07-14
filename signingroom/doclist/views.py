from django.views.generic.base import View
from django.shortcuts import render_to_response

class DocListView(View):

    def get(self, request, master_index_id):
        
        context = {
            'master_index_id': master_index_id,
            'user_code': 100502,
        }
        return render_to_response('doclist.html', context)
