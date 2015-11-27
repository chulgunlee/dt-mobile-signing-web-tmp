import unittest

from signingroom.lib.common import underscore_to_camelCase

class UnderscoreToCamelCaseTeseCase(unittest.TestCase):

    def test_name_single_word(self):
        result = underscore_to_camelCase('single')
        self.assertEqual(result, 'single')

    def test_name_two_words(self):
        result = underscore_to_camelCase('two_words')
        self.assertEqual(result, 'twoWords')

    def test_name_multiple_words(self):
        result = underscore_to_camelCase('multiple_words_test')
        self.assertEqual(result, 'multipleWordsTest')

