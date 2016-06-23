//forcast api = "https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE"
//geolocator api = "https://www.googleapis.com/geolocation/v1/geolocate?key="
//
var APIKEY = "ad05a86902b581dcb64cbfacef513319"
var BASE_URL = "https://api.forecast.io/forecast/"

//var geolocatorApiKey = "AIzaSyBvkVytYncPHjeEXjwN_mHRtBQtQRkULfk"
//var geolocatorBaseUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key="

var STATE = {
	lat: null,
	lng: null
}



var weatherContainerNode = document.querySelector("#weatherContainer")
var buttonContainerNode = document.querySelector("#buttonContainer") 

var addAllEventListeners = function () {
	var handleViewTypeChange = function (eventObject) {

		var buttonNode = eventObject.target,
			viewType = buttonNode.value

			location.hash = STATE.lat + "/" + STATE.lng + "/" + viewType

	}

		buttonContainerNode.addEventListener('click', handleViewTypeChange)

}

var renderCurrentView = function (weatherApiResponse) {

		var weatherObj = weatherApiResponse
		var temperature = weatherObj.currently.temperature,
			icon = weatherObj.currently.icon,
			apparentTemp = weatherObj.currently.apparentTemperature

		var degreeSymbol = "°"
		degreeSymbol = degreeSymbol.substr(1)

		var htmlString = ""

		htmlString += "<div class = 'currentForcastCards'>"
		htmlString += "<p>" + parseInt(temperature) + degreeSymbol +  "</p>"
		htmlString += "<p>" + "FEELS LIKE " + parseInt(apparentTemp) + degreeSymbol + "</p>"
		htmlString += "<p>" + icon + "</p>"
		htmlString += "</div>"



	weatherContainerNode.innerHTML = htmlString
}



var renderDailyView  = function (weatherApiResponse) {

	var weatherObj = weatherApiResponse
	var dailyWeatherArray = weatherObj.daily.data

	var htmlString = ""

	for(var i = 0; i < dailyWeatherArray.length; i++) {
		var dailyWeatherObj = dailyWeatherArray[i]

		var degreeSymbol = "°"
		degreeSymbol = degreeSymbol.substr(1)

		var toDateTimeSecs = function(secs) {
		var t = new Date(1970, 0, 1); // Epoch
		t.setSeconds(secs);
		return t;
		}

		toDateTimeSecs(dailyWeatherObj.time)

		var weekdayNumber = toDateTimeSecs(dailyWeatherObj.time).getDay(),
			dayOfTheMonthNumber = toDateTimeSecs(dailyWeatherObj.time).getDate(),
			summary = dailyWeatherObj.summary,
			dayOfTheWeek = {
			
		    0: "Sun", 
		    1: "Mon",
		    2: "Tues",
		    3: "Wed",
		    4: "Thur",
		    5: "Fri",
		    6: "Sat"
		    
			}

		var	getDayOfTheWeek = function (numberOfDay) {
			return dayOfTheWeek[numberOfDay]
		}

		var weatherDateString = getDayOfTheWeek(weekdayNumber) + " " + dayOfTheMonthNumber

	

			htmlString += "<div class = 'dailyForcastCards'>"		
			htmlString += "<p id = 'time'>" + weatherDateString + "</p>"
			htmlString += "<p class = 'temp'>" + parseInt(dailyWeatherObj.temperatureMax) + degreeSymbol + "</p>"
			htmlString += "<p>" + summary + "</p>"
			htmlString += "</div>"
		
	
		weatherContainerNode.innerHTML = htmlString
	}

}



var renderHourlyView = function (weatherApiResponse) {

	var weatherObj = weatherApiResponse
	var hourlyWeatherArray = weatherObj.hourly.data


		var htmlString = ""
		
		for(var i = 0; i < hourlyWeatherArray.length; i++) {
			var hourlyWeatherObj = hourlyWeatherArray[i]
			var degreeSymbol = "°"
			degreeSymbol = degreeSymbol.substr(1)

		
		var toDateTimeSecs = function(secs) {
		    var t = new Date(1970, 0, 1); // Epoch
		    t.setSeconds(secs);
		    return t;
		}

		var summary = hourlyWeatherObj.summary
		var getHours = toDateTimeSecs(hourlyWeatherObj.time).getHours()
		var militaryHr = getHours.toString(10)

		var standardHr = function (twoDigitTime) {
	    var hours24 = parseInt(twoDigitTime.substring(0, 2),10);
	    var hours = ((hours24 + 11) % 12) + 1;
	    var amPm = hours24 > 11 ? 'pm' : 'am';
  

	    return hours + amPm;
		};


			htmlString += "<div class = 'hourlyForcastCards'>"
			htmlString += "<p id = 'hourTime'>" + standardHr(militaryHr) + "</p>"
			htmlString += "<p class = 'temp'>" + parseInt(hourlyWeatherObj.temperature) + degreeSymbol + "</p>"
			htmlString += "<p>" + summary + "</p>"
			htmlString += "</div>"


		weatherContainerNode.innerHTML = htmlString
	}

}


var geoLocate = function() { 

		var successFunc = function (geoPosResponse) {

			//console.log("I'm the current location", geoPosResponse)
		
			var lat = geoPosResponse.coords.latitude,
				lng = geoPosResponse.coords.longitude

				STATE.lat = lat
				STATE.lng = lng
			
				location.hash = lat + "/" + lng + "/" + "current"
				//console.log(location.hash)
				
		}

		navigator.geolocation.getCurrentPosition(successFunc, function(err){console.log(err)})
}






var doWeatherRequest = function (lat, lng) {
	//https://api.forecast.io/forecast/
	//console.log(lat,lng)

	var weatherFullUrl = BASE_URL + APIKEY + "/" + lat + "," + lng 
	weatherFullUrl.substr(1)
	var weatherPromise = $.getJSON(weatherFullUrl)
	// weatherPromise.then(function (data) {console.log(data) })
	return weatherPromise
}





var WeatherRouter = Backbone.Router.extend ({

	routes: {
		
		":lat/:lng/current": "showCurrentView",
		":lat/:lng/daily": "showDailyView",
		":lat/:lng/hourly": "showHourlyView",
		"*default": "handleDefault"

	},

	handleDefault: function () {
		//console.log("Hey I'm getting the POS")
		geoLocate()
	},



	showCurrentView: function (lat, lng) {

		// make a request for forecast data at the input lat and lng
		// 
		// queues up renderCurrentView to run when the request is fulfilled
		
		STATE.lat = lat
		STATE.lng = lng
		

		var promise = doWeatherRequest(lat, lng)
		promise.then(renderCurrentView)
		

	
		// doWeatherRequest(lat,lng)//>>>>do .then request

	},

	showDailyView: function (lat, lng) {

		STATE.lat = lat
		STATE.lng = lng

		var promise = doWeatherRequest(lat, lng)
		promise.then(renderDailyView)

	},

	showHourlyView: function (lat, lng) {

		STATE.lat = lat
		STATE.lng = lng
		
		var promise = doWeatherRequest(lat, lng)
		promise.then(renderHourlyView)

	},

	initialize: function () {
		Backbone.history.start()// tell backbone to start watching the hash and tracking browser history
		addAllEventListeners()
	}

})

// create a new instance of the router
var rtr = new WeatherRouter()