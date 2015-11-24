from drf_braces import fields
from dt_django_base.api.serializers import BaseSerializer
from rest_framework import serializers
from rest_framework.serializers import ValidationError


class DocSerializer(BaseSerializer):
    """Serializer for doc object

    Note that this serializer should only be used to validate the client request data.
    DO NOT use this to convert internal data for sending to client --
    in that case the doc object has a different structure.
    """

    requiredForFunding = fields.BooleanField(required=False)
    pdf = fields.CharField(required=False)
    docType = fields.CharField(required=False)
    applicant = fields.CharField(required=False)

    def validate(self, data):
        """Validate input data from the client
        """
        data = super(DocSerializer, self).validate(data)

        # if uploading PDF, then `docType` and `applicant` are required
        if data.get('pdf') is not None:
            if data.get('docType') is None:
                raise ValidationError({'docType': '`docType` and `applicant` are required when uploading PDF file'})
            elif data.get('applicant') is None:
                raise ValidationError({'applicant': '`docType` and `applicant` are required when uploading PDF file'})

        # `docType` cannot be null
        if 'docType' in data and data['docType'] is None:
            raise ValidationError({'docType': '`docType` cannot be null'})

        # if `docType` exists, then `applicant` must exists
        if 'docType' in data and 'applicant' not in data:
            raise ValidationError({'applicant': '`applicant` is required when updating `docType`'})

        # `applicant` must be in valid values
        applicant = data.get('applicant')
        if applicant is not None and applicant not in ('buyer', 'cobuyer'):
            raise ValidationError({'applicant': 'invalid applicant type'})

        return data

    

