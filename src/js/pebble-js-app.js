

function Laxen(){
	console.log('Loading laxen...')
	var self = this

	//API: SL Realtid
	this.apiKey = 'zYYr2GH36INL6rV9lbGrmuoDTNFl2wnh' 
	this.apiUrl = 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures.json' //?siteId=1950&timeWindow=30&key=zYYr2GH36INL6rV9lbGrmuoDTNFl2wnh

    this.currentDepartures = []
    
    this.config = { 'siteId' : '1950', 
                    'timeWindow' : '30'
                }

	this.init = function() {
		console.log('Init function')
        //self.getNonSubwayDepartures()
        self.attachEvents()
	}
    this.attachEvents = function() {
        /*
        Pebble.addEventListener("appmessage", function(e) {
            console.log(e.payload)
        })
*/
        Pebble.addEventListener('showConfiguration', function(e) {
            Pebble.openURL('https://kiwifoto.se/pebble/pebble.html')
        })
        console.log('attaching wwc')
        Pebble.addEventListener("webviewclosed", function(e) {
            console.log('wwc fired!')
            var configuration = JSON.parse(decodeURIComponent(e.response));
            console.log("Configuration window returned: ", JSON.stringify(configuration));
            self.config = configuration
            console.log('wwc event done')
          }
        );
        Pebble.addEventListener("appmessage", function(e) {
            self.handleAppMesage(e)
        })
        console.log('done attaching events')
    }
	this.getNonSubwayDepartures = function() {
        console.log('getNonSubwayDepartures function')
		var xhReq = new XMLHttpRequest()
		var url = self.apiUrl+'?siteId='+self.config.siteId+'&'+'timeWindow='+self.config.timeWindow+'&key='+self.apiKey
		xhReq.open('GET', url, false)
		xhReq.onreadystatechange = function() {
            console.log('Got response from API')
		    if (xhReq.readyState === 4 && xhReq.status === 200) {
                self.parseNonSubwayResponse(xhReq.responseText)
			}
		}

		xhReq.send(null)
        console.log('Sent request to API.')
	}
    this.parseNonSubwayResponse = function(response) {
        var r = JSON.parse(response)
        if (r && r.DPS.Buses.DpsBus) {
            var d = r.DPS.Buses.DpsBus
            console.log('Got '+String(d.length)+' departures.')
            self.clearDepartures()
            for (var i = 0; i < d.length; i++) {
                self.addDeparture( d[i] )
            };

            self.sendToPebble()
 
        }
    }
    this.addDeparture = function(d) {
        self.currentDepartures.push(d)
    }
    this.clearDepartures = function() {
        self.currentDepartures = []
    }
    this.sendToPebble = function() {
        var text = ''
        var busList = []
        for (var i = 0; i < self.currentDepartures.length; i++) {
            var d = self.currentDepartures[i]
            text = text + d.Destination + ' ' + d.DisplayTime + '\n'
            busList.push(d.Destination + ' ' + d.DisplayTime)
        };
        var buses = busList.join('\n')
        console.log('Message size: '+ String(buses.length))
        Pebble.sendAppMessage({
            'buses': buses // Make a string of the list separated by # (Pebble cant handle lists)
        });
        //Pebble.showSimpleNotificationOnPebble('Bussar!', text) //Temporary solution for sending data to pebble.
    }
    this.handleAppMesage = function(e) {
        console.log('Message recieved from pebble: '+e.payload.valueOf(0) )
        if (e.payload['refresh']) {
            self.getNonSubwayDepartures()
        }

    }

	self.init()
}

Pebble.addEventListener('ready', function(e){
	console.log('Pebble ready fired.')
	var _laxen = new Laxen()
})

/*
 "SiteId": "1950",
          "StopAreaNumber": "13045",
          "TransportMode": "BUS",
          "StopAreaName": "Örby skola",
          "LineNumber": "163",
          "Destination": "Kärrtorp",
          "TimeTabledDateTime": "2014-01-17T22:54:36",
          "ExpectedDateTime": "2014-01-17T22:56:23",
          "DisplayTime": "5 min"
*/