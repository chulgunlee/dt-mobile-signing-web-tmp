from drf_braces import fields
from dt_django_base.api.serializers import BaseSerializer
from rest_framework import serializers
from rest_framework.serializers import ValidationError


class DocSerializer(BaseSerializer):
    requiredForFunding = fields.BooleanField(required=False)
    pdf = fields.CharField(required=False)
    docType = fields.CharField(required=False)
    applicant = fields.CharField(required=False)

    def validate(self, data):
        """
        Validation rules:

        1) For uploading PDF: ('pdf', 'docType', 'applicant') are required (not null)
        2) For updating requiredForFunding flag: ('requiredForFunding') is required
        3) For deleting PDF: 'pdf' == None, (docType and applicant are NOT required)
        4) For updating properties: both field must exist; docType cannot be null
         
        """
        data = super(DocSerializer, self).validate(data)

        if data.get('pdf') is not None:
            if data.get('docType') is None:
                raise ValidationError({'docType': '`docType` and `applicant` are required when uploading PDF file'})
            elif data.get('applicant') is None:
                raise ValidationError({'applicant': '`docType` and `applicant` are required when uploading PDF file'})

        if 'docType' in data and data['docType'] is None:
            raise ValidationError({'docType': '`docType` cannot be null'})

        if 'docType' in data and 'applicant' not in data:
            raise ValidationError({'applicant': '`applicant` is required when updating `docType`'})

        applicant = data.get('applicant')
        if applicant is not None and applicant not in ('buyer', 'cobuyer'):
            raise ValidationError({'applicant': 'invalid applicant type'})

        return data

    

