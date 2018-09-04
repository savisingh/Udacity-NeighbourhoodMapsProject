var map;
var largeInfoWindow;
//location data
var locations = [{
	title: 'Wollaton Park',
	street: 'Wollaton Rd',
	city: 'Nottingham',
	postcode: 'NG8 2AE',
	country: 'UK',
	location: {
		lat: 52.947493,
		lng: -1.206680
	}
}, {
	title: 'Nottingham Castle, Museum & Art Gallery',
	street: 'Lenton Rd',
	city: 'Nottingham',
	postcode: 'NG1 6EL',
	country: 'UK',
	location: {
		lat: 52.949619,
		lng: -1.154347
	}
}, {
	title: 'The University of Nottingham, Jubilee Campus',
	street: '7301 Wollaton Rd',
	city: 'Nottingham',
	postcode: 'NG8 1BB',
	country: 'UK',
	location: {
		lat: 52.952218,
		lng: -1.182875
	}
}, {
	title: 'Nottingham Trent University',
	street: '50 Shakespeare St',
	city: 'Nottingham',
	postcode: 'NG1 4FQ',
	country: 'UK',
	location: {
		lat: 52.958571,
		lng: -1.151719
	}
}, {
	title: 'Bilborough Park',
	street: '',
	city: 'Nottingham',
	postcode: 'NG8 3BU',
	country: 'UK',
	location: {
		lat: 52.967846,
		lng: -1.221463
	}
}, {
	title: 'Nottingham Racecourse',
	street: 'Colwick Park',
	city: 'Nottingham',
	postcode: 'NG2 4BE',
	country: 'UK',
	location: {
		lat: 52.947352,
		lng: -1.114382
	}
}, {
	title: 'intu Victoria Centre',
	street: '',
	city: 'Nottingham',
	postcode: 'NG1 3QN',
	country: 'UK',
	location: {
		lat: 52.958344,
		lng: -1.148237
	}
}];

function errorHandling() {
	alert("Google Maps are not available. Please try again later!!!");
}
//initialise the map and set the location of what will be shown
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 52.952387,
			lng: -1.159550
		},
		zoom: 13
	});
	var markers = [];
	largeInfoWindow = new google.maps.InfoWindow();
	var markerRed;
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		var street = locations[i].street;
		var city = locations[i].city;
		var postcode = locations[i].postcode;
		var country = locations[i].country;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			street: street,
			city: city,
			postcode: postcode,
			country: country,
			map: map,
			animation: google.maps.Animation.DROP,
			id: i
		});
		marker.setIcon('https://www.google.com/mapfiles/marker.png');
		locations[i].marker = marker;
		markers.push(marker);
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfoWindow);
		});
	};
	ko.applyBindings(new ViewModel())
};
//this funciton is called when the marker and list location is called
function populateInfoWindow(marker, infoWindow) {
	var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
	var wikiTimeout = setTimeout(function() {
		alert("failed to load wikipedia page");
	}, 4000);
	var articleStr;
	var contentString = '<h3>' + marker.title + '</h3>' + '<br/>' + marker.street + '<br/>' + marker.city + '<br/>' + marker.postcode + '<br/>' + marker.country + '</p>';
	//the ajax request to call the wiki api
	$.ajax({
		url: wikiUrl,
		dataType: "jsonp",
		success: function(response) {
			console.log(response);
			var articleList = response[1];
			for (var i = 0; i < articleList.length; i++) {
				articleStr = articleList[i];
				var url = 'http://en.wikipedia.org/wiki/' + articleStr;
				contentString = contentString + '<a href=\"' + url + '\">' + url + '</a>' + '<br>';
			};
			if (infoWindow.marker != marker) {
				infoWindow.marker = marker;
				infoWindow.close();
				infoWindow.setContent(contentString);
				infoWindow.open(map, marker);
				marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
				markerRed = marker;
				infoWindow.addListener('closeclick', function() {
					if (markerRed) {
						markerRed.setIcon('https://www.google.com/mapfiles/marker.png');
					}
				});
			}
			clearTimeout(wikiTimeout);
		}
	});
}
//this implements the show and hide functionality for the filter sidebar
function myFunction() {
	var x = document.getElementById("sidebar");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
}
var Location = function(data) {
	this.title = data.title;
	this.street = data.street;
	this.city = data.city;
	this.postcode = data.postcode;
	this.country = data.country;
	this.location = data.location;
	this.marker = data.marker;
};
var ViewModel = function() {
	var self = this;
	self.locationList = ko.observableArray();
	self.filter = ko.observable('');
	locations.forEach(function(location) {
		self.locationList.push(new Location(location));
	});
	//below filters the list and the markers
	self.filteredLocations = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (!filter) {
			ko.utils.arrayForEach(self.locationList(), function(place) {
				place.marker.setVisible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(place) {
				// set all markers visible (false)
				var result = (place.title.toLowerCase().search(filter) >= 0)
				place.marker.setVisible(result);
				return result;
			});
		}
	});
	// this function populates the infoWindow when a location in the list is clicked
	self.setLocation = function(clickedLocation) {
		clickedLocation.marker.setIcon('https://www.google.com/mapfiles/marker_green.png')
		infoWindow = new google.maps.InfoWindow();
		populateInfoWindow(clickedLocation.marker, infoWindow);
		infoWindow.open(map, clickedLocation.marker);
		infoWindow.addListener('closeclick', function() {
			clickedLocation.marker.setIcon('https://www.google.com/mapfiles/marker.png');
		});
	};
}
