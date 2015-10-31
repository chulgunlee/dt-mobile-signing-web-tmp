from django.shortcuts import render_to_response
from django.views.generic.base import View


class SigningRoomView(View):

    def get(self, request, master_index_id):

        context = {
            'master_index_id': master_index_id,
            'user_code': 100502,
        }
        return render_to_response('signingroom.html', context)
