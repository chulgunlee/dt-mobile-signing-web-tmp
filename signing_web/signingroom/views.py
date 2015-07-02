from django.views.generic.base import View
from django.shortcuts import render_to_response

class SigningRoomView(View):

    def get(self, request, master_index_id):
        
        context = {'master_index_id': master_index_id}
        return render_to_response('signingroom.html', context)
