/* global firebase moment */

// 1. Initialize Firebase
var config = {
	apiKey: "AIzaSyBBY68OegQzveqFooH8O44rdhk5SHihQao",
	authDomain: "employeedatabase-6a13b.firebaseapp.com",
	databaseURL: "https://employeedatabase-6a13b.firebaseio.com",
	projectId: "employeedatabase-6a13b",
	storageBucket: "employeedatabase-6a13b.appspot.com",
	messagingSenderId: "716495121643"
};

firebase.initializeApp(config);
var database = firebase.database();

// Button for adding Train - On click event
$(document).on("click", "#add-train-btn", function () {

	event.preventDefault();
	// console.log("Submit button hit!");

	// Grab all values from the form
	var trainName = $("#train-name-input").val().trim();
	var trainDestination = $("#destination-input").val().trim();
	var trainStartTime = $("#start-time-input").val().trim();
	var trainFrequency = $("#frequency-input").val().trim();
	var noErrors = true;

	// console.log(trainName, trainDestination, trainStartTime, trainFrequency);

	// if(
	// 	(trainStartTime.search(/^\d{2}:\d{2}$/) != -1) &&
	// 	(trainStartTime.substr(0,2) >= 0 &&	trainStartTime.substr(0,2) <= 23) &&
	// 	(trainStartTime.substr(3,2) >= 0 &&	trainStartTime.substr(3,2) <= 59)
	// ){
	// 	$("#time-err").text("");
	// 	$("#time-group").removeClass("has-error");
	// }else{
	// 	noErrors = false;
	// 	$("#time-err").text("Invalid time");
	// 	$("#time-group").addClass("has-error");
	// };
	if (!($("#train-name-input").val())){
		noErrors = false;
		$("#name-err").text("Train name cannot be blank");
		$("#name-group").addClass("has-error");
	}else{
		$("#name-err").text("");
		$("#name-group").removeClass("has-error");
	}

	if (!($("#destination-input").val())){
		noErrors = false;
		$("#dest-err").text("Destination cannot be blank");
		$("#dest-group").addClass("has-error");
	}else{
		$("#dest-err").text("");
		$("#dest-group").removeClass("has-error");
	}

	if(!($("#start-time-input").val())){
		noErrors = false;
		$("#time-err").text("Time cannot be blank or invalid");
		$("#time-group").addClass("has-error");
	}else{
		// trainStartTime = moment(trainStartTime,"HH:mm");
		$("#time-err").text("");
		$("#time-group").removeClass("has-error");
	};



	if (trainFrequency <= 0){
		noErrors = false;
		$("#frequency-err").text("Frequency cannot be zero or less than zero");
		$("#frequency-group").addClass("has-error");
	}else{
		$("#frequency-err").text("");
		$("#frequency-group").removeClass("has-error");
	}

	if (!($("#frequency-input").val())){
		noErrors = false;
		$("#frequency-err").text("Frequency cannot be blank");
		$("#frequency-group").addClass("has-error");
	}else{
		$("#frequency-err").text("");
		$("#frequency-group").removeClass("has-error");
	}

	// Uploads new train data to the database
	if (noErrors) {
		database.ref().push({
			name: trainName
			, destination: trainDestination
			, startTime: trainStartTime
			, frequency: trainFrequency
			, dateAdded: firebase.database.ServerValue.TIMESTAMP
		});

		$("#train-name-input").val("");
		$("#destination-input").val("");
		$("#start-time-input").val("");
		$("#frequency-input").val("");
	}
});

// // 3. Create Firebase event for adding train information from firebase and add a row in the html when a user adds an entry
database.ref().on("child_added", function (childSnapshot, prevChildKey) {

	// console.log(childSnapshot.val(), prevChildKey, childSnapshot.key);

	// Store everything into a variable.
	var trainName = childSnapshot.val().name;
	var trainDestination = childSnapshot.val().destination;
	var trainStartTime = childSnapshot.val().startTime;
	var trainFrequency = childSnapshot.val().frequency;

	// console.log("Current Time: " + moment().format("HH:mm"));
	var timeNow = moment().format("HH:mm");

	// For testing purpose - override current time value
	// timeNow = "05:01";

	var currentTime = moment(timeNow, "HH:mm");

	// console.log("Start Time: " + trainStartTime);
	var momentStartTime = moment(trainStartTime, "HH:mm");
	var prevArrival = moment(trainStartTime, "HH:mm");
	var nextArrival = moment(trainStartTime, "HH:mm");
	nextArrival.add(trainFrequency, "Minutes");

	var nextArrivalFound = false;
	var diffPrev = 0;
	var diffNext = 0;

	var countForward = true;
	var minutesAway = 0;

	// console.log("Start Curr Diff: " + currentTime.diff(momentStartTime, "Minutes"))
	if (currentTime.diff(momentStartTime, "Minutes") > 0) {
		countForward = true;
	} else if (currentTime.diff(momentStartTime, "Minutes") < 0) {
		countForward = false;
	}

	// var i = 0;
	do {
		// console.log("Iteration #: " + i);
		// i++;
		if (currentTime.diff(momentStartTime, "Minutes") === 0) {
			nextArrival = momentStartTime;
			minutesAway = 0;
			nextArrivalFound = true;
			// console.log(nextArrivalFound);
		} else {
			// console.log("Prev Arrival: " + moment(prevArrival).format("hh:mm A"));
			// console.log("Next Arrival: " + moment(nextArrival).format("hh:mm A"));
			diffPrev = currentTime.diff(prevArrival, "Minutes");
			diffNext = currentTime.diff(nextArrival, "Minutes");
			// console.log("Diff Prev: " + currentTime.diff(prevArrival, "Minutes"));
			// console.log("Diff Next: " + currentTime.diff(nextArrival, "Minutes"));
			if (diffPrev > 0 && diffNext <= 0) {
				minutesAway = diffNext * -1;
				nextArrivalFound = true;
				// console.log(nextArrivalFound);
			} else {
				if (countForward) {
					// console.log("Forward");
					prevArrival.add(trainFrequency, "Minutes");
					nextArrival.add(trainFrequency, "Minutes");
				} else {
					// console.log("Backward");
					prevArrival.subtract(trainFrequency, "Minutes");
					nextArrival.subtract(trainFrequency, "Minutes");
				}
			}
		}
		// if (i > 30) {
		// 	break;
		// }
	}
	while (!nextArrivalFound);

	// console.log("Total num of iterations: " + i);
	// console.log("Next Arrival: " + moment(nextArrival).format("hh:mm A"));
	// console.log("Minutes Away: " + minutesAway);
	// Add each train's data into the table
	$("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + trainDestination + "</td><td class='text-center'>" +
		trainFrequency + "</td><td>" + moment(nextArrival).format("hh:mm A") + "</td><td class='text-center'>" + minutesAway + "</td></tr>");
});
