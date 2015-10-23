
_ref = {

    'document_status': {
        'SUBM': 'submitted',
        'SCAN': 'scanned',
        'UPLD': 'uploaded',
        'PM': 'prompt-collected',
        'ES': 'signed',
        'PR': 'printed',
        'ST': 'stored',
        'RE': 'removed',
        'RV': 'reviewed',
        'PRA': 'prompt-accepted',
        'PRS': 'prompt-saved',
    },



}

class InvalidCategory(Exception):
    pass

def r(category, key):
    if category not in _ref:
        raise InvalidCategory('Category "%s" does not exist.' % category)

    return _ref[category].get(key)
    

    
