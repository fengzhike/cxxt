calendarJs = {
    init:function(){
        this.clear();
        this.toggleEvents(true);
        this.fetchData();
    },clear:function(){
        var $p = $.mobile.activePage;
        $p.find('.calendarList').empty();
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = calendarJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                //$p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('.calendarList [action]', 'vclick', me.doAction).delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
                $p.delegate('#filter-follow', 'input', me.filterList);
                $p.delegate('.lr', 'vclick', me.Month);
                $p.delegate('.stop', 'click', me.select);
                $p.delegate('.sbox li', 'click', me.getym);
                $p.delegate('.today', 'vclick', me.now);
                $p.delegate('td', 'vclick', me.setCurr);
            }, 500);

        }
    },doAction:function(){
        var $el = $(this);
        var me = calendarJs;
        var sAction = $el.attr('action');
        var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
        viewJs.navigator.next({next:{url:'./'+sAction+'.html',id:sAction=="search"?'doSearchSvr':sAction,options:{data:param}}, lastAuto:true});
    },fetchData:function(evt){
        var me = calendarJs;
        me.SY = new Date().getFullYear();
        me.SM = new Date().getMonth()+1;
        me.SD = new Date().getDate();
        me.initCalendar(me.SY,me.SM);
    },initCalendar:function(year,month){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        $p.find("#cy").html(year);
        $p.find("#cm").html(month);
        var params = {year:year,month:month,accessToken:dmJs.getAccessToken()};
        dmJs._ajax({
            method:'POST',
            id:'getCalendarData',
            url:'/urming_quan/service/getCalendarData',
            params:params,
            callback:function(data){
                //console.log(data)
                me._data = data.datas;
                me.getDynamicTable(year,month);
                $("#YearAll").html(me.YearAll(me.SY));
                $("#DateAll").html(me.DateAll(me.SY,me.SM));
            }
        }).complete(function(){
        });

        //fsk红点提醒
        var params = {
            accessToken : dmJs.sStore.getUserInfo()?dmJs.sStore.getUserInfo().accessToken:'',
            distance:5000,
            longitude: dmJs.params.geolocation.longitude,
            latitude: dmJs.params.geolocation.latitude

        }

        dmJs._ajax({
            id:'getAroundHints',
            url:'/urming_quan/system/getAroundHints',
            params:params,
            callback:me.setRemindTips
        });

    },setRemindTips:function(data){
        var $p = $.mobile.activePage;
        if(data.courseHint||data.serviceHint||data.wantHint||data.questionHint||data.activityHint){
            $p.find('.remind').show();
        }else{
            $p.find('.remind').hide();
        }
        //console.log(111)
    },loadList:function(){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        var list = me._data[$p.find("#cy").html()+'-'+me.fix($p.find("#cm").html(),2)+'-'+me.fix($p.find(".curr").html().replace(/<[^>]*>|/g,""),2)];
        var l = list?list.length:0;
        var html = [];
        var $list = $p.find('.calendarList');
        var parentCategory = {1:"服务",2:"需求",3:"课程",4:"活动",5:"问题",6:"答案",7:"招聘"};
        var style = {3:"course",4:"activity"};
        var actionArr = {3:"course",4:"service"};
        if(l > 0){
            var tpl = $p.find('#calendar_item_tpl').html();
            var item,info;
            for(var i = 0; i < l; i++){
                item = list[i];
                info = {/*id:item.id*/};
                info.name = item.serviceName;
                info.startTime = item.startTime;
                info.address = item.address;
                info.parentCategory = parentCategory[item.category.category.id];
                info.style = style[item.category.category.id];
                var param = {};
                var action = "";
                if(!item.type){
                    param.serviceID = item.id;
                    action = actionArr[item.category.category.id];
                }else if(item.type == 10){
                    param = {catId:1,catName:'服务'};
                    action = "addService";
                }else if(item.type == 22){
                    param = {catId:5,catName:'问题'};
                    action = "addQuestion";
                }else if(item.type == 23){
                    param = {catId:4,catName:'活动'};
                    action = "addService";
                }else if(item.type == 24){
                    param = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
                        longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude,
                        searchKind:"question","categoryName":"问题","categoryParentId":"5","catId":"5"};
                    action = "searchResult";
                }else if(item.type == 25){
                    action = "search";
                }else if(item.type == 26){
                    action = "innovationEvaluateExplain";
                }else if(item.type == 27){
                    param = {catId:1,catName:'众筹让股'};
                    action = "addService";
                }else if(item.type == 28){
                    action = "myDiplomas";
                }
                info.param = $.param(param);
                info.action = action;
                html.push(viewJs.applyTpl(tpl, info));
            }
        }else {

            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon-old"></div><div class="not_found_tip">今日无日程安排</div></div>'];
        }
        $list.html(html.join(''));
    },setCurr:function(){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        var $m = $(this);
        if($m.html()==""){
            return;
        }
        $p.find(".curr").removeClass("curr");
        $m.addClass("curr");
        me.loadList();
    },YearAll:function(Y){
        var me = calendarJs;
        var Ystr = "";
        for (var y = Y - 5; y <= Y + 5; y++) {
            Ystr += "<li>"+ y +"</li>";
        }
        return Ystr
    },DateAll:function(Y,M){
        var me = calendarJs;
        var Mstr = "",Mnum = me.GetDaysInMonth(Y,M);
        for (var m = 1; m <= 12; m++) {
            Mstr += "<li>"+ (m < 10 ? "0" + m : m) +"</li>";
        }
        return Mstr
    },getym:function (event){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        var $m = $(this);
        var cy = $p.find("#cy");
        var cm = $p.find("#cm");
        var parentId = $m.parent().attr("id");
        if(parentId == 'YearAll'){
            cy.html($m.html());
        }else if(parentId == 'DateAll'){
            cm.html($m.html());
        }
        me.initCalendar(parseInt(cy.html()),parseInt(cm.html()));
        $p.find(".sbox").hide();
        event.stopPropagation();
    },Month:function(){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        var $m = $(this);
        var cy = $p.find("#cy");
        var cm = $p.find("#cm");
        var y = parseInt(cy.html()),m = parseInt(cm.html());
        if ($m.html() == "&lt;") {
            if (m <= 1) {
                m = 12;
                y --;
            } else {
                m --;
            }
        } else {
            if (m >= 12) {
                m = 1;
                y ++;
            } else {
                m ++;
            }
        }
        cy.html(y);
        cm.html(m);
        me.initCalendar(y,m);
    },select:function(){
        var $m = $(this);
        $m.next().toggle();
    },now:function(){
        var me = calendarJs;
        var $p = $.mobile.activePage;
        me.initCalendar(me.SY,me.SM);
        $p.find("#cy").html(me.SY);
        $p.find("#cm").html(me.SM);
    },getDynamicTable:function(Y,M){
        var me = calendarJs;
        var Temp,i,j;
        var FirstDate,MonthDate,CirNum,ErtNum;// '当月第一天为星期几,当月的总天数,表格的单元格数及循环数,表格第一排空格数与当月天数之和
        FirstDate = me.GetWeekdayMonthStartsOn(Y,M);// '得到该月的第一天是星期几  0-6
        MonthDate = me.GetDaysInMonth(Y,M);// '得到该月的总天数 30
        ErtNum = FirstDate + MonthDate;// -1

        Temp = "";
        if (ErtNum > 35){
            CirNum = 42;
        }else if (ErtNum == 28){
            CirNum = 28;
        }else{
            CirNum = 35;
        }
        j=1;
        //alert(Y+","+M)
        //alert("第一天:"+FirstDate+"; 总天数:"+MonthDate+"; ErtNum:"+ErtNum+"; 表格行数:"+(CirNum/7))
        for (i = 1; i <= CirNum; i++){
            if (i == 1){
                Temp += "<table><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr><tr>";
            }
            if (i < FirstDate + 1 || i > ErtNum){
                Temp += "<td></td>";
            }else{
                var triangle = "";
                if(me._data[Y+'-'+me.fix(M,2)+'-'+me.fix(j,2)]) triangle = "<div class='triangle'></div>";
                Temp += (me.SY == Y && me.SM == M && me.SD == j ? "<td class='now curr'>" : "<td>") + j + triangle +"</td>";
                j = j + 1;
            }
            if (i % 7 == 0 && i < ErtNum){
                Temp += "</tr><tr>";
            }
            if (i == CirNum){
                Temp += "</tr></table>";
            }
        }
        $("#DayAll").html(Temp);
        if(me.SY == Y && me.SM == M){
            me.loadList();
        }
    },GetDaysInMonth:function(Y,M){//'得到该月的总天数
        if (M==1||M==3||M==5||M==7||M==8||M==10||M==12)
            return 31;
        else if (M==4||M==6||M==9||M==11)
            return 30;
        else if (M==2)
            if((Y%4==0 && Y%100!=0)||(Y%100==0 && Y%400==0))
                return 29;
            else
                return 28;
        else
            return 28;
    },GetWeekdayMonthStartsOn:function(Y,M){//'得到该月的第一天是星期几
        var date = new Date(Y,M-1,1);
        return date.getDay();
    },fix:function(num, length) {
        return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
    }
};