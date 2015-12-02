def underscore_to_camelCase(name):
    "Convert underscore name to camelCase"
    words = [w.capitalize() for w in name.split('_')]
    words[0] = words[0].lower()
    return ''.join(words)
