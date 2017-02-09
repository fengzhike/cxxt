searchAllJs = {
	init:function(){
		var $p = $.mobile.activePage;
		searchAllJs.onkeywordinput.apply($p.find('#keyword'));
		this.toggleEvents(true);
		this.initPage();
		//dmJs.getCategories(this.initCatList);
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
	},toggleEvents:function(isBind){
		var me = searchAllJs;
		var $p = $.mobile.activePage;
		$p.undelegate();
		$p.find('#keyword').unbind('input');
		if(isBind){
			$p.one('pagebeforehide', function(){
					me.toggleEvents();
			});
			$p.find('#keyword').on('input', me.onkeywordinput);
			setTimeout(function(){
				$p.delegate('.around > div', 'vclick',me.searchByCat);
				$p.delegate('#keyword', 'keypress',me.onkeyword);
                $p.delegate('#keyword', 'change',me.onkeywordChange);
				$p.delegate('.list > a,.list-items > li', 'vclick',me.onclickItem);
				$p.delegate('.moreBtn', 'vclick',me.toAll);
				$p.delegate('.row.statistics', 'vclick',me.toSearchByKeyword);
			}, 500);
		}
	},initPage:function(){
		var $p = $.mobile.activePage;
		var param = mainJs.parseUrlSearch();
		if(param.keyword){
			$p.find('#keyword').val(param.keyword);
		}else if(param.distance){
			$p.find('.ui-header').empty()
				.append("<a class=\"navigateBackBtn ui-btn-left ui-btn ui-icon-back ui-btn-icon-notext\" data-role=\"button\" role=\"button\" style='height: 1.75em;'>返回</a><h1 class=\"vt ui-title\" role=\"heading\" aria-level=\"1\">我的身边</h1>")
				.css("padding","0");
			this.getSearchData(param.distance);
		}
	},onkeyword:function(e){
		var $p = $.mobile.activePage;
		if(e.which == "13")
         {
			var me = searchAllJs;
			var val = $.trim(this.value);
			 if(val!= ''){
				 me.onkeywordinput.apply($p.find('#keyword'));
			 }
         }
	},onkeywordChange:function(){
        var $el = $(this);
        var val = $.trim($el.val());
        if(val == ''){
            var me = searchAllJs;
            me.onkeywordinput.apply($el);
        }
    },getSearchData:function(keyword){
        var $p = $.mobile.activePage;
        var me = searchAllJs;
        $('#searchKeywordTips').remove();
        var $ct = $p.find('.ui-content');
        $ct.find('.ui-grid-c.around').hide();
		$(".title").hide();
        $('#searchTips').empty();
        var _self = arguments.callee;
       clearTimeout(_self.handler);
        _self.handler = setTimeout(function(){
            if(_self.ajax){
                try{
                    _self.ajax.abort();
                }catch (ex){
                    console.log(ex);
                }
            }
            _self.ajax = me._getSearchData(keyword,function(){
                _self.busy = false;
            });
        },300);
    },_getSearchData:function(keyword, callback){
        var me = searchAllJs;
		var $p = $.mobile.activePage;
		var params = {};
		var param = mainJs.parseUrlSearch();
		if(param.distance){
			params.distance = keyword;
			params.longitude = dmJs.params.geolocation.longitude;
			params.latitude = dmJs.params.geolocation.latitude;
		}else{
			params.keyword = keyword;
		}
		var user = dmJs.sStore.getUserInfo();
		if(user != null){
			params.accessToken = dmJs.sStore.getUserInfo().accessToken;
		}
        return dmJs._ajax({
            method:'POST',
            url:'/urming_quan/search/getSearchData',
            id:'getSearchData',
            params:params,
            callback:function(data){
				var type1 = {0:"user",1:"service",2:"want",3:"course",4:"activity",5:"question"};
				var type2 = {0:"人才",1:"服务",2:"需求",3:"课程",4:"活动",5:"问题"};
				var html = [];//'<ul data-role="listview" data-theme="c" class="list-items">'
				$.each(data.datas, function(idx, obj) {
                    //console.log(data)
					switch(obj.categoryID){
						case 1: case 3: case 4:
							if(obj.total==0){
								break;
							}
							html.push('<div class="sec-tip font-black ',type1[obj.categoryID],'-tip">',obj.categoryName,'<span>',obj.total,'条记录</span></div>');
							html.push('<div class="ct detail">');
							html.push('<div class="list">');
							html.push(me.pareServiceToHtml(obj.datas,type1[obj.categoryID],obj.categoryID));
							html.push("</div>");
							if(obj.total>2){
								html.push('<a class="vbt vr moreBtn toAll',type1[obj.categoryID],'">查看更多</a>');
							}
							html.push("</div>");
							break;
						case 2: case 5:
							if(obj.total==0){
								break;
							}
							html.push('<div class="sec-tip font-black ',type1[obj.categoryID],'-tip">',obj.categoryName,'<span>',obj.total,'条记录</span></div>');
							html.push('<div class="ct detail">');
							html.push('<div class="list list2">');
							html.push(me.pareWantToHtml(obj.datas,type1[obj.categoryID],obj.categoryID));
							html.push("</div>");
							if(obj.total>2){
								html.push('<a class="vbt vr moreBtn toAll',type1[obj.categoryID],'">查看更多</a>');
							}
							html.push("</div>");
							break;
						case 0:
							if(obj.total==0){
								break;
							}
							html.push('<div class="sec-tip font-black ',type1[obj.categoryID],'-tip">人才<span>',obj.total,'条记录</span></div>');
							html.push('<ul data-role="listview" data-theme="c" class="list-items ui-listview ui-group-theme-c">');
							html.push(me.pareUserToHtml(obj.datas,type1[obj.categoryID,obj.categoryID]));
							html.push('</ul>');
							if(obj.total>2){
								html.push('<a class="vbt vr moreBtn toAll',type1[obj.categoryID],'">查看更多</a>');
							}
							html.push("</div>");
							break;
					}
				});
				//html.push('</ul>');
				if($p.find("#keyword").val()!=""){
					if(html.length==0){
						html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div></div>'];
					}
					$('#searchTips').html(html.join(''));
				}else{
					$('#searchTips').empty();
				}
                callback();
            },error:callback
        });
    },toSearchByKeyword:function(){
        var me = searchAllJs;
        var $el = $(this);
        var keyword = $.trim($el.find('.statistics-name').text());
        $('#keyword').val(keyword)
    },searchByCat:function(){
		var categoryId = $(this).data("categoryid");
        var isGroup = $(this).attr("data-isGroup");
		if(categoryId == 7){
			window.location.href="http://rencai.euming.com/m/wap-jobs-list.php?key=&district=&sdistrict=";
			return;
		}
		var params = {catId:categoryId};
        if(categoryId == -2){
            params.isGroup = isGroup ;
        }
		viewJs.navigator.next({lastAuto:true,next:{
			id:'doSearchSvr',
			url:'./search.html',
			options:{
				data:params
			}
		}});
	},onkeywordinput:function(){
        var me = searchAllJs;
		var $el = $(this);
		var val = $.trim($el.val()).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9']/g,'');
		var $p = $.mobile.activePage;
		if(val != ''){
            clearTimeout($el.data('maxLengthHandler'));
            $el.data('maxLengthHandler', setTimeout(function(){
                var val = $el.val()+'';
				if(val == ''){
					return;
				}
                val = viewJs.subStr($.trim(val).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9\s]/g,''), 40);
                $el.val(val);
                $p.addClass('keyword-input');
                me.getSearchData(val);
            },500));

		} else {
            $el.val('');
            $('#searchTips').empty();
            $p.removeClass('keyword-input');
            $('#searchKeywordTips').remove();
            $p.find('.ui-grid-c.around').show();
			$(".title").show();
		}
	}, pareServiceToHtml:function(data,type,idNum){
       // console.log(idNum)
		var $p = $.mobile.activePage;
		var tpl = $p.find('#service_item_tpl').html();
		var html = [],info={};
        var typePic;
        switch(idNum){
            case 1:
                typePic = mainJs.getSvrPicUrl;
                break;
            case 3:
                typePic = mainJs.getCoursPicUrl;
                break;
            case 4:
                typePic = mainJs.getActPicUrl;
                break;
        }
		$.each(data, function(idx, item) {
			info.id = item.id;
			//info.newPrice = item.money;
			info.newPrice = "￥"+item.money+((item.unit==undefined || item.unit=="")?"":("/"+item.unit));
			info.picUrl = typePic({url:item.picUrl,size:2});
			info.serviceName = item.title;
			info.realname = item.realname;
			info.watchNumber = item.realViewCount;
			info.creTime = item.creTime.substr(0,10);
			info.type = type;
			html.push(viewJs.applyTpl(tpl, info));
		});
		return html.join("");
	},pareWantToHtml:function(data,type){
		var $p = $.mobile.activePage;
		var tpl = $p.find('#want_item_tpl').html();
		var html = [],info={};
		$.each(data, function(idx, item) {
			info.id = item.id;
			info.price = item.money;
			info.realname = item.realname;
			info.userId = item.userID;
			info.wantName = item.title;
			info.content = item.content;
			info.creTime = item.creTime;
			info.type = type;
			html.push(viewJs.applyTpl(tpl, info));
		});
		return html.join("");;
	},pareUserToHtml:function(data,type){
		var $p = $.mobile.activePage;
		var tpl = $p.find('#user_item_tpl').html();
		var html = [],info={};
		$.each(data, function(idx, item) {
			var info = {};
			info.sex = viewJs.setSexMarkCls(item);
			var idcardValidated = 'empty';
			if(item.type == 2){
				idcardValidated = item.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
			} else if(item.isTeacherValidated == 1 || item.type == 3){
				idcardValidated = item.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
			}else if(item.isIdcardValidated == 1){
				idcardValidated = 'person';
			}
			info.userType= idcardValidated;
			info.idcardValidated = 'idcardValidated';
			/*
			 info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
			 info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
			 */
			var userTags = item.userTags;
			var tagHtmls = [];
			var i = 0 , l = userTags.length,tagItem;
			for(; i < l; i++){
				tagItem = userTags[i];
				if($.trim(tagItem.tagName) == "北大创新"){
					continue;
				}
				tagHtmls.push([
					'<div class="tagItem">',
					'<span class="tagName">',tagItem.tagName,
					'</span><span class="prvalue font-blue">',
					tagItem.prvalue == null ? '' : Math.floor(tagItem.prvalue),
					'</span>',
					'</div>'
				].join(''));
			}
			info.id = item.id;
			info.prvalue = Math.floor(item.prvalue);
			info.userName = item.realname;
			if(item.institutionUserName){
				info.institutionUserName = "所属公众号: "+item.institutionUserName;
			}
			info.img =  mainJs.getProfilePicUrl({url:item.picUrl,sex:item.sex});

			info.tag = tagHtmls.join('');
			info.type = type;
			html.push(viewJs.applyTpl(tpl, info));
		});
		return html.join("");
	},onclickItem:function(){
		var $m = $(this);
		var $p = $.mobile.activePage;
		var last = {url:'searchAll.html', id:'searchAll', options:{data:{keyword:$p.find('#keyword').val()}}};
		if(mainJs.parseUrlSearch().distance){
			last = {url:'searchAll.html', id:'searchAll', options:{data:{distance:mainJs.parseUrlSearch().distance}}};
		}
		if($m.is('.want') || $m.is('.question')){
			var params = {wantID:$m.attr('data-wantId')};
			if($m.is('.question')){
				viewJs.navigator.next({
					next:{url:'./question.html', id:'question', options:{data:params}},
					last:last
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./want.html', id:'want', options:{data:params}},
					last:last
				});
			}
		}else if($m.is('.user')){
			var params = {userId:$m.attr('data-userId')};
			viewJs.navigator.next({
				next:{url:'./u.html', id:'u', options:{data:params}},
				last:last});
		} else {
			var params = {serviceID:$m.attr('data-serviceID')};
			if($m.is('.course')){
				viewJs.navigator.next({
					next:{url:'./course.html', id:'course', options:{data:params}},
					last:last
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./service.html', id:'service', options:{data:params}},
					last:last
				});
			}
		}
	},toAll:function(){
		var $p = $.mobile.activePage;
		var $m = $(this);
		var keyword = $p.find('#keyword').val();
		var params = {orderType:4, area1:'中国', pageSize:20, offset:0, keyword:keyword,
			longitude:dmJs.params.geolocation.longitude, latitude:dmJs.params.geolocation.latitude
		};
		var last = {url:'searchAll.html', id:'searchAll', options:{data:{keyword:$p.find('#keyword').val()}}};
		if(mainJs.parseUrlSearch().distance){
			last = {url:'searchAll.html', id:'searchAll', options:{data:{distance:mainJs.parseUrlSearch().distance}}};
			params.distance = mainJs.parseUrlSearch().distance;
		}

		if($m.is('.toAllservice')){
			params.catId = 1;
			params.categoryParentId = 1;
			params.searchKind = 'services';
		}else if($m.is('.toAllcourse')){
			params.catId = 3;
			params.categoryParentId = 3;
			params.searchKind = 'course';
		}else if($m.is('.toAllactivity')){
			params.catId = 4;
			params.categoryParentId = 4;
			params.searchKind = 'activity';
		}else if($m.is('.toAllwant')){
			params.catId = 2;
			params.categoryParentId = 2;
			params.searchKind = 'wants';
		}else if($m.is('.toAllquestion')){
			params.catId = 5;
			params.categoryParentId = 5;
			params.searchKind = 'question';
		}else if($m.is('.toAlluser')){
			params.searchKind = 'users';
			params.orderType = 1;
		}
		viewJs.navigator.next({next:{
			id:'services',
			url:'./searchResult.html',
			options:{
				data:params
			}
		},last:last});
	}
};