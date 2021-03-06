/**
 * Common util methods
 */
var week = moment.weekdaysShort();
var month = ['4th', '8th', '12th', '16th', '20th', '24th', '28th'];
var year = moment.monthsShort();

//string format function
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }

  return s;
};

//dismiss remove mdl-card from page
dismiss = function(obj) {
	$(obj).closest('.mdl-cell').remove();
};

//get local time by the client's timezone
getLocalDate = function(dt, offset) {
    //console.log('datetime: ' + dt + ' and tz: ' + offset );
    //var local = moment(dt).utcOffset(parseInt(offset) * -1).format('HH:mm:ss');
    var local = moment(dt).clone();
    local.add(offset * 60, 'minutes');
    //local = local.format('HH:mm:ss');
    //console.log('local time: ' + local);
    return local;
}

getTime = function(dt, offset, timezone) {
    var date = getLocalDate(dt,offset);
    if(timezone.indexOf("America") >= 0)
        return date.format('HH:mm:ss a');
    else
        return date.format('HH:mm:ss');
}

getHourMinute = function(dt, offset, timezone) {
    var date = getLocalDate(dt,offset);
    var hour = date.hour();
    var ampm = "";

    if(timezone && timezone.indexOf("America") >= 0) {
        if (hour >= 13) {
            date.add(-12, "hours");
            ampm = "pm";
        }
        else
        {
            ampm = "am";
        }
    }
    return date.format("HH:mm") + " " + ampm;
}

getFormattedDateString = function(dt, offset){
    var date = getLocalDate(dt,offset);
    var weekday = date.format('dddd').toUpperCase();
    var month = date.format('MMMM').toUpperCase();
    var day = date.format('D');
    var year = date.format('YYYY')

    //if(day == '1' || day == '21' || day == '31') day += 'st';
    //else if(day == '2' || day == '22') day += 'nd';
    //else if(day == '3' || day == '23') day += 'rd';
    //else day += 'th';

    return weekday + " " + month + " " + day + ", " + year;
}

getHour = function(dt, offset) {
    var date = getLocalDate(dt,offset);
    return date.hour();
}

function showDialog(options) {
    options = $.extend({
        id: 'orrsDiag',
        title: null,
        text: null,
        negative: false,
        positive: false,
        cancelable: true,
        contentStyle: null,
        onLoaded: false
    }, options);

    // remove existing dialogs
    $('.dialog-container').remove();
    $(document).unbind("keyup.dialog");

    $('<div id="' + options.id + '" class="dialog-container"><div class="mdl-card mdl-shadow--16dp"></div></div>').appendTo("body");
    var dialog = $('#orrsDiag');
    var content = dialog.find('.mdl-card');
    if (options.contentStyle != null) content.css(options.contentStyle);
    if (options.title != null) {
        $('<h5>' + options.title + '</h5>').appendTo(content);
    }
    if (options.text != null) {
        $('<p>' + options.text + '</p>').appendTo(content);
    }
    if (options.negative || options.positive) {
        var buttonBar = $('<div class="mdl-card__actions dialog-button-bar"></div>');
        if (options.negative) {
            options.negative = $.extend({
                id: 'negative',
                title: 'Cancel',
                onClick: function () {
                    return false;
                }
            }, options.negative);
            var negButton = $('<button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="' + options.negative.id + '">' + options.negative.title + '</button>');
            negButton.click(function (e) {
                e.preventDefault();
                if (!options.negative.onClick(e))
                    hideDialog(dialog)
            });
            negButton.appendTo(buttonBar);
        }
        if (options.positive) {
            options.positive = $.extend({
                id: 'positive',
                title: 'OK',
                onClick: function () {
                    return false;
                }
            }, options.positive);
            var posButton = $('<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="' + options.positive.id + '">' + options.positive.title + '</button>');
            posButton.click(function (e) {
                e.preventDefault();
                if (!options.positive.onClick(e)) {
                    hideDialog(dialog);
                }
            });
            posButton.appendTo(buttonBar);
        }
        buttonBar.appendTo(content);
    }
    componentHandler.upgradeDom();
    if (options.cancelable) {
        dialog.click(function () {
            hideDialog(dialog);
        });
        $(document).bind("keyup.dialog", function (e) {
            if (e.which == 27)
                hideDialog(dialog);
        });
        content.click(function (e) {
            e.stopPropagation();
        });
    }
    setTimeout(function () {
        dialog.css({opacity: 1});
        if (options.onLoaded)
            options.onLoaded();
    }, 1);
}

function hideDialog(dialog) {
    $(document).unbind("keyup.dialog");
    dialog.css({opacity: 0});
    setTimeout(function () {
        dialog.remove();
    }, 400);
}

createSnackbar = (function() {
  // Any snackbar that is already shown
  var previous = null;

/*
<div class="paper-snackbar">
  <button class="action">Dismiss</button>
  Messages
</div>
*/

  return function(message, actionText, action) {
    if (previous) {
      previous.dismiss();
    }
    var snackbar = document.createElement('div');
    snackbar.className = 'paper-snackbar';
    snackbar.dismiss = function() {
      this.style.opacity = 0;
    };
    var text = document.createTextNode(message);
    snackbar.appendChild(text);
    if (actionText) {
      if (!action) {
        action = snackbar.dismiss.bind(snackbar);
      }
      var actionButton = document.createElement('button');
      actionButton.className = 'action';
      actionButton.innerHTML = actionText;
      actionButton.addEventListener('click', action);
      snackbar.appendChild(actionButton);
    }
    setTimeout(function() {
      if (previous === this) {
        previous.dismiss();
      }
    }.bind(snackbar), 5000);

    snackbar.addEventListener('transitionend', function(event, elapsed) {
      if (event.propertyName === 'opacity' && this.style.opacity == 0) {
        this.parentElement.removeChild(this);
        if (previous === this) {
          previous = null;
        }
      }
    }.bind(snackbar));

    previous = snackbar;
    document.body.appendChild(snackbar);
    // In order for the animations to trigger, I have to force the original style to be computed, and then change it.
    getComputedStyle(snackbar).bottom;
    snackbar.style.bottom = '0px';
    snackbar.style.opacity = 1;
    snackbar.style.zIndex = 999;
  };
})();

toggle_status = function(type, obj) {
    //console.log("checked: " + obj.checked);
    var status = obj.checked;
    var status_str = status?'on':'off';
    console.log('The fan will turn ' + status_str + '.');
    $.ajax({
        type: "PUT",
        url: "/update_sensor",
        contentType: 'application/json',
        data: JSON.stringify({
            "href": "/a/" + type,
            "data": {
                "value": status
            }
        }),
        success: function(data) {
            console.log(data);
            var ret = data.status;
            if(ret) {
                console.log("Fan status is updated.");
                createSnackbar('Fan status is updated.', 'Dismiss');
            }
            else {
                console.error('failed');
                createSnackbar("Server is unavailable for the moment. Try again later.", 'Dismiss');
            }
        }
        }).done(function() {
            //console.log( "second success" );
        }).fail(function(jqXHR, textStatus, errorThrown){
            console.error("Failed to update status " + errorThrown);
            createSnackbar("Server error: " + errorThrown, 'Dismiss');
    });
    return false;
}

function convertToC(fTemp, frag_digit) {
	var fTempVal = parseFloat(fTemp);
	return ((fTempVal - 32) * (5 / 9)).toFixed(frag_digit);
};

function convertToF(cTemp, frag_digit) {
	var cTempVal = parseFloat(cTemp);
	var fTempVal = (cTempVal * (9 / 5)) + 32;
	//console.log(fTempVal);
	return fTempVal.toFixed(frag_digit);
}

function getDay(){
      //var year = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var today = new Date();
      var month =year[today.getMonth()];
      var date = today.getDate()+ " "+ month;
      return date;
}

function getWeek(){
      //var year = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var dd = new Date();
      dd.setDate(dd.getDate()-7);
      var m = dd.getMonth();
      var d = dd.getDate();
      return d+" "+year[m]+"-"+getDay();
}

function getMonth(){
    //var year = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var dd = new Date();
    dd.setMonth(dd.getMonth()-1);
    return year[dd.getMonth()]+" "+dd.getFullYear();
}

function getYear(){
    var dd = new Date();
    return (dd.getFullYear()-1);
}

function drawcontainer(div, xray, yray, description) {
    drawcontainerchart(div, xray, yray, description, '', 'Energy', 'KWH');
}

function drawcontainerchart(div,xray,yray,title,xtext,name,unit) {
    if(unit === undefined) { unit = ''; }
    var myChart = echarts.init(document.getElementById(div));
    var option = {
        title: {
            text: title,
            textStyle: {
                fontWeight: 'normal',
            },
            right: '25%',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#fff',
                    opacity: 0,
                }
            },
            backgroundColor: '#fff',
            borderColor: '#20e7fe',
            borderWidth: 1,
            padding: 5,
            textStyle: {
                color: 'black',
                fontSize: 12,
            },
            formatter: "{b} <br/>{a} :  <b>{c} " + unit + "</b>",
        },
        xAxis: {
            scale: true,
            type: 'category',
            boundaryGap: false,
            data :xray,
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            }
        },
        yAxis: {
            scale: true,
            type: 'value',
            axisLine: {
                show: false,
            },
            axisLabel: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false
            }
        },
        series: [{
            name: name,
            type: 'line',
            data: yray,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
               normal:{
                   color: '#20e7fe',
               }
            },
            lineStyle: {
                normal: {
                    color: '#20e7fe',
                    width: 2
                }
            }
        }]
    };
    if(xtext)
    {
        option.xAxis.name = xtext;
        option.xAxis.nameLocation = 'middle';
        option.xAxis.nameGap = 35;
    }
    myChart.setOption(option);
    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

draw_billing_pie_chart = function(container, title, data) {
    var myChart = echarts.init(document.getElementById(container));
    var option = {
        title: {
            text: title,
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16,
            },
            x: 'center',
            y: 'top',
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: '#3f4445',
            borderWidth: 0,
            padding: 10,
            textStyle: {
                fontSize: 12,
            },
            extraCssText: 'text-align: left;',
            formatter: "{b}<br/> {c} KWH, {d}%"
        },
        color: ['#20e7fe', '#20e886', '#feb557'],
        series: [{
            name: 'Usages',
            data: data,
            type:'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            animation: false,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    hoverRadius: 50,
                }
            },
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            }
        }]
    };
    myChart.setOption(option);

    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

updateWelcomeCardsDateTime  = function(utc_offset, timezone)
    {
        var utc_time = moment.utc();
        //console.log(utc_time.format());
        var datestr = getFormattedDateString(utc_time, utc_offset);
        var timestr = getHourMinute(utc_time, utc_offset,timezone);
        //console.log(datestr);

        $("div.demo-card-date").each(function(index){
            //console.log("Updating date area of welcome card");
            $(this).html("<h6>"+datestr+"</h6>");
        });
        $("div.demo-card-time").each(function(index){
            //console.log("Updating date area of welcome card");
            $(this).html("<h5>"+timestr+"</h5>");
        });
    };

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomPecentbyIndex(min, max, index, length) {
  return (((index + 1) / length * (max - min)) + min) * 0.01;
}