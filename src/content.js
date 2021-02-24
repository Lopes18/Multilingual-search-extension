//only the content script can interact with the web page
function getSelected() {
	var word0 = '';
	if(window.getSelection().toString().length>0 && window.getSelection() != 'undefined' ) {
        word0=window.getSelection().toString();
    }
    return word0;
}
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if (message == 'search') {

		var word = getSelected();

        chrome.storage.sync.get(['dictID'], function(out) {
            var currentId = out.dictID;
            if (currentId == 3) {
                word = word.replace(/\s/g,"-");
            }
        });
	}
	sendResponse(word);
});
