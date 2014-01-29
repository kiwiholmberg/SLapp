function SlappConfig() {
	var self = this
	self.configuration = {}


	this.init = function() {
		$('.config-fotm').on('submit', function(e) {
			e.preventDefault()
			window.location.href = "pebblejs://close#" + encodeURIComponent(JSON.stringify( self.getForm() ));
		})
		$('.trafic li').on('click', function(e) {
			e.preventDefault()
			console.log($(this))
			if ($(this).hasClass('active')) {
				$(this).removeClass('active')
			} else {
				$(this).addClass('active')
			}
		})
	}
	this.getForm = function() {
		var config = {}

		config.siteId = $('.station-id').val() ? $('.station-id').val() : '1950'
		config.timeWindow = '30'
		return config
	}
	self.init()
}
var _slc = new SlappConfig()