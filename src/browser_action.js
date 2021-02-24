chrome.storag.local.get(['dictID'], function(out) {
    var currDictId = out.dictID;
    document.getElementById(currDictId).style = 'border: 1px black solid ; background-color: lightgreen'
});
