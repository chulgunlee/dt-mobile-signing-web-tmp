import os

from django.views.generic.base import View
from django.shortcuts import render_to_response
from django.http import HttpResponse

try:
    import simplejson as json
except ImportError:
    import json


class DocListView(View):

    def get(self, request, master_index_id):
        
        context = {
            'master_index_id': master_index_id,
            'user_code': 100502,
        }
        return render_to_response('doclist.html', context)


def doc_package_api(request, master_index_id):
    """ Get a doc package

    Args:
        master_index_id: Master index id AKA. package id

    Returns:
        JSON response
    """
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'doc_list_response.json')) as f:
        doc_list_json = json.load(f)

        return HttpResponse(json.dumps(doc_list_json), content_type='application/json')



def doc_preview_api(request, master_index_id, doc_index_id):
    """ Get a doc preview

    Args:
        master_index_id: Master index id AKA. package id
        doc_index_id: Document index id (doc ID)

    Returns:
        application/pdf
    """
    data={
        'id': doc_index_id,
        'pages': [
            'http://localhost:8000/api/doclist/{}/docs/{}/page/1'.format(master_index_id, doc_index_id),
            'http://localhost:8000/api/doclist/{}/docs/{}/page/2'.format(master_index_id, doc_index_id),
            'http://localhost:8000/api/doclist/{}/docs/{}/page/3'.format(master_index_id, doc_index_id),
            'http://localhost:8000/api/doclist/{}/docs/{}/page/4'.format(master_index_id, doc_index_id),
            'http://localhost:8000/api/doclist/{}/docs/{}/page/5'.format(master_index_id, doc_index_id),
        ]
    }

    return HttpResponse(json.dumps(data, indent=4), content_type='application/json')


def doc_preview_page(request, master_index_id, doc_index_id, page_number):
    """ Get a single page for preview

    Args:
        request:
        master_index_id:
        doc_index_id:
        page_number:
    """
    if int(page_number) not in (1, 2, 3, 4, 5):
        return HttpResponse(status=404)

    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'page{}.png'.format(page_number))) as f:
        png_data = f.read()

    return HttpResponse(png_data, content_type='image/png')
