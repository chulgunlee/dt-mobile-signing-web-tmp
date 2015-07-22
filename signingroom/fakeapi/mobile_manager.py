from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound

from dtplatform.common.base_manager import BaseManager, getManager, register_manager
from dtplatform.core.models.dc import (
    Master_Index,
    Document_Index,
)


@register_manager()
class MobileManager(BaseManager):

    """
    Manager class for all the functionalities on the mobile platform.
    Including the DocList and SigningRoom.

    NOTE: this class won't check dealer code, so caller should make sure
    that the dealer has access to the document package (a.k.a. "document master") provided.
    """

    def __init__(self, ctx):
        super(MobileManager, self).__init__(ctx)


    def get_doc_pkg(self, pkg_id):
        """
        Get document package detail for the DocList.
        :param pkg_id: the document package id that need to be retrieved.
        :return: basic doc pkg info, including all the documents contained in this pkg. sign status included.

                {
                    id: doc_pkg_id,
                    docs: [
                        {
                            id: doc_id,
                            type: funding|other,        // for use in "Required for funding" and "Other documents" lists
                            signable: boolean,
                            signed: no|yes|partial,
                            required_signers: {
                                buyer: true,
                                cobuyer: false,
                                dealer: false
                            }
                            sign_status: {              // every field must have value
                                buyer: {
                                    signer_name: "James Green",
                                    signed: true|false,
                                },
                                cobuyer: {..},
                                dealer: {..},
                            }
                        },
                        ...    // next doc
                    ]
                }


        DEVELOPER NOTE:

        - Need to access contract table to get signers' names. (Is it possible to get contract id from `pkg_id`?)
        - Need to parse data to generate sign_status. (data from DOCMNT_METADATA or METADATA_SIGNER_STUS?)

        """
        try:
            # verify if the document package exists
            self.session.query(Master_Index) \
                .filter(Master_Index.master_index_id == pkg_id) \
                .one()

            docs = self.session.query(Document_Index) \
                .filter(Document_Index.master_index_id == pkg_id) \
                .order_by(Document_Index.document_index_id)
        except (NoResultFound, MultipleResultsFound):
            pass


    def get_doc_preview(self, doc_id):
        """
        Return the document preview images to the mobile client.
        :param doc_id: the document to preview
        :return: An object with basic doc info and page images

                {
                    id: doc_id,
                    pages: [
                        "base64-data",
                        "base64-data",
                        "base64-data",
                        ...
                    ],
                }
        """
        pass



    def signing_room_init(self, pkg_id, doc_ids=[]):
        """
        Initialize signing room
        :param pkg_id: the document package id
        :doc_ids: (optional) list of document id selected to be signed. Use all documents if omitted.
        :return: all the information required by the signing room initially.


                {
                    id: doc_pkg_id,
                    consent: {
                        buyer: true\false,
                        cobuyer: true\false,
                    }
                    current_doc: {
                        id: doc_id,
                        signable: true|false,
                        full_review_required: true|false,
                        pages: [
                            "base64-data",
                            ...
                        ],
                        sig_blocks: [
                            {
                                style: ...,
                                signer_type: "buyer|cobuyer|dealer",
                            },
                            ...
                        ],
                    },

                    docs: [                 // used by the document list on the left pane
                        {
                            id: doc_id,
                            signable: true|false,
                            signed: true|false,
                            template_name: '',      // displayed as the document name on the left page
                        },
                    ],

                }


        """
        pass

    def signing_room_save_signature(self, doc_id, signer_type, signature):
        """
        Save the signature to the database.

        Since a signing process can only be saved when all the signatures are signed,
        (i.e. either one signer signed all, or nothing)
        and since all the signatures are the same,
        sig_blocks specification is not required to save signature.

        This function will look up all the sig blocks in the doc that match specified signer_type
        and apply signature to them.

        :param doc_id: document id that was signed.
        :param signer_type: signer type who signed the document. buyer|cobuyer|dealer
        :param signature: base64 encoded(TODO: can be binary?) png image of the signature.
        """
        pass


    def signing_room_consent(self, pkg_id, signer_type):
        """
        Give consent to specified pkg_id.

        Should be called when user clicks the "Agree" button on the Terms and Conditions screen.

        :param pkg_id: document package id.
        :param signer_type: the user type who gives the consent. buyer|cobuyer
        """
        pass

    def signing_room_withdraw_consent(self, pkg_id, signer_type):
        """
        Withdraw consent to specified pkg_id.

        Should be called when user clicks the "Withdraw Consent" menu.

        :param pkg_id: document package id.
        :param signer_type: the user type who withdraws the consent. buyer|cobuyer
        """
        pass

