function loadCssFile(filename)
{
	    var fileref = document.createElement('link');
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("type","text/css");
        fileref.setAttribute("href",filename);

        document.getElementsByTagName("head")[0].appendChild(fileref);
}

// loadCssFile("../Public/css/listview.css");
// loadCssFile("../Public/css/msgview.css");

var _model = navigator.userAgent;
 
if(_model.indexOf("Android") != -1){

  loadCssFile("../Public/css/listview.css");
   loadCssFile("../Public/css/android.css");


}else if(_model.indexOf("iPhone") != -1){

	loadCssFile("../Public/css/listview.css");
    loadCssFile("../Public/css/ios.css");
}
else{ //网页版
   loadCssFile("../Public/css/listview.css");
   loadCssFile("../Public/css/msgview.css");
}

