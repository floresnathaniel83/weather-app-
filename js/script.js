//forcast api = "https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE"
//geolocator api = "https://www.googleapis.com/geolocation/v1/geolocate?key="

var APIKEY = "ad05a86902b581dcb64cbfacef513319"
var BASE_URL = "https://api.forecast.io/forecast/"

//var geolocatorApiKey = "AIzaSyBvkVytYncPHjeEXjwN_mHRtBQtQRkULfk"
//var geolocatorBaseUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key="

var geocodingToken = "AIzaSyCdofWTwoOaNmKWEIvyvbcTaLItlJNuerg"
var geocodingUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="

var STATE = {
	lat: null,
	lng: null
}

var searchedObj = {
	name: 'Houston'
}

var objmap = {
   "clear-day": Skycons.CLEAR_DAY,
   "partly-cloudy-day": Skycons.PARTLY_CLOUDY_DAY,
   "partly-cloudy-night": Skycons.PARTLY_CLOUDY_NIGHT,
   "sun": Skycons.CLEAR_DAY,
   "clear-night": Skycons.CLEAR_NIGHT,
   "snow": Skycons.SNOW,
   "sleet": Skycons.SLEET,
   "wind": Skycons.WIND,
   "rain": Skycons.RAIN,
   "cloudy": Skycons.CLOUDY,
   "fog": Skycons.FOG
}

var weatherContainerNode = document.querySelector("#weatherContainer")
var buttonContainerNode = document.querySelector("#buttonContainer") 
var searchContainerNode = document.querySelector("#searchContainer")

var addAllEventListeners = function () {
	var handleViewTypeChange = function (eventObject) {

		var buttonNode = eventObject.target,
			viewType = buttonNode.value

			location.hash = STATE.lat + "/" + STATE.lng + "/" + viewType

	}

		buttonContainerNode.addEventListener('click', handleViewTypeChange)
		searchContainerNode.addEventListener('keydown', getSearchCoordinates)
}

var fetchCoordinates = function (address) {
	var locationUrl = geocodingUrl + address + '&' + geocodingToken
	var locationPromise = $.getJSON(locationUrl)
	return locationPromise

}

var getSearchCoordinates = function (eventObj) {
	if(eventObj.keyCode === 13){
		var city = eventObj.target.value
		var coordinatesPromise = fetchCoordinates(city)
		coordinatesPromise.then(showCurrentCity)
		eventObj.target.value = ''

	}

}

var showCurrentCity = function (localeObj) {
	var inputLat = localeObj.results[0].geometry.location.lat
	var inputLng = localeObj.results[0].geometry.location.lng
	location.hash = inputLat + '/' + inputLng + '/current'

	var formattedAddress = localeObj.results[0].formatted_address.split(",")
	var locationName = formattedAddress[0]
	searchedObj.name = locationName

}

var renderCurrentView = function (weatherApiResponse) {

		var weatherObj = weatherApiResponse
		var temperature = weatherObj.currently.temperature,
			summary = weatherObj.currently.summary,
			icon = weatherObj.currently.icon,
			apparentTemp = weatherObj.currently.apparentTemperature

		var htmlString = ""

		htmlString += "<div class = 'currentForcastCards'>"
		htmlString += "<div id = 'leftCol'>"
		htmlString += "<h3>" + searchedObj.name + "</h3>"
		htmlString += "<p>" + summary + "</p>"
		htmlString += '<canvas id="big-skycon" width="120" height="120"></canvas>'
		htmlString += "</div>"
		htmlString += "<div id = 'rightCol'>"
		htmlString += "<p id = 'currentTemp'>" + parseInt(temperature) + "&deg</p>"
		htmlString += "</div>"
		htmlString += "</div>"

		weatherContainerNode.innerHTML = htmlString

		var skycon = new Skycons({"color": "#82ccc8"})
   		skycon.add("big-skycon", objmap[icon])
   		skycon.play()

}



var renderDailyView  = function (weatherApiResponse) {

	var weatherObj = weatherApiResponse
	var dailyWeatherArray = weatherObj.daily.data

	var htmlString = ""

	for(var i = 0; i < dailyWeatherArray.length; i++) {
		var dailyWeatherObj = dailyWeatherArray[i]

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

			var weatherDateString = getDayOfTheWeek(weekdayNumber) 

			htmlString += "<div class = 'dailyForcastCards'>"		
			htmlString += "<p id = 'time'>" + weatherDateString + "</p>"
			htmlString += "<p class = 'maxTemp'>" + parseInt(dailyWeatherObj.temperatureMax) + '&deg' + "</p>"
			htmlString += "<p class = 'minTemp'>" + parseInt(dailyWeatherObj.temperatureMin) + "&deg</p>"
			htmlString += "</div>"

			weatherContainerNode.innerHTML = htmlString
			
	}

}

var renderHourlyView = function (weatherApiResponse) {

	console.log(weatherApiResponse)
	var weatherObj = weatherApiResponse
	var hourlyWeatherArray = weatherObj.hourly.data


		var htmlString = ""
		
		for(var i = 0; i < hourlyWeatherArray.length; i++) {
			var hourlyWeatherObj = hourlyWeatherArray[i]
			
			var milliSeconds = new Date(hourlyWeatherObj.time * 1000)

			var formatAMPM = function(date) {
				  var hours = date.getHours();
				  var minutes = date.getMinutes();
				  var ampm = hours >= 12 ? 'PM' : 'AM';
				  hours = hours % 12;
				  hours = hours ? hours : 12;
				  var strTime = hours + ' ' + ampm;
				  return strTime;
			
			}
			
			var hourStr = formatAMPM(milliSeconds)
			var summary = hourlyWeatherObj.summary

			htmlString += "<div class = 'hourlyForcastCards'>"
			htmlString += "<p id = 'hourTime'>" + hourStr  + "</p>"
			htmlString += "<p class = 'temp'>" + parseInt(hourlyWeatherObj.temperature) + "&deg</p>"
			htmlString += "<p class = 'temp'>" + 'Feels like' + " " + parseInt(hourlyWeatherObj.apparentTemperature) + "&deg</p>"
			htmlString += "<p>" + 'Percip ' + parseInt(hourlyWeatherObj.precipProbability * 100) + "%" + "</p>"
			htmlString += "<p>" + summary + "</p>"
			htmlString += "</div>"

	
		};
		weatherContainerNode.innerHTML = htmlString
	}



var geoLocate = function() { 

		var successFunc = function (geoPosResponse) {

			console.log(location)
			var lat = geoPosResponse.coords.latitude,
				lng = geoPosResponse.coords.longitude

				STATE.lat = lat
				STATE.lng = lng
			
				location.hash = lat + "/" + lng + "/" + "current"
				
				
		}

		navigator.geolocation.getCurrentPosition(successFunc, function(err){console.log(err)})
}






var doWeatherRequest = function (lat, lng) {
	//https://api.forecast.io/forecast/

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
		geoLocate()

	},



	showCurrentView: function (lat, lng) {

		// make a request for forecast data at the input lat and lng
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