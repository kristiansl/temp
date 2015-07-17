var wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var airSearch = require('../AirModels/AirSearchPage');
var flightSelect = require('../AirModels/FlightSelectPage');
var airDetails = require('../AirModels/AirDetailsPage');
var airBilling = require('../AirModels/AirBillingPage');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// checking sauce credential
if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
    console.warn(
        '\nPlease configure your sauce credential:\n\n' +
        'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
        'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
    );
    throw new Error("Missing sauce credentials");
}

// http configuration, not needed for simple runs
wd.configureHttp( {
    timeout: 120000,
    retryDelay: 15000,
    retries: 5
});

var desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
desired.name = 'Multi Destination Booking with ' + desired.browserName + ' on ' + desired.platform + ' - Anjana';
desired.tags = ['AirMultiDest'];

describe('AirMultiDest (' + desired.browserName + ')', function() {
    var browser;
    var allPassed = true;

    this.timeout(60000 * 8); // 8 minutes maximum per test (i.e. per it('...', function () {}))
    // Searching the DOM takes extremely long on IE8, especially when it has to check inside nested divs and search deep into DOM.

    // Searching DOM on modern browsers (chrome, firefox, safari, ie9+) does not take that long.
    // This test automation performance problem is a result of IE8 not having good performance and not being able to deal with and query large DOMs properly and efficiently. Priceline Flight results page is complex / long web page with a big DOM and lots of nesting.
    // This is not a problem with how the test is written (i.e. waiting, what selectors being used) but a problem with IE8 finding the desired element in the DOM.

    // I have noticed sometimes the element is found and the test passes. Sometimes the test takes longer than timeout time (8 minutes) and times out. The behavior is not consistent. This shows that IE8 + Selenium is having problems finding / interacting with the elements. Ran this on IE9 works every time.

    // I have tried using more "specific" selectors, and I still see the same results, which also points to the problem being IE8 finding elements on the DOM (i.e. using different / better selectors still yielding same inconsistent results)

	    before(function(done) {
	        var username = process.env.SAUCE_USERNAME;
	        var accessKey = process.env.SAUCE_ACCESS_KEY;4
	        browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);
	        if(process.env.VERBOSE){
	            // optional logging
	            browser.on('status', function(info) {
	                console.log(info.cyan);
	            });
	            browser.on('command', function(meth, path, data) {
	                console.log(' > ' + meth.yellow, path.grey, data || '');
	            });
	        }
	        browser
	            .init(desired)
	            .nodeify(done);

	    });

	    afterEach(function(done) {
	        allPassed = allPassed && (this.currentTest.state === 'passed');
	        done();
	    });

	    after(function(done) {
	        browser
	            .quit()
	            .sauceJobStatus(allPassed)
	            .nodeify(done);
	    });

    	it("Search for a Multi Destination Flight", function(done) {
    		airSearch.multiDestSearch(browser, wd, done);
    	});

    	it("Select one passenger", function(done) {
    		airSearch.onePassenger(browser, wd, done);
    	});

    	it("Go To Flight Listings", function(done) {
    		airSearch.goToFlightListings(browser, wd, done);
    	});

    	it("Select a Multi Destination itinerary", function(done) {
            flightSelect.oneWayItinerarySelectDelta(browser, wd, done);
        });

        /*it("Select a Multi Destination itinerary", function(done) {
            flightSelect.multiDestItinerarySelect(browser, wd, done);
        });*/

        it("Select No Trip Insurance", function(done) {
            airDetails.noTripInsurance(browser, wd, done);
        });

        it("Fill Single Passenger Details", function(done) {
        	airDetails.onePassengerDetails(browser, wd, done);
        });

        it("Go to Billing Page", function(done) {
        	airDetails.goToBillingPage(browser, wd, done);
        });

        it("Fill Payer Contact Information", function(done) {
            airBilling.fillPayerContactInfo(browser, wd, done);
        });

        it("Enter email", function(done) {
            airBilling.enterEmail(browser, wd, done);
        });

        it("Fill Payer Personal Information", function(done) {
            airBilling.fillPayerPersonalInfo(browser, wd, done);
        });

        it("Fill Postal Code", function(done) {
            airBilling.enterPostalCode(browser, wd, done);
        });

        it("Enter Email Confirmation", function(done) {
            airBilling.emailConfirm(browser, wd, done);
        });

        it("Fill Non Sign-in Card Details", function(done) {
            airBilling.enterNonSignInCardDetails(browser, wd, done);
        });

        it("Enter Card Code", function(done) {
            airBilling.enterCardCode(browser, wd, done);
        });

        it("Submit the Booking", function(done) {
            airBilling.submitBooking(browser, wd, done);
        });

});
