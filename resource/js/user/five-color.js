/**
 * Created by lchysh on 14-12-17.
 */
fiveColorJs = {
    init: function () {
        var me = this;
        var fcIndexmap = {'critique':0, 'aesthetics':1,'life':2, 'design':3, economy:4};
        var labels = [{
            txt: "批判思维",
            color:'#de303c'
        },{
            txt:"美学思维",
            color:'#237abe'
        }, {
            txt:"生命思维",
            color:'#1da942'
        }, {
            txt:"设计思维",
            color:'#b30082'
        }, {
            txt:'经济思维',
            color:'#f6cc9a'
        }];
        me.drawChart([0,0,0,0,0],labels);
        dmJs._ajax({
            url:'/urming_quan/user/getUserFCTags',
            params:{accessToken:dmJs.getAccessToken()},
            callback:function(ret){
                me.data=ret;
                var data = [];
                for(var k in ret){
                    data[fcIndexmap[k]] = ret[k];
                }
                me.drawChart(data,labels,{});
            }
        });

    },drawChart:function(data,labels,opt){
        var $c = $('#chartDiv').empty();
        var $chart = $.radarChartJs.init({
            font:{
                offset:{
                    x:0,
                    y:10
                },
                size:14,
                family:'sans-serif'
            },
            size:[290,250],
            labelWidth:55,
            steps:4,
            baseColor:'#cccccc'||'#999999',
            chartColor:'rgba(8, 44, 121, 0.77)' || 'rgba(25, 126, 238, 0.5)'||'#197eee' || '#509df2',
            labels:labels,
            data:[data]
        });
        $c.append($chart.canvas);
        $chart.draw(opt);
    }
};