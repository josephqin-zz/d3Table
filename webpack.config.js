const path = require('path');

module.exports = {
	entry: './js/controlbar.js',
	output:{
		library:'cohortPanel',
		libraryTarget:'umd',
		filename:'cohortPanel.js'
	}
};