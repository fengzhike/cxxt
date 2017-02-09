headerFooterJs = {
	init:function(){
        if(self != top){
           // alert(1)
            //$('.ui-header').hide();
        }else{
            this.initHeader();
            this.initFooter();
        }
	},insertMenuItem:function(){
		var $p = $.mobile.activePage;
		var $m = $p.find('.h-menu:first');
		
	},initHeader:function(){
		var $p = $.mobile.activePage;
        var id = $.trim($p.attr('id'));
        $('#faviconLnk,#apple-touch').remove();
        $(document.head).append('<link id= "faviconLnk" rel="shortcut icon" href="resource/images/favicon.ico">');
        $(document.head).append('<link id="apple-touch" rel="apple-touch-icon-precomposed" sizes="72x72" href="../resource/images/course-icon-96.png">');

		if($p.is('[noRightTopMenu]') ||(mainJs.parseUrlSearch().searchKind === "question")){
            setTimeout(function(){
                $('#top-right-menu-area .icon-btn.btn-pos-top').unbind('click').click(headerFooterJs._action);
            }, 500);
			return;
		}
        var $h = $p.find('.ui-header:first');
        var items = {
            startpage:'<a class="icon-btn btn-pos-top icon-home" action="home">首页</a>',
            services:'<a class="icon-btn btn-pos-top icon-search" action="search">搜索</a>',
//            sysMessage:'<a class="icon-btn btn-pos-top icon-message" action="menu-message">消息</a>',
            selectPublish: '<a class="icon-btn btn-pos-top icon-publish" action="menu-publish">发布</a>',
            mine:'<a class="icon-btn btn-pos-top icon-user-center" action="user-center">我的</a>',
            myOrders: '<a class="icon-btn btn-pos-top icon-order" action="menu-found">周围</a>'
        }
        items[id] = null;
        switch(id){
            case 'startpage':
                items.publish = null;
                items.mine = null;
                items.sysMessage = null;
                break;
            case 'services':
                var initParam = mainJs.parseUrlSearch();
                if($.trim(initParam.keyword) != ''){
                    items.sysMessage = '<a class="icon-btn btn-pos-top icon-message" action="menu-message">消息</a>';
                }
                break;
        }
        var menuItems = [];
        for(var k in items){
            if(items[k]){
                menuItems.push(items[k]);
            }
        }
		$h.find('.icon-menu').remove();
		//$p.find('.h-menu:first').remove();
		$p.one('pagehide', function(){
			$h.find('.icon-menu').remove();
			//$p.find('.h-menu:first').remove();
		});
		var btn1 = $p.children('.menu-items-setting:first');
		var extraBtns = [];
		$h.append(['<div id="top-right-menu-area">','<a class="icon-menu menu-btn"></a>',
            (items.sysMessage || id =='sysMessage' ? '' :
            '<a class="icon-menu menu-message" action="menu-message"><span id="msg_num"></span></a>'),'</div>'].join(''));
		var menu = $(['<div class="h-menu">',
            menuItems.join(''),
		'</div>'].join('')).hide().insertAfter($h);
		var l = extraBtns.length + menuItems.length;
		menu.find('.icon-btn').css('width', (Math.floor(100/l))+'%');
		setTimeout(function(){
			$h.find('.icon-menu.menu-btn').on('vclick', function(){
				menu.toggle();
			});
            $h.delegate('[action]', 'vclick',headerFooterJs. _action);
            menu.delegate('[action]', 'vclick',headerFooterJs. _action);
		}, 500);
	},_action:function(){
        var $el = $(this);
        var action = $.trim($el.attr('action'));
        if(action ==''){
            return;
        }
        var next;
        switch(action){
            case 'home':
                next = {url:'./'};
                break;
            case 'search':
                next = {url:'./searchAll.html',id:'searchAll'};
                break;
            case 'user-center':
                next = {url:'./mine.html',id:'mine'};
                break;
            case 'menu-message':
                next = {url:'./sysMessage.html',id:'sysMessage'};
                break;
            case 'menu-publish':
                next = {url:'./selectPublish.html',id:'selectPublish'};
                break;
            case 'menu-order':
                next = {url:'./myOrders.html',id:'myOrders'};
                break;
            case 'menu-found':
                next = {url:'./found.html',id:'found'};
                break;
            case 'menu-calendar':
                next = {url:'./calendar.html',id:'calendar'};
                break;
            default:
                // eval(action+'(this)');
                break;
        }
        switch(action){
            case 'user-center':
            case 'menu-message':
            case 'menu-publish':
            case 'menu-order':
            case 'menu-calendar':
                if(!viewJs.chkLogin(next)){
                    return;
                }
        }
        if(next){
            viewJs.navigator.next({next:next,lastAuto:true});
        }
    },initFooter:function(){
		var $p = $.mobile.activePage;
        if($p.is('[no-footer]')){
            return;
        }
        //ios审核修改
        /*
		if($('#toTop').length == 0){
			$('<a id="toTop"></a>').appendTo(document.body).on('vclick', function(e){
				e.preventDefault();
				e.stopPropagation();
				viewJs.top();
			});
		}
		*/
		$p.find('.ui-footer.footer-bar').remove().end().append([
			'<div data-role="footer" class="footer-bar">',
				'<div class="btngrp1 footer1">',
					'<div class="notLoginShow">',
					  '<a class="ui-btn ui-icon-back toLogin" >登录</a><em>|</em>',
					  '<a class="ui-btn ui-icon-back toRegister">注册</a>',
                        '<a class="toCitylist ui-link ui-btn-left ui-btn ui-icon-carat-d ui-btn-icon-right ui-shadow ui-corner-all">',
                        '北京',
                        '</a>',
					'</div>',
					'<div class="loginShow">',
					  '<a class="ui-btn ui-icon-back loginName toLoginUserPage"></a><em>|</em>',
					  '<a class="ui-btn ui-icon-back logout logoutBtn">退出</a>',
                        '<a class="toCitylist ui-link ui-btn-left ui-btn ui-icon-carat-d ui-btn-icon-right ui-shadow ui-corner-all">',
                        '北京',
                        '</a>',
					'</div>',
				'</div>',
                /*
				'<div class="footer2">',
					'<a class="footer-text toHomePage">首页</a><em>|</em>',
					'<a class="footer-text"  data-ajax="false" link="./download.html">安卓版</a><em>|</em>',
					'<a class="footer-text" data-ajax="false" link="./help.html">帮助</a><em>|</em>',
                    '<a class="footer-text" data-ajax="false" link="./about.html">关于</a>',
					'<br>',
					'<p class="copyright">©2014 有名网 京ICP备15010597号</p>',
				'</div>',
				*/
                '</div>'
		].join('')).enhanceWithin();
         $p.find('.toCitylist').html(dmJs.params.geolocation.city + '');


        //fsk
        var search = mainJs.parseUrlSearch();
        if(search.keyword == '2016大赛'||search.catName=='bigsai'){
            if(1){ $p.find('.loginShow').append('<a class="lang_turn">To English</a>')}
            var lang = sessionStorage.getItem('lang');
            var pubData = lang == 'en'? pubEnJs:pubCnJs;
            $p.find('.lang_turn').html(pubData.turnLang)
            $p.find('.toCitylist').hide();
            $p.find('.ui-btn.ui-icon-back.logout').html(pubData.exit)
        }
        $('#filter-cite').html(dmJs.params.geolocation.city);
		var $f = $p.find('.ui-footer');
		setTimeout(function(){
			$f.undelegate();
			$f.delegate('.toRegister', 'vclick', function(e){
				viewJs.navigator.next({
					next:{url:'./selectRegister.html', id:'selectRegister'},
					lastAuto:false
				});
			}).delegate('.toHomePage','vclick', function(){
				viewJs.navigator.next({next:{url:'./', id:'startpage'}});
			}).delegate('.toLoginUserPage','vclick', function(e){
				var loginUser = dmJs.sStore.getUserInfo();
				if(loginUser == null){
					dmJs.sStore.toLogin({url:'./mine.html'});
					return;
				}
				viewJs.navigator.next({next:{url:'./mine.html', id:'mine'}});
			}). delegate('.toCitylist', 'vclick', function(){
                viewJs.navigator.next({next:{url:'./changeCity.html', id:'changeCity'},lastAuto:true});
            }). delegate('[link]','vclick', function(e){
				e.preventDefault();
				e.stopPropagation();
				location.href = $(this).attr('link');
			}).delegate('.logoutBtn', 'vclick', viewJs.toConfirmLogout);
            $p.delegate('.lang_turn','vclick',function(){
               // alert(1)
                var lang = sessionStorage.getItem('lang');
                if(lang == 'en'){
                    sessionStorage.setItem('lang','cn');
                }else{
                    sessionStorage.setItem('lang','en')
                }

                setTimeout(function(){
                    window.location.href = location
                },100)
            });
		}, 500);
		viewJs.afterToggleLogin();
	}
};