//forcast api = "https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE"

var APIKEY = "ad05a86902b581dcb64cbfacef513319"
var BASE_URL = "https://api.forecast.io/forecast/"

var weatherContainer = document.querySelector("#weatherAppContainer")
var buttonContainerNode = document.querySelector("#nav-buttons") 
var dailyWeatherNode = document.querySelector("#dailyWeatherContainer")
var hourlyWeatherNode = document.querySelector("#hourlyWeatherContainer")

var renderCurrentView = function (weatherApiResponse) {
	
	var weatherObj = weatherApiResponse
	console.log(weatherObj)
	var htmlString = " "
	var temperature = weatherObj.currently.temperature,
		icon = weatherObj.currently.icon,
		apparentTemp = weatherObj.currently.apparentTemperature

	var degreeSymbol = "°"
	degreeSymbol = degreeSymbol.substr(1)

	htmlString += "<h3>" + "FORCAST NOW" + "</h3>"
	htmlString += "<div class = 'forcastCards'>"
	htmlString += "<p class = 'temp'>" + parseInt(temperature) + degreeSymbol +  "</p>"
	htmlString += "<p>" + "FEELS LIKE " + parseInt(apparentTemp) + degreeSymbol + "</p>"
	htmlString += "<p>" + icon + "</p>"
	htmlString += "</div>"



	var currentWeatherContainer = document.querySelector("#currentWeatherContainer")
	currentWeatherContainer.innerHTML = htmlString
}



var renderDailyView  = function (weatherApiResponse) {

	var weatherObj = weatherApiResponse
	var dailyWeatherArray = weatherObj.daily.data

	htmlString = "<h3>" + "FORCAST DAILY" + "</h3>"
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

		htmlString += "<div class = 'forcastCards'>"		
		htmlString += "<p id = 'time'>" + weatherDateString + "</p>"
		htmlString += "<p class = 'temp'>" + parseInt(dailyWeatherObj.temperatureMax) + degreeSymbol + "</p>"
		htmlString += "<p>" + summary + "</p>"
		htmlString += "</div>"
		
	


		var dailyWeatherContainer = document.querySelector("#dailyWeatherContainer")
		dailyWeatherContainer.innerHTML = htmlString
	}

}

var renderHourlyView = function (weatherApiResponse) {
	
	var weatherObj = weatherApiResponse

	var hourlyWeatherArray = weatherObj.hourly.data

	
		htmlString = "<h3>" + "HOURLY FORCAST TOMORROW" + "</h3>" 	
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

		htmlString += "<div class = 'forcastCards'>"
		htmlString += "<p id = 'hourTime'>" + standardHr(militaryHr) + "</p>"
		htmlString += "<p class = 'temp'>" + parseInt(hourlyWeatherObj.temperature) + degreeSymbol + "</p>"
		htmlString += "<p>" + summary + "</p>"
		htmlString += "</div>"


		var hourlyWeatherContainer = document.querySelector("#hourlyWeatherContainer")
		hourlyWeatherContainer.innerHTML = htmlString
		
	}

}

var errorHandler = function(error) {
	console.log(error)
}

var locationReader = function(geoPosResponse) { 
		
		var lat = geoPosResponse.coords.latitude
		var lng = geoPosResponse.coords.longitude
		var viewType = ""//>>>>>how do I get my app to render the current view faster
		location.hash = lat + "/" + lng + "/" + viewType

		var hashChange = function(eventObj) {

		var viewType = eventObj.target.value
	    
	    location.hash = lat + "/" + lng + "/" + viewType



	}

buttonContainerNode.addEventListener('click', hashChange)

}


navigator.geolocation.getCurrentPosition(locationReader, errorHandler)
	



var controller = function() {//>>>>>builds hash url
		
		var hashRoute = location.hash.substr(1) 
		//>>>>>"29.735070664133914/-95.39049241171072/current"
		console.log(hashRoute)
									
		var hashParts = hashRoute.split('/')
		var lat = hashParts[0],
			lng = hashParts[1],
			viewType = hashParts[2]
		/*
		if (viewType !== "") { >>>>> I did not quite understand how to switch btw current/daily/hourly and to render the current view upon page load
			renderCurrentView() 			
		}
		
		return
		*/
		
	
		weatherPromise = $.getJSON(BASE_URL + APIKEY + "/" + lat + "," + lng)

		if (viewType === "current") {
			
			weatherPromise.then(renderCurrentView)
		
		} else if (viewType === "daily") {
				
			weatherPromise.then(renderDailyView)

		} else if (viewType === "hourly") {
				
			weatherPromise.then(renderHourlyView)
		}	
	}
window.addEventListener('hashchange', controller)  