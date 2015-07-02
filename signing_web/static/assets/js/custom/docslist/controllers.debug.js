myApp.controller('DealSelectorCtrlr', DealSelectorCtrlr);

function DealSelectorCtrlr($scope) {
    $scope.deals = [
        { caption: 'With 1 doc', mstrindxid: '16490' },
        { caption: 'With 2 docs', mstrindxid: '16593' },
        { caption: 'With 3 docs', mstrindxid: '13647' },
        { caption: 'With 4 docs', mstrindxid: '22241' },
        { caption: 'With 5 docs', mstrindxid: '18686' },
        { caption: 'With 6 docs', mstrindxid: '18682' },
        { caption: 'With 7 docs', mstrindxid: '19379' },
        { caption: 'With 8 docs', mstrindxid: '17190' },
        { caption: 'With 9 docs', mstrindxid: '' },
        { caption: 'With 10 docs', mstrindxid: '' },
        { caption: 'With 11 docs', mstrindxid: '10090' }
    ];

    $scope.onLinkClicked = function (mstrindxid) {
        if (mstrindxid != '')
            location.href = "DocList.aspx?Doc_MasterndexID=" + mstrindxid;
        else {
            $('#deal-not-set').modal('show');
        }
    };

}
