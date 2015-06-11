var timer = function() {
	this.time = function(raw) {
		var t;
		if (this.stopTime) {
			t = this.stopTime - this.startTime;
		} else {
			t = new Date() - this.startTime;
		}
		if (raw)
			return t;
		
		return Math.floor(t/60000) + ":" + ((t%60000)/1000).toFixed(3);
	};
	this.start = function() {
		this.startTime = new Date();
	};
	this.stop = function() {
		this.stopTime = new Date();
	};
	this.reset = function() {
		this.startTime = this.stopTime = undefined;
	};
};

module.exports = timer;