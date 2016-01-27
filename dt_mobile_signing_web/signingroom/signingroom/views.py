from django.shortcuts import render_to_response
from django.views.generic.base import View
from django.core.exceptions import SuspiciousOperation
from .forms import SigningRoomForm


class SigningRoomView(View):
    """
        This used to render signing angular room application. It accepts
        master_index_id, documents ids, and signer types, and passed them
        in to a context of angular application as a json object.
    """

    documents_attribute = 'documents'
    signers_attribute = 'singers'

    def get(self, request, master_index_id):

        form = SigningRoomForm(request.GET)

        if not form.is_valid():
            raise SuspiciousOperation("Invalid request")

        context = {
            'user_code': 100502,
            'master_index': master_index_id,
            'doc_ids': form.cleaned_data['doc_ids'],
            'signers': form.cleaned_data['signers']
        }

        return render_to_response('signingroom.html', context)
