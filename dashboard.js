function makeRequest (opts) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(opts.method, opts.url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: this.statusText,
					responseText: this.responseText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: this.statusText,
				responseText: this.responseText
			});
		};
		if (opts.method == 'POST') {
			xhr.setRequestHeader("Content-Type", "application/json");
		}
        if (opts.auth) {
			xhr.setRequestHeader("Authorization", opts.auth);
		}
		if (opts.auth2) {
			xhr.setRequestHeader("X-Discord-Authorization", opts.auth2);
		}
		xhr.send(opts.body ? JSON.stringify(opts.body) : undefined);
	});
}
function showNotif (type, text, time) {
    let status = document.getElementById('notif');
    if (!status) return false;
    status.className = type;
    status.innerHTML = text;

    if (time) {
        setTimeout(() => {
        	status.className = '';
        	status.innerHTML = '';
        }, time);
    }
}

// lazily copied from StackOverflow tbh
function getCookie(name) {
    function escape(s) { return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1'); };
    var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
}

paypal.use( ['login'], function (login) {
  login.render ({
	"appid":"AWH-Iqw8uRLsMZH4j_XI59OrCy2As3ueNRTD-ReaeCKc7ZSJGU9MMQkxHKYvjSMSTMKi2mE4fjHBG9m8",
	"scopes":"openid profile email",
	"containerid":"paypalLogin",
	"locale":"en-us",
	"returnurl":"https://api.benderbot.co/paypal_login"
  });
});

window.nav = [
	[{
		name: 'Bender Pro',
		id: 'pro'
	}, {
		name: 'General Settings',
		id: 'general'
	}, {
		name: 'Aliases',
		id: 'aliases'
	}, {
		name: 'Welcome Messages',
		id: 'welcome'
	}, {
		name: 'Giveaways',
		id: 'giveaways',
		cs: true,
		ro: true
	}, {
		name: 'Tags',
		id: 'tags'
	}, {
		name: 'Agreement',
		id: 'agreement'
	}], [{
		name: 'Automod',
		id: 'automod',
		cs: true
	}], [{
		name: 'Filter',
		id: 'filter',
		cs: true
	}, {
		name: 'Name Filter',
		id: 'namefilter',
		cs: true
	}], [{
		name: 'Logging Settings',
		id: 'logging'
	}, {
		name: 'Mod Log (cases)',
		id: 'modlog',
		ro: true
	}, {
		name: 'Mutes',
		id: 'mutes',
		ro: true
	}, {
		name: 'Name History',
		id: 'names',
		cs: true,
		ro: true
	}], [{
		name: 'Permissions',
		id: 'perms',
		cs: true
	}], [{
		name: 'Channel Permissions',
		id: 'cperms',
		cs: true
	}], [{
		name: 'Selfroles',
		id: 'selfroles'
	}, {
		name: 'Disabled Commands & Groups',
		id: 'cmdstatus',
		cs: true
	}]
];

var page = new Vue({
	el: '#app',
	data: {
		column: null,
		selectedGuildID: null,
		//prevGuildID: null,
		openDropdown: null,
		sidenavOpen: false,
		guilds: [],
		getGuild: function (id) {
			let guild = this.guilds.filter(g => g.id === id)[0];
			return guild || {};
		},
		user: null,
		gSettings: {
	    	"agreement": {}, "aliases": {}, "automod": {}, "commandStatus": {}, "config": {}, "cperms": {}, "filter": {}, "gameNews": {}, "giveaways": {}, "gperms": {}, "groupStatus": {}, "ignore": {}, "joinables": {}, "logging": {}, "memberLog": {}, "modlog": {}, "music": {}, "mutes": {}, "namefilter": {}, "nicknames": {}, "perms": {}, "tags": {}, "temproles": {}
	    },
		gRoles: [],
		getRole: function (id) {
			let role = this.gRoles.filter(r => r.id === id)[0];
			return role || {};
		},
		gChannels: [],
		getChannel: function (id) {
			let chan = this.gChannels.filter(c => c.id === id)[0];
			return chan || {};
		},
		tzRegions: window.tzRegions,
		tzs: window.tzs,
		navSections: window.nav,
		moment: window.moment,
		paypalInfo: null,
		loading: false,
		tagTemp: {
			name: '',
			content: ''
		},
		aliasTemp: {
			name: '',
			content: ''
		},
		searchValue: null,
		previewEnabled: false
	},
	watch: {
		selectedGuildID: function (newID, oldID) {
			/*console.log(oldID, newID);
			this.prevGuildID = oldID;*/
			this.openDropdown = null;
			if (!this.column) this.column = 'general';
			loadGuildSettings(newID);
		},
		column: function () {
			this.sidenavOpen = false;
			window.autoExpandAll();
			this.searchValue = null;
			this.previewEnabled = false;
		},
		openDropdown: calcDropdowns,
		previewEnabled: window.highlightAll
	},
	methods: {
		reloadGSettings: window.loadGuildSettings,
		saveGSettings: window.saveGuildSettings,
		addTag: function() {
			if (!this.tagTemp.name || !this.tagTemp.content) {
				showNotif('error', 'Needs a name and content!', 3000); return;
			}
			this.gSettings.tags[this.tagTemp.name] = this.tagTemp.content;
			this.tagTemp = {
				name: '',
				content: ''
			};
		},
		deleteTag: function(name) {
			delete this.gSettings.tags[name];
			page.$forceUpdate();
		},
		addAlias: function() {
			if (!this.aliasTemp.name || !this.aliasTemp.content) {
				showNotif('error', 'Needs a name and command!', 3000); return;
			}
			this.gSettings.aliases[this.aliasTemp.name] = this.aliasTemp.content;
			this.aliasTemp = {
				name: '',
				content: ''
			};
		},
		deleteAlias: function(name) {
			delete this.gSettings.aliases[name];
			page.$forceUpdate();
		},
		parseMD: function(str) {
			// parse markdown (i.e. underlining) and syntax highlighting
			let mdParse = SimpleMarkdown.defaultBlockParse;
		    let htmlOutput = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(SimpleMarkdown.defaultRules, 'html'));
			str = htmlOutput(mdParse(str))[0];
			str = str.replace(/markdown-code-/g, 'hljs '); // fix code highlighting bullshit
			str = str.replace(/<a href="/g, '<a target="_blank" href="'); // make links open in new tab

			// parse emojis
			str = str.replace(/&lt;(a?):([a-zA-Z_0-9]{2,32}):(\d{17,20})&gt;/g, (match, p1, p2, p3) => {
				return `<img title=":${p2}:" alt=":${p2}:" src="https://cdn.discordapp.com/emojis/${p3}.${p1 ? 'gif' : 'png'}?v=1" style="height:24px!important;vertical-align:middle;">`
			});
			// parse channel mentions
			let gc = this.gChannels, g = this.selectedGuildID;
			str = str.replace(/&lt;#(\d{17,20})&gt;/g, (match, p1) => {
				for (let i in gc) {
					if (gc[i].id === p1) {
						return `<a target="_blank" href="https://discordapp.com/channels/${g}/${p1}" class="mention">#${gc[i].name}</a>`;
					}
				}
				return '<span class="mention">#deleted-channel</span>';
			});
			// parse role mentions
			let gr = this.gRoles;
			str = str.replace(/&lt;@&amp;(\d{17,20})&gt;/g, (match, p1) => {
				for (let i in gr) {
					if (gr[i].id === p1) {
						return `<span class="mention" style="${gr[i].cssColor}">@${gr[i].name}</span>`;
					}
				}
				return '<span class="mention">@deleted-role</span>';
			});
			// TODO: User mentions (hard)

			str = str.replace(/\n/g, '<br>');

			return str;
		},
		getLen(obj, ignore = []) {
			let count = 0;
			for (let key in obj) {
				if (ignore.indexOf(key) === -1)
					count++;
			}
			return count;
		}
	},
	computed: {
		maxPremiumGuilds: function() {
			if (!this.paypalInfo || !this.paypalInfo.plan || typeof this.paypalInfo.plan.description !== 'string') return 0;
			let num = parseInt(this.paypalInfo.plan.description.substr(0, 1));
			return isNaN(num) ? 0 : (num > 5 ? 5 : num);
		}
	}
});

if (window.location.hash) {
	page.column = window.location.hash.substr(1);
}
//let _blockNext = false;

async function loadUserInfo() {
	if (getCookie('token')) {
		page.loading = true;
	    showNotif('pending', 'Fetching user info...');
	    let userinfo = await makeRequest({method: 'GET', url: 'https://api.benderbot.co/userinfo', auth: getCookie('token')}).catch(console.error);
		if (userinfo)
			userinfo = JSON.parse(userinfo);
		//console.log(userinfo);
		page.loading = false;
	    if (userinfo && userinfo.guilds && userinfo.user) {
	        showNotif('success', 'Loaded user info + guilds!', 4000);
	        page.guilds = userinfo.guilds;
	        page.user = userinfo.user;
	    } else {
	        showNotif('error', 'Failed to load user info + guilds.', 6000);
	    }
	} else {
	    showNotif('pending', 'Log in already u heckin nerd', 4000);
	}
}

async function loadGuildSettings(gID) {
	if (!gID) return;
	/*if (_blockNext) {
		_blockNext = false;
		return;
	}
	if (page.unsaved) {
		if (window.confirm('Are you sure you want to discard your changes?') === false) {
			page.selectedGuildID = page.prevGuildID;
			_blockNext = true;
			return;
		}
	}*/
	if (gID === 'PAYPAL') {
		return updatePaypalInfo();
	}
	if (getCookie('token')) {
		page.loading = true;
	    showNotif('pending', 'Fetching guild settings...');
	    let gData = await makeRequest({method: 'GET', url: 'https://api.benderbot.co/guild/' + gID, auth: getCookie('token')}).catch(console.error);
		gData = JSON.parse(gData);
		//console.log(gSet);
		page.loading = false;
	    if (gData) {
	        showNotif('success', 'Loaded guild settings!', 4000);
			gData.settings.guildID = gID;
	        page.gSettings = gData.settings;
			//page.unsaved = false;
			page.gRoles = gData.roles;
			page.gChannels = gData.channels;
	    } else {
	        showNotif('error', 'Failed to load guild settings.', 6000);
	    }
	} else {
	    showNotif('pending', 'You are not logged in. Cannot fetch settings.', 4000);
	}
	// trigger auto-expand of textareas
	setTimeout(autoExpandAll, 5);
	// apply syntax highlighting to codeblocks
	setTimeout(highlightAll, 5);
}

async function saveGuildSettings(gID) {
	if (!gID) return;
	/*if (!page.unsaved) {
		showNotif('success', 'No changes needed.', 2000); return;
	}*/
	if (!page.user || !getCookie('token'))
		return showNotif('error', 'You are not logged in. Cannot save settings.', 4000);

	if (gID === 'PAYPAL') {
		if (!page.paypalInfo || !getCookie('paypal_token'))
			return showNotif('error', 'You are not logged in to PayPal. Cannot save Bender Pro settings.', 4000);
		let temp = {
			guilds: page.paypalInfo.guilds,
			discordID: page.user.id
		};
		console.log(temp);
		showNotif('pending', 'Saving Bender Pro settings...');
	    let err, gData = await makeRequest({method: 'POST', url: 'https://api.benderbot.co/paypal_info', auth: getCookie('paypal_token'), auth2: getCookie('token'), body: temp}).catch(er => {
			err = er;
			console.error(er);
		});
		page.loading = false;
	    if (err) {
			showNotif('error', 'Failed to save Bender Pro settings.', 6000);
		} else {
	        showNotif('success', 'Saved Bender Pro settings!', 4000);
			//page.unsaved = false;
	    }
		return;
	}

	// TODO: actually do this shit
	alert('Saving settings is not done yet! Come back soon™'); return;

	let temp = Object.assign({}, page.gSettings);
	delete temp.guildID;
	page.loading = true;
    showNotif('pending', 'Saving guild settings...');
    let err, gData = await makeRequest({method: 'POST', url: 'https://api.benderbot.co/guild/' + gID, auth: getCookie('token'), body: temp}).catch(er => {
		err = er;
		console.error(er);
	});

	page.loading = false;
    if (err) {
		showNotif('error', 'Failed to save guild settings.', 6000);
	} else {
        showNotif('success', 'Saved guild settings!', 4000);
		//page.unsaved = false;
    }
}

let firstPP = true;
async function updatePaypalInfo() {
    if (getCookie('paypal_token')) {
		page.loading = true;
		if (!firstPP)
			showNotif('pending', 'Fetching PayPal info...');
        let data = await makeRequest({method: 'GET', url: 'https://api.benderbot.co/paypal_info', auth: getCookie('paypal_token')}).catch(console.error);
		page.loading = false;
        if (data) {
			if (!firstPP)
				showNotif('success', 'Loaded PayPal info!', 4000);
            page.paypalInfo = JSON.parse(data);
			firstPP = false;
        } else {
			if (!firstPP)
				showNotif('error', 'Failed to load PayPal info.', 6000);
        }
    } else {
		if (!firstPP)
			showNotif('pending', 'Log in to PayPal already u heckin nerd', 4000);
    }
}

loadUserInfo();
updatePaypalInfo();

// more shit from StackOverflow
function compareObj(obj1, obj2) {
	for (let p in obj1) {
		if (p === '__ob__') continue;
		//console.log(p);
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
		switch (typeof (obj1[p])) {
			case 'object':
				if (!compareObj(obj1[p], obj2[p])) return false;
				break;
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
				break;
			default:
				if (obj1[p] != obj2[p]) return false;
		}
	}
	for (let p in obj2) {
		if (typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
};

/*page.$watch('gSettings', function(newValue, oldValue) {
	page.unsaved = oldValue.guildID && oldValue.guildID === newValue.guildID && !compareObj(newValue, oldValue);
	console.log({oldValue, newValue});
	//console.log('oldValue.__ob__ === newValue.__ob__ ? '+(oldValue.__ob__ === newValue.__ob__));
	console.log('unsaved changes? '+page.unsaved);
}, {deep: true});
window.onbeforeunload = function() {
  return page.unsaved ? 'Are you sure you want to discard your changes?' : null;
};*/
