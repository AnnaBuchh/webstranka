var ajaxRunning = false;
var access_token = '&access_token=444621735599029|Z3yQE143lOKcLjlL5ZUQRFdLR0o';

$(function() { 
    //jQuery.support.cors = true;  
    moreFeed(createStartQuery(), 'start');
    getFacebookEvents('132827200107060', 10);

    $('.f-prev').click(function() { 
        if (!ajaxRunning && $('.f-post:first').css('left') === '-720px') {
            $('.f-post').each(function () {
            var newPosition = $(this).position().left + 720;
            $(this).animate({'left': '+=720px'}, 700);
            $(this).css('left', newPosition);
        });
        removePostsFromEnd();
        moreFeed(createPrevQuery(), 'prev'); 
      }                          
    });
    $('.f-next').click(function() { 
        if (!ajaxRunning  && $('.f-post:last').css('left') === '1200px') {
            $('.f-post').each(function () {
            var newPosition = $(this).position().left - 720;
            $(this).animate({'left': '-=720px'}, 700);
            $(this).css('left', newPosition);
        });
        removePostsFromStart();
        moreFeed(createNextQuery(), 'next'); 
      }
    });
});

function getFacebookEvents(id, limit) {
    var limit = typeof a !== 'undefined' ? limit : 10;
    var since = new Date().toDateString();
    ajaxRunning = true;
    $.ajax({
        url: 'https://graph.facebook.com/' + id + '/events?limit=' + limit + '&since=' + since + access_token, 
        dataType: "json",
        cache: false,
        success: function(data) {
                    if (data.data.length !== 0) {
                        $('#f-events-wrapper').css('display', 'block');
                        $('#f-events-wrapper > p').css('display', 'none');
                        showFacebookEvents(data);
                    }
                    ajaxRunning = false;
                }
    });
}

function showFacebookEvents(result) {
    $.each(result.data, function (i, item) {
        var outputTemplate = '<div class="f-event"><h3><a href="https://www.facebook.com/events/{0}">{1}</a></h3><div><i class="foundicon-g-clock"></i><time datetime="{2}">{3}</time></div><div class="location"><i class="foundicon-g-location"></i>{4}</div>';
        var date = parseDate(item.start_time);
        $('#f-events-wrapper').append(outputTemplate.format(item.id, item.name, item.start_time, date, item.location)); 
    });
}

function moreFeed(query, type) {
    ajaxRunning = true;
    $.ajax({
        url: 'https://graph.facebook.com/fql?q=' + query + access_token, 
        dataType: "json",
        cache: false,
        success: function(data) {
                    if (data.data.length !== 0) facebookFeed(data, type);
                    ajaxRunning = false;
                }
    });
}
function facebookFeed(result, type) {
    var index = type === 'next' ? 3 : type === 'start' ? 0 : -1;
    $.each(result.data, function (i, item) {
        var position = type === 'prev' ? (-1+index*i)*240 : (index+i)*240;
        var outputTemplate = '<div class="f-post" style="left: '+position+'px"><div class="created_time" style="visibility: hidden">{0}</div><div class="f-header"><span class="f-from"><a href="{1}">MatFyz Je In</a></span><span class="f-time"> - {2}</span></div>{3}</div>';
        var date = parseDate(item.created_time * 1000);
        var message = makeHyperlinks(item.message);
        message = message.length > 250 ? message.substr(0, 250)+'...' : message;
        if (type === 'prev') 
            $('.f-wrapper').prepend(outputTemplate.format(item.created_time, item.permalink, date, message)); 
        else 
            $('.f-wrapper').append(outputTemplate.format(item.created_time, item.permalink, date, message)); 
    });
}
function removePostsFromStart() {
    var numOfPosts = $('.f-post').length;
    console.log(numOfPosts);
    if(numOfPosts > 6) {
        $('.f-post').each(function() {
        $(this).remove();
        if (--numOfPosts === 6) return false;
    });
  }
}
function removePostsFromEnd() {
    var numOfPosts = $('.f-post').length;
    console.log(numOfPosts);
    if(numOfPosts > 6) {
        $('.f-post').each(function() {
            if (numOfPosts-- <= 3) $(this).remove();
    });
  }
}
function createPrevQuery() {
    var prev = getPrevTime();
    return 'SELECT created_time, message, permalink FROM stream WHERE post_id in (SELECT post_id FROM stream WHERE source_id=132827200107060 AND actor_id=132827200107060 AND message <> "" AND created_time > '+prev+' ORDER BY created_time asc limit 500) LIMIT 3';
}
function createNextQuery() {
    var next = getNextTime();
    return 'SELECT created_time, message, permalink FROM stream WHERE post_id in (SELECT post_id FROM stream WHERE source_id=132827200107060 AND actor_id=132827200107060 AND message <> "" AND created_time < '+next+') LIMIT 3';
}
function createStartQuery() {
    return 'SELECT created_time, message, permalink FROM stream WHERE post_id in (SELECT post_id FROM stream WHERE source_id=132827200107060 AND actor_id=132827200107060 AND message <> "") LIMIT 6';
}
function getNextTime() {
    var time = $('.f-post:last').children('.created_time').html();
    console.log(time);
    return time;
}
function getPrevTime() {
    var time = $('.f-post:first').children('.created_time').html();
    console.log(time);
    return time;
}
String.prototype.format = function () {
    var s = this,
    i = arguments.length;
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};
function parseDate(date) {
    var myDate = new Date(date);
    return myDate.getDate()+' '+parseMonth(myDate.getMonth())+' o '+parseTime(myDate);
}
function parseMonth(month) {
    var m_names = new Array("Január", "Február", "Marec", 
    "Apríl", "Máj", "Jún", "Júl", "August", "September", 
    "Október", "November", "December");
    return m_names[month];
}   
function parseTime(time) {
    var minutes = time.getMinutes() == '0' ? '00' : time.getMinutes();
    var hours = time.getHours() == '0' ? '00' : time.getHours();
    return hours+':'+minutes;
}

function makeHyperlinks(str){
    return str.replace(/\b((http|https):\/\/\S+)/g,'<a href="$1" target="_blank">$1</a>');
}
