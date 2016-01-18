from django.conf import settings
from django.shortcuts import render_to_response
from django.views.generic.base import View


class DocListView(View):

    def get(self, request, dealjacket_id, deal_id):

        user_code = request.context_data.get('user_code')
        dealer_code = request.context_data.get('dealer_code')
        tenant_code = request.context_data.get('tenant_code')
        fusion_prod_code = request.context_data.get('fusion_prod_code')

        context = {
            'dealjacket_id': dealjacket_id,
            'deal_id': deal_id,
            'user_code': user_code,
            'dealer_code': dealer_code,
            'tenant_code': tenant_code,
            'fusion_prod_code': fusion_prod_code,
            'uri_root': settings.URI_ROOT,
        }

        return render_to_response('doclist.html', context)
