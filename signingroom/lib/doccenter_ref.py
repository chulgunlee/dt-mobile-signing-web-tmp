
_ref = {

    'bool': {
        'Y': True,
        'N': False,
    },

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

    'sig_status_cd': {
        'BN': ('cobuyer', 'dealer'),
        'CN': ('buyer', 'dealer'),
        'DN': ('buyer', 'cobuyer'),
        'BNCN': ('dealer',),
        'BNDN': ('cobuyer',),
        'CNDN': ('buyer',),
        'ALLS': (),
        'ALLNS': ('buyer', 'cobuyer', 'dealer'),
    },


}

class InvalidCategory(Exception):
    pass

def r(category, key, default=None):
    if category not in _ref:
        raise InvalidCategory('Category "%s" does not exist.' % category)

    return _ref[category].get(key, default)
    

    
