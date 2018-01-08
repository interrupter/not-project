import {options} from '../../common/js/options.js';
import {
	ncInit,
	ncLogin
} from './modules/main';

let appOptions = {
	//url from which will take interfaceManifest json file
	manifestURL: '/api/manifest',
	//routes for client-side
	router: {
		root: '/control/',
		manifest: [
			//routie route desription: controller name, real controller is function preffixed with 'nc', ncMain, ncPublication
			{
				paths: ['', 'login'],
				controller: ncLogin
			}
		],
		index: '/login'
	},

	//base controller, executed on every site page before any other controller
	initController: ncInit,
	//form auto generation
	templates: {
		//common is for profile
		//associated object is options for generator object
		//default generator notForm
		lib: '/client/common/lib.html?' + Math.random(),
	},
	paths: {
		common: '/client/common',
		modules: '/client/modules'
	},
	scrollSize: 30
};

notFramework.notCommon.startApp(() => new notFramework.notApp(appOptions));
