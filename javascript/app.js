(() => { // protect the lemmings!
    const START_RAMADAN = new Date(2018, 4, 16);
    const APP_ENTRY = '.js-app';
    const APP_EL = document.querySelector(APP_ENTRY);
    const fillContainer = markup => APP_EL.innerHTML = markup;

    // essentially, we want to store date object representing TODAY
    // but not NOW. this is used as a key for caching responses in localstorage
    const _time_now = new Date();
    let now = new Date(_time_now.getFullYear(), _time_now.getMonth(), _time_now.getDate());

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const getFormattedDate = () => `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

    const templates = {
        LOAD_SVWORKER: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-loop-circular large-icon large-icon--loop"></span>
                <p style="margin-bottom: 0;width: 100%;text-align:center;">Loading Service worker...</p>
            </div>
        `,
        ALLOW_GEOLOCATION: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-loop-circular large-icon large-icon--loop"></span>
                <p style="margin-bottom: 0;">Please allow location access!</p>
                <p>(This may take a few moments)</p>
            </div>
        `,
        FAILED_GEOLOCATION: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-ban large-icon"></span>
                <p style="margin-bottom: 0; width: 70%;">
                    You denied location access! This is required for this app to function.
                    Please click <a href="./index.html" style="font-weight: bold;">here</a> to provide location access.
                </p>
            </div>
        `,
        STILL_WORKING: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-loop-circular large-icon large-icon--loop"></span>
                <p>(...STILL working...sit tight!)</p>
            </div>
        `,
        QUERYING_API: `
            <div class="app-container">
                <span class="oi oi-loop-circular large-icon large-icon--loop"></span>
                <p style="margin-bottom: 0;">Successfully retrieved location! Fetching times...</p>
            </div>
        `,
        SOMETHING_WRONG: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-ban large-icon"></span>
                <p style="margin-bottom: 0; width: 70%;">
                    Something went wrong!
                    Please click <a href="./index.html" style="font-weight: bold;">here</a> to try again.
                </p>
                <p style="margin-bottom: 0; width: 70%;">
                    Or, view data for <a href="#" class="js-nyc" style="font-weight: bold;">New York City, US</span>.
                <p>
            </div>
        `,
        OFFLINE: `
            <div class="app-container js-geo-perm">
                <span class="oi oi-ban large-icon"></span>
                <p style="margin-bottom: 0; width: 70%;">
                    Data not available offline! Please go online and try again.
                    To go back to last page, please click here <a href="./index.html" style="font-weight: bold;">here</a>.
                </p>
            </div>
        `,
    }

    const queryGeolocation = () => new Promise((resolve, reject) => {
        fillContainer(templates.ALLOW_GEOLOCATION);
        const timeout = setTimeout(_ => {
            fillContainer(templates.STILL_WORKING);
        }, 3000);

        navigator.geolocation.getCurrentPosition(position => {
            resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                timeout,
            })
        }, err => reject({err, timeout}));

    }).then(({lat, lon, timeout}) => {
        const locStr = `${lat},${lon}`;
        clearTimeout(timeout)
        localStorage.setItem('location', locStr)

        return locStr;
    }, ({err, timeout}) => {
        clearTimeout(timeout)
        if (err.code === 1) {
            fillContainer(templates.FAILED_GEOLOCATION);
        }
    });
    

    const getLocation = () => Promise.resolve().then(_ => {
        const loc = localStorage.getItem('location') 
        if (loc) {
            return loc;
        }
        
        const cityoverride = localStorage.getItem('city-override')
        
        if (cityoverride) {
            return cityoverride;   
        }

        return queryGeolocation();
    });

    const _getEndpoint = loc => {
        if (localStorage.getItem('city-override')) {
            return `city/${localStorage.getItem('city-override')}`;
        }

        const [lat, lon] = loc.split(',');
        return `location/${lat}/${lon}`;
    }

    const _getCachedData = (dateObj, endpoint) => localStorage.getItem(dateObj.getTime()+'-'+endpoint)

    const queryAPI = (loc, dateObj=now) => new Promise((resolve, reject) => {
        const endpoint = _getEndpoint(loc);

        // if found in localstorage cache, use that instead
        // TODO: periodically, localstorage should be cleared
        const cachedData = _getCachedData(dateObj, endpoint);
        if (cachedData) {
            resolve(JSON.parse(cachedData))
            return;
        }

        const urlBase = 'https://ksw1yk85j7.execute-api.us-east-1.amazonaws.com/prod';
        const args = `date=${Math.floor(dateObj.getTime()/1000)}`;

        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", e => {
            localStorage.setItem(dateObj.getTime()+'-'+endpoint, e.target.responseText)
            resolve(JSON.parse(e.target.responseText))
        });
        xhr.addEventListener("error", e => reject(e))
        xhr.open('GET', `${urlBase}/${endpoint}?${args}`);
        xhr.send();
    });

    const renderData = data => {
        const times = data.data;
        const {fajr, sunset, sunrise} = times;
        fillContainer(`
<div class="app-container app-container--auto-height">
    <h3 class="text-white btn btn-dark btn-lg" style="width: 90%; text-align: center; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center;">
        <span class="js-left" style="padding: 10px; padding-left: 0;"><span class="oi oi-arrow-left text-info js-left"></span></span>
        <span>${getFormattedDate()}</span>
        <span class="js-right" style="padding: 10px; padding-right: 0;"><span class="oi oi-arrow-right text-info js-right"></span></span>
    </h3>
    <div class="card text-white bg-primary" style="width: 90%;border-radius:0;">
        <div class="card-body time-container">
            <span>Sehri</span>
            <h4 class="card-title time-container__title">${fajr}</h4>
        </div>
    </div>
    <div class="card text-white bg-primary" style="width: 90%;border-radius:0;">
        <div class="card-body time-container">
            <span>Sunrise</span>
            <h4 class="card-title time-container__title">${sunrise}</h4>
        </div>
    </div>
    <div class="card text-white bg-primary" style="width: 90%;border-radius:0;">
        <div class="card-body time-container">
            <span>Iftaar</span>
            <h4 class="card-title time-container__title">${sunset}</h4>
        </div>
    </div>
    <div class="card text-white bg-dark" style="width: 90%;">
        <div class="card-header time-container">
            <span>Fajr</span>
            <h6 class="card-title time-container__title">${times.fajr}</h6>
        </div>
    </div>
    <div class="card text-white bg-dark" style="width: 90%;">
        <div class="card-header time-container">
            <span>Zhuhr</span>
            <h6 class="card-title time-container__title">${times.dhuhr}</h6>
        </div>
    </div>
    <div class="card text-white bg-dark" style="width: 90%;">
        <div class="card-header time-container">
            <span>Asr</span>
            <h6 class="card-title time-container__title">${times.asr}</h6>
        </div>
    </div>
    <div class="card text-white bg-dark" style="width: 90%;">
        <div class="card-header time-container">
            <span>Maghrib</span>
            <h6 class="card-title time-container__title">${times.maghrib}</h6>
        </div>
    </div>
    <div class="card text-white bg-dark" style="width: 90%;">
        <div class="card-header time-container">
            <span>Isha</span>
            <h6 class="card-title time-container__title">${times.isha}</h6>
        </div>
    </div>
    <div class="card text-white bg-info js-add-to-cal" style="width: 90%; text-align: center;margin-bottom: 70px;">
        <div class="card-header js-add-to-cal">
            Add to Calendar
        </div>
    </div>
</div>
        `);
    }
    
    const init = (look_forward=true) => {
        const getLocationPromise = getLocation()
        const queryAPIPromise = getLocationPromise.then(loc => {
            if (!loc) {
                throw new Error('Location services explictly blocked')
                return;
            }

            fillContainer(templates.QUERYING_API);
            return queryAPI(loc)
        })
        const renderDataPromise = queryAPIPromise.then(data => renderData(data))

        renderDataPromise
            .catch(e => {
                console.log(e)
                if (!navigator.onLine) {
                    fillContainer(templates.OFFLINE);
                }
                else {
                    fillContainer(templates.SOMETHING_WRONG);
                }
            });

        Promise.all([getLocationPromise, queryAPIPromise, renderDataPromise])
            .then(all => {
                const [loc] = all

                // #fireAndForget
                if (look_forward) {
                    const forward_queries = []
                    for (let i = 1; i < 4; i++) {
                        const nextDateObj = new Date(now.getTime() + (1000*60*60*24)*i)
                        forward_queries.push(queryAPI(loc, nextDateObj));
                    }
                    Promise.all(forward_queries);
                }
            })
    }

    APP_EL.addEventListener('click', e => {
        console.log(e.target)
        if (e.target.matches('.js-left')) {
            now = new Date(now.getTime() - (1000*60*60*24));
            init(false);
        }
        else if (e.target.matches('.js-right')) {
            now = new Date(now.getTime() + (1000*60*60*24));
            init(false);
        }
        else if (e.target.matches('.js-nyc')) {
            e.preventDefault();
            localStorage.setItem('city-override', 'nyc/usa')
            init();
        }
        else if (e.target.matches('.js-go-back')) {
            init();
        }
        else if (e.target.matches('.js-gen-ics')) {
            generateEvents(e.target);
        }
        else if (e.target.matches('.js-add-to-cal')) {
            renderCal();
        }
    });

    const offlineEl = document.querySelector('.js-offline-alert');
    if (!navigator.onLine) {
        offlineEl.style.display = 'block'
    }
    window.addEventListener('offline', e => offlineEl.style.display = 'block')
    window.addEventListener('online', e => offlineEl.style.display = 'none')

    fillContainer(templates.LOAD_SVWORKER);
    if ('serviceWorker' in navigator) {
      const installTimeout = setTimeout(_ => {
        console.log('timeout')
        init();
      }, 1500)

      navigator.serviceWorker.register('cache-worker.js')
      .then(function(success) {
        console.log('Registered:', success);
        console.log( 'scope', success.scope );
        if ( success.installing ) {
            let sw = success.installing;
            sw.addEventListener( 'statechange', function ( event ) {
                if ( event.target.state == 'installed' ) {
                    console.log('oninstall')
                    clearTimeout(installTimeout)
                    init();
                }
            } )
        }
        else {
            console.log('already installed, running')
            clearTimeout(installTimeout)
            init();
        }
      })
      .catch(function(error) {
        console.log('Registration failed: ', error);
        console.log('loading app anyways...')
        clearTimeout(installTimeout)
        init();
      });
    }
    else {
        console.log('no svworker')
        //clearTimeout(installTimeout)
        init();
    }

    const renderCal = _ => {
        fillContainer(`<div class="app-container app-container--auto-height">
<h3 class="text-white btn btn-dark btn-lg" style="width: 90%; text-align: center; text-transform: uppercase; display: flex; justify-content: center; align-items: center;">
    <span>Calendar Options</span>
</h3>
<form style="width: 90%;">
  <fieldset>
    <div class="form-group form-row">
        <label for="reminder">Remind me...</label>
        <div class="input-group mb-3">
            <select class="custom-select" id="reminder">
                <option selected value="10">10</option>
                <option value="30">30</option>
                <option value="60">60</option>
            </select>
            <div class="input-group-append">
                <label class="input-group-text" for="reminder">mins before</label>
            </div>
        </div>
    </div>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="include-prayers">
        <label class="form-check-label" for="include-prayers">
            Include Prayer Times
        </label>
        <br/>
        <br/>
    </div>
    <div class="form-group form-row">
        <div class="btn btn-info col js-go-back">Go Back</div>
        <div class="btn btn-success col js-gen-ics">Save</div>
    </div>
  </fieldset>
</form>
        </div>`);
    }

    const queryForData = _ => getLocation().then(loc => {
        const endpoint = _getEndpoint(loc);
        let nextDateObj = now;
        let cachedData = _getCachedData(nextDateObj, endpoint);
        let i = 1;
        const events = [];
        while (cachedData) {
            const _data = JSON.parse(cachedData);
            Object.keys(_data.data).forEach(key => {
                const timestr = _data.data[key];
                const bits = timestr.split(':')
                const hr = bits[0];
                const min = bits[1].slice(0,2)
                const ampm = bits[1].slice(2);
                const hours = parseInt(hr) + (ampm == 'pm' ? 12 : 0);
                const mins = parseInt(min);
                const md = moment(nextDateObj)
                md.set('hour', hours)
                md.set('minute', mins)
                let name = key;
                if (key === 'fajr') {
                    name = 'Sehri';
                }
                else if (key === 'sunset') {
                    name = 'Iftar';
                }
                const diff = (nextDateObj.getTime() - START_RAMADAN.getTime()) / (1000*60*60*24);
                name = "Day " + diff + ": " + name;
                _data.data[key] = {
                    name: key,
                    start: md.format("YYYYMMDDTHHmmss"),
                    end: md.add(1, 'h').format("YYYYMMDDTHHmmss"),
                }
            })
            events.push(_data);

            nextDateObj = new Date(now.getTime() + (1000*60*60*24)*i)
            cachedData = _getCachedData(nextDateObj, endpoint);
            i++;
            if (i > 10) break;
        }
        return events;
    })

    const _buildAlarm = minuteValue => `BEGIN:VALARM
TRIGGER:-PT${minuteValue}M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM`;

    const _buildEvent = (evt, alarm) => `BEGIN:VEVENT
SUMMARY:${evt.name}
DTSTART:${evt.start}
DTEND:${evt.end}
STATUS:CONFIRMED
SEQUENCE:3
${alarm}
END:VEVENT`;

    const buildICS = (evts, alarm, includePrayers) => {
        const alarmICS = _buildAlarm(alarm);
        const events = evts.reduce((arr, evt) => {
            const {data} = evt;
            arr.push(_buildEvent(data.fajr, alarmICS))
            arr.push(_buildEvent(data.sunset, alarmICS))
            return arr;
        }, []).join('\n');
        
    const wrapper = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
${events}
END:VCALENDAR`

        return wrapper;
    }

    const generateEvents = _ => {
        queryForData().then(evts => {
            const alarm = document.querySelector('#reminder').value;
            const includePrayers = document.querySelector('#include-prayers').checked
            const ICS = buildICS(evts, alarm, includePrayers)

            const a = document.createElement('a')
            a.innerHTML = `<div class="btn btn-success">Download Events</div>`
            a.href = 'data:text/calendar;charset=utf-8,'+ encodeURIComponent(ICS)
            a.download = 'events.ics'
            for (let i = 0; i < _.parentNode.children.length; i++) {
                const child = _.parentNode.children[i];
                child.style.display = 'none';
            }
            _.parentNode.appendChild(a)
            a.onclick = e => init();
        })
    }

})();
