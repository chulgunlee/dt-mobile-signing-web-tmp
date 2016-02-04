from django import forms

class SigningRoomForm(forms.Form):
    """
    Form to validate query params passed from document list
    """
    signers = forms.CharField(max_length=255)
    doc_ids = forms.CharField(max_length=20)

    def clean_signers(self):
        """ Try to validate signers string. If invalid raise ValidationError """

        for item in self.cleaned_data['signers'].split(','):
            if item not in ['buyer', 'cobuyer', 'dealer']:
                raise forms.ValidationError('`{}` is not valid value'.format(item))
        return self.cleaned_data['signers'].split(',')

    def clean_doc_ids(self):
        """
        Try to validate doc ids list. If invalid raise ValidationError
        """
        try:
            return [ int(i) for i in self.cleaned_data['doc_ids'].split(',')]
        except ValueError:
            raise forms.ValidationError('On of the values is not integer')
