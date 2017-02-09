changeCityJs = {
	init:function(){
		this.toggleEvents(true);
		this.initCityListPage();
	}, toggleEvents: function (isBind) {
        var me = changeCityJs;
        var $p = $.mobile.activePage;
		$p.undelegate();
        if (isBind) {
		    $p.one('pagebeforehide', function () {
                    me.toggleEvents();
			});
            setTimeout(function () {
				me.toggleEvents();
				$p.delegate('a[data-cityId]', 'vclick', me.selCity);
				$p.delegate('.letter-list a', 'vclick', function(){
					var $el =  $(this);
					var $target = $('#'+$.trim($el.text()))
					var offset = $target.offset();
					console.log(offset);
					me.toggleEvents(true);
					$(window).scrollTop(offset.top);
				});
            }, 500);
        }
    },initCityListPage:function(){
		$.get('resource/fragment/citylist.txt', function(data){
			var txt = data.replace('{0}', dmJs.params.geolocation.city);
			var $p = $.mobile.activePage;
			$p.find('.ui-content').html(txt);
		});
		return;
	},selCity:function(){
		var me = changeCityJs;
		var $el = $(this);
		var id = $el.attr('data-cityId');
		var areaName  = this.title;
		me.geocoder($.trim(areaName), $.trim(id));
	},geocoder:function(address, id){
		var url = 'http://api.map.baidu.com/geocoder/v2/?ak=1NdP3HNjGyuesNmTLEK10Gx8&output=json&address='+address+'&city=';
		$.ajax({url:url, dataType:'jsonp', success:function(data){
			if(data.status == 0){
				var result = data.result
				// //TODO
				// alert(JSON.stringify(result));
				var location = result.location;
				var geolocation = dmJs.params.geolocation;
				geolocation.latitude = location.lat;
				geolocation.longitude  = location.lng;
				geolocation.city = address;
				geolocation.id = id;
                viewJs.navigator.pre();
			} else {
				viewJs.showPopMsg('地址解析失败！');
                viewJs.navigator.pre();
			}
		}
		});
	}
};