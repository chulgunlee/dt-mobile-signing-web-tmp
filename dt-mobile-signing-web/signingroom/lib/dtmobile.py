from signingroom.lib.service_base import ServiceBase


class DTMobileService(ServiceBase):
    """Wrapper for calling `dt-mobile-api`
    """

    SETTING_KEY = 'MOBILE_SERVER_URI'

    def get_dealjacket_summary(self, dealjacket_id, deal_id):
        """Get deal jacket summary

        Calls /api/mobile/dealjackets/<deal_jacket_id>/deals/<deal_id>
        """
        return self.get('/dealjackets/%s/deals/%s/' % (dealjacket_id, deal_id))


def get_dtmobile(context):
    """Factory method
    """
    return DTMobileService(context)
