function loadData(dataURL){
	dataURL = dataURL.replace(/amp;/g,'');
	let proxyURL = 'https://proxy.hxlstandard.org/data.json?force=on&filter01=cut&cut-skip-untagged01=o&url=dataURL';
	proxyURL = proxyURL.replace('dataURL',encodeURIComponent(dataURL));
	$.ajax({
            url: proxyURL,
            success: function(result){
                dataSets.push(result);
                $('#status').html('<p>Data Loaded Successfully</p>');
                let hb = hxlBites.data(result);
                let matches = generateBites(hb,result,dataURL);
                injectLayouts(hb,9);
                updateStatusForBites(bites,matches);
                setColors(0);

            },
            error: function(err){
            	console.log(err);
            	$('#status').html(err['responseJSON']['message']);
            }
    });
}

function updateStatusForBites(bites,matches){
	$('#status').append('<p>'+bites.charts.length+' chart(s) generated');
	$('#status').append('<p>'+bites.maps.length+' map(s)  generated');
	//$('#status').append('<p>'+bites.crossTables.length+' cross table(s) generated');
	$('#status').append('<p>'+bites.headlines.length+' headline figure(s) generated');
	if(matches>2){
		$('#status').append('<div class="greencheck"><i class="check icon"></i></div>');
		/*setTimeout(function(){
			$('#status').slideUp()
		},1000)*/
		
	}
}

function generateBites(hb,data,dataURL){
	
	let matches = 0;
	let headline = 0;
	let row = 0;
	let line = 0;
	let map = 0;
	hb.getChartBites().forEach(function(bite){
		matches++;
		bites.charts.push({'data':dataURL,'bite':bite});
		$('#chartcontent').append('<div class="col-md-4"><div id="chartselect'+row+'" class="chartedit"></div></div>');
		charts.push(createChart('#chartselect'+row,[bite],true));
		row++;
	});
	hb.getTimeSeriesBites().forEach(function(bite){
		bites.time.push({'data':dataURL,'bite':bite});
		$('#timecontent').append('<div class="col-md-4"><div id="timeselect'+line+'" class="timeedit"></div></div>');
		charts.push(createChart('#timeselect'+line,[bite],true));
		line++;
	});
	hb.getMapBites().forEach(function(bite){
		bites.maps.push({'data':dataURL,'bite':bite});
		$('#mapcontent').append('<div class="col-md-4"><div id="mapselect'+map+'" class="mapedit"><p>'+bite.title+'</p><img class="mappreview" src="'+mapPreviewURL+'"></div></div>');
		matches++;
		map++;
	});
	hb.getCrossTableBites().forEach(function(bite){
		bites.crossTables.push({'data':dataURL,'bite':bite});
		matches++;
	});
	hb.getTextBites().forEach(function(bite){
		if(bite.subtype == 'topline figure'){
			console.log(bite);
			bites.headlines.push({'data':dataURL,'bite':bite});
			$('#headlinecontent').append('<div class="col-md-4"><div id="headlineselect'+headline+'" class="headlinefigure headlinefigureedit"></div></div>');
			createHeadLineFigure('#headlineselect'+headline,bite);
			matches++;
			headline++;
		}
		
	});
	let filters = [];
	for(let i = 0;i<data[0].length;i++){
		filters.push({'header':data[0][i],'tag':data[1][i]});
		$('#filterselect').append('<option value="'+data[0][i]+'('+data[1][i]+'">'+data[0][i]+'('+data[1][i]+')</option>')
	}
	return matches;
}

function populateEditor(hb){
	$('#create-title').val(config.title);
	$('#create-description').val(config.subtext);
	config.headlinefigurecharts.forEach(function(headline,i){
		$('#headlinechooser').slideDown();
		if(headline.chartID!=''){
			let bite = hb.reverse(headline.chartID);
			let head = {'data':headline.data,'bite':bite};
			addHeadline(head,i)
		}
	});
	populateCharts(hb);
    config.filters.forEach(function(filter,i){
    	if(filter.text!=''){
    		addFilter(i,filter.text+' ('+filter.tag+')');
    		$('#filterchooser').slideDown();
		}
    });
    setColors(config.color);
}

function populateCharts(hb){
	config.charts.forEach(function(chart,i){
		if(chart.chartID!=''){
			let bite = hb.reverse(chart.chartID);
			if(bite.type=='chart'){
				createChart('#dashchart'+i,[bite],true);
				$('#dashchart'+i+' .bitetitle').append('<i data-id="'+i+'" class="edit icon editchartbutton"></i>');
				$('#dashchart'+i+' .editchartbutton').on('click',function(){
					chooseChart($(this).attr('data-id'));
				});
	        }
	        if(bite.type=='map'){
	            if(chart.scale==undefined){
	                chart.scale = 'linear';
	            }
	            createMap('#dashchart'+i,bite);
				$('#dashchart'+i+' .bitetitle').append('<i data-id="'+i+'" class="edit icon editchartbutton"></i>');
				$('#dashchart'+i+' .editchartbutton').on('click',function(){
					chooseChart($(this).attr('data-id'));
				});
	        }
	    }
    });
}

function injectLayouts(hb,max){
	for(var i=0;i<max;i++){
		let current = i;
		let html = '<div id="layout'+i+'" class="col-md-3 layout"></div>';
		$('#layoutsegmentcontent').append(html);
		$.ajax({
            url: gridURL.replace('xxx',(current+1).toString()),
            success: function(result){
            	if(current+1==config.grid){
            		$('#layoutchooser').slideUp();
            		insertLayout(result);
            		populateEditor(hb);
            	}
                $('#layout'+current).html(result);
                $('#layout'+current).on('click',function(){
                	$('#layoutchooser').slideUp();
                	config.grid = current+1;
                	insertLayout(result);
                	populateCharts(hb);
                });
            },
            error: function(err){
            	console.log(err);
            	$('#status').html(err['responseJSON']['message']);
            }
    	});
	}
}

function insertLayout(html){
	$('#dashboardlayout').html(html);
	$('#dashboardlayout .chart').each(function(index){
		$(this).attr("id","dashchart"+index);
		$( this ).html('<i id="chartedit'+index+'" data-id="'+index+'" class="plus circle icon large plusicon">');
		$('#chartedit'+index).on('click',function(){
			chooseChart(index);
		});
	});
}

function chooseChart(index){
	$('#chartmodal').modal({
		duration:0,
	    onVisible: function () {
	    	charts.forEach(function(chart){
	    		chart.update();
	    	});
	    	$('#chartmodal').modal('refresh');
	    }
	}).modal('show');
	bites.charts.forEach(function(chart,i){
		$("#chartselect"+i).off();
		$("#chartselect"+i).on('click',function(){
			$('#chartmodal').modal('hide');
			createChart('#dashchart'+index,[chart.bite],true);
			$('#dashchart'+index+' .bitetitle').append('<i data-id="'+index+'" class="edit icon editchartbutton"></i>');
			$('#dashchart'+index+' .editchartbutton').on('click',function(){
				chooseChart($(this).attr('data-id'));
			});
			config.charts[index].data = chart.data;
			config.charts[index].chartID = chart.bite.uniqueID;
		});
	});
	bites.time.forEach(function(chart,i){
		$("#timeselect"+i).off();
		$("#timeselect"+i).on('click',function(){
			$('#chartmodal').modal('hide');
			createChart('#dashchart'+index,[chart.bite],true);
			$('#dashchart'+index+' .bitetitle').append('<i data-id="'+index+'" class="edit icon editchartbutton"></i>');
			$('#dashchart'+index+' .editchartbutton').on('click',function(){
				chooseChart($(this).attr('data-id'));
			});
			config.charts[index].data = chart.data;
			config.charts[index].chartID = chart.bite.uniqueID;
		});
	});
	bites.maps.forEach(function(mp,i){
		$("#mapselect"+i).off();
		$("#mapselect"+i).on('click',function(){
			$('#chartmodal').modal('hide');
			createMap('#dashchart'+index,mp.bite);
			$('#dashchart'+index+' .bitetitle').append('<i data-id="'+index+'" class="edit icon editchartbutton"></i>');
			$('#dashchart'+index+' .editchartbutton').on('click',function(){
				chooseChart($(this).attr('data-id'));
			});
			config.charts[index].data = mp.data;
			config.charts[index].chartID = mp.bite.uniqueID;
		});
	});	
}

$('.colorpick').on('click',function(){
	let num = $(this).attr('data-id');
	setColors(num);
	$('#colorchooser').slideUp();
});

function setColors(num){
	$('#colourstyle').html('.ct-legend .ct-series-0:before {background-color: '+colors[num]+';border-color:'+colors[num]+'} .circlepoint {stroke: '+colors[num]+';fill:'+colors[num]+'} .ct-series-a .ct-bar {stroke: '+colors[num]+'} .ct-series-a .ct-line {stroke: '+colors[num]+'} .mapcolor0 {fill: '+mapColors[num][0]+';background-color:'+mapColors[num][0]+';} .mapcolor1 {fill: '+mapColors[num][1]+';background-color:'+mapColors[num][1]+';} .mapcolor2 {fill: '+mapColors[num][2]+';background-color:'+mapColors[num][2]+';} .mapcolor3 {fill: '+mapColors[num][3]+';background-color:'+mapColors[num][3]+';} .mapcolor4 {fill: '+mapColors[num][4]+';background-color:'+mapColors[num][4]+';} .headlinenumber{border-bottom-color:'+colors[num]+'}');
	config.color = num;
}

$('#filterplus').on('click',function(){
	$('#filterchooser').slideDown();
});

$('#headlineplus').on('click',function(){
	$('#headlinechooser').slideDown();
});

$('.headlineselectbutton').on('click',function(){
	var headlineNum = $(this).attr('data-id');
	chooseHeadline(headlineNum);
});

function chooseHeadline(headlineNum){
	$('#headlinemodal').modal('show');
	bites.headlines.forEach(function(headline,i){
		$("#headlineselect"+i).off();
		$("#headlineselect"+i).on('click',function(){
			$('#headlinemodal').modal('hide');
			addHeadline(headline,headlineNum);
		});
	});
}

function addHeadline(headline,headlineNum){
	createHeadLineFigure('#headline'+headlineNum,headline.bite);
	$('#headline'+headlineNum).append('<i data-id="'+headlineNum+'" class="edit icon large editchartbutton"></i>');
	$('#headline'+headlineNum+' .editchartbutton').on('click',function(){
		chooseHeadline(headlineNum);
	});	
	$('#headline'+headlineNum).append('<i data-id="'+headlineNum+'" class="close icon large deletechartbutton"></i>');
	$('#headline'+headlineNum +' .deletechartbutton').on('click',function(){
		config.headlinefigurecharts[headlineNum] = {"data":"","chartID":""};
		$('#headline'+headlineNum).html('<i data-id="'+headlineNum+'" class="plus circle icon large plusicon headlineselectbutton"></i>');
		$('.headlineselectbutton').on('click',function(){
			var headlineNum = $(this).attr('data-id');
			chooseHeadline(headlineNum);
		});		
	});	
	config.headlinefigurecharts[headlineNum].data = headline.data;
	config.headlinefigurecharts[headlineNum].chartID = headline.bite.uniqueID;
}

$('.filterselectbutton').on('click',function(){
	
	var filterNum = $(this).attr('data-id');
	chooseFilter(filterNum);
});

function chooseFilter(filterNum){
	$('#filtermodal').modal('show');
	$("#addfilter").off();
	$("#addfilter").on('click',function(){
		$('#filtermodal').modal('hide');
		let val = $('#filterselect').val();
		addFilter(filterNum,val);
	});	
}

function addFilter(filterNum,val){
	$('#filter'+filterNum).html('<p>Filter for '+val+'</p>');
	$('#filter'+filterNum).append('<i data-id="'+filterNum+'" class="edit icon large editchartbutton"></i>');
	$('#filter'+filterNum+' .editchartbutton').on('click',function(){
		chooseFilter($(this).attr('data-id'));
	});
	$('#filter'+filterNum).append('<i data-id="'+filterNum+'" class="close icon large deletechartbutton"></i>');
	$('#filter'+filterNum +' .deletechartbutton').on('click',function(){
		config.filters[filterNum] = {"text":"","tag":""};
		$('#filter'+filterNum).html('<i data-id="'+filterNum+'" class="plus circle icon large plusicon filterselectbutton"></i>');
		$('.filterselectbutton').on('click',function(){
			var filterNum = $(this).attr('data-id');
			chooseFilter(filterNum);
		});		
	});
	config.filters[filterNum].text = val.split('(')[0];
	config.filters[filterNum].tag = val.split('(')[1].split(')')[0];
}

$('#save').on('click',function(){
	config.title = $('#create-title').val();
	config.subtext = $('#create-description').val();
	$('#formconfig').val(encodeURIComponent(JSON.stringify(config)));
	$('#savemodal').modal('show');
});

$('.menu .item').tab({'onVisible':function(){
		charts.forEach(function(chart){
			chart.update();
		});
	}
});

$('#layoutedit').on('click',function(){
	$('#layoutchooser').slideDown();
});

$('#styleedit').on('click',function(){
	$('#colorchooser').slideDown();
});

if(create=='True'){
	$('#updateform').remove();
} else {
	$('#saveform').remove();
	$('#form1').attr("action",'/update/'+id);
}

let bites = {'charts':[],'maps':[],'crossTables':[],'headlines':[],'time':[]};
let dataSets = [];
let charts = [];
var colors=['#E53935','#2196F3','#283593','#388E3C','#FDD835'];
var mapColors = [['#FFEBEE','#FFCDD2','#E57373','#F44336','#d70206'],['#E3F2FD','#90CAF9','#2196F3','#1976D2','#0D47A1'],['#C5CAE9','#7986CB','#3F51B5','#283593','#1A237E'],['#E8F5E9','#A5D6A7','#66BB6A','#388E3C','#1B5E20'],['#FFF9C4','#FFF176','#FDD835','#F9A825','#F57F17']];
loadData(dataURL);
