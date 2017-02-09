var unionSupport = {};
(function(){
	var userAgent = navigator.userAgent;
	if(/UCBrowser/.test(userAgent)){
		unionSupport.tag = 'embed';
	} else {
		unionSupport.tag = 'a';
	}
	if (!browser.versions.android) {
		unionSupport.pluginUrl = 'http://mobile.unionpay.com/getclient?platform=ios&type=securepayplugin';
	} else {
		unionSupport.pluginUrl = 'http://mobile.unionpay.com/getclient?platform=android&type=securepayplugin';
	}
})();
unionSupport.generateTag = function(tn, resultURL, usetestmode){
	var data = [
		'tn='+tn,
		'resultURL='+encodeURIComponent('http://m.euming.com/union'),
		'usetestmode='+usetestmode
	].join(',');
	var paydata = encodeURIComponent(Base64.encode(data));
	var tag = '';
	if(unionSupport.tag == 'a'){
		tag = '<a data-role="button" data-ajax="false" href="uppay://uppayservice/?style=token&paydata='+paydata+'">银联</a>'
	} else {
		tag = '<embed type="application/x-unionpayplugin" uc_plugin_id="unionpay" height="53" width="178"  paydata="'+ paydata +'"></embed>';
	}
	return $(tag);
};
