class ncLogin extends notFramework.notController {
	constructor(app, params) {
		//notFramework.notCommon.log('init site app ', redirect, 'login');
		super(app);
		this.setModuleName('main');
		this.viewsPrefix = '/client/modules/main/';
		this.commonViewsPrefix = this.app.getOptions().commonPath;
		this.containerId = 'content';
		this.container = document.getElementById('content');
		this.viewsPostfix = '.html';
		this.renderFromURL = true;
		this.tableView = null;
		this.form = null;
		this.buildPage(params);
	}

	goProfile() {
		document.location.href = '/control';
	}

	buildTopLink() {
		var place = document.getElementById('extr-page-header-space');
		place.innerHTML = '<span id="extr-page-header-space"><a href="/composer" class="btn btn-danger">Редактор</a> </span>';
	}

	initItem() {
		var newRecord = window.nrRegister({
			'_id': undefined,
			username: '',
			email: '',
			password: ''
		});
		return newRecord;
	}

	showError(e) {
		notFramework.notCommon.report(e);

	}

	buildForm() {
		this.form = new notFramework.notForm({
			data: this.initItem(),
			options: {
				helpers: {
					submit: (params) => {
						params.item.$login()
							.then(this.goProfile.bind(this))
							.catch(this.showError.bind(this));
					}
				},
				action: 'login',
				targetEl: document.getElementById('siteForm')
			},
			events: [
				['afterSubmit', this.goProfile.bind(this)],
				['afterRestore', this.goProfile.bind(this)]
			]
		});
	}

	buildPage() {
		this.buildTopLink();
		var formParent = document.getElementById('siteForm');
		formParent.innerHTML = '';
		this.buildForm();
	}
}

export default ncLogin;
