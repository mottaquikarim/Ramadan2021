(() => { // protect the lemmings!

    const APP_ENTRY = '.js-app';
    const APP_EL = document.querySelector(APP_ENTRY);
    const fillContainer = (markup) => {
        APP_EL.innerHTML = markup;
    }
    let now = new Date();
    const getFormattedDate = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",]
        const month = months[now.getMonth()]

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",]
        const day = days[now.getDay()];

        return `${day} ${month} ${now.getDate()}, ${now.getFullYear()}`
    }

    const templates = {
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
        `
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
        }, err => {
            reject({err, timeout}); 
        });
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

    const queryAPI = loc => new Promise((resolve, reject) => {
    

        const urlBase = 'https://ksw1yk85j7.execute-api.us-east-1.amazonaws.com/prod';
        let endpoint;
        if (localStorage.getItem('city-override')) {
            endpoint = `city/${localStorage.getItem('city-override')}`;
        }
        else {
            const [lat, lon] = loc.split(',');
            endpoint = `location/${lat}/${lon}`;
        }
        const args = `date=${Math.floor(now.getTime()/1000)}`;

        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", e => {
            resolve(JSON.parse(e.target.responseText))
        });
        xhr.addEventListener("error", e => {
            reject(e)
        })
        xhr.open('GET', `${urlBase}/${endpoint}?${args}`);
        xhr.send();
    });

    const renderData = data => {
        const times = data.data;
        const {fajr, sunset, sunrise} = times;
        fillContainer(`
<div class="app-container app-container--auto-height">
    <h3 class="text-white btn btn-dark btn-lg" style="width: 90%; text-align: center; text-transform: uppercase; display: flex; justify-content: space-between;">
        <span class="js-left"><span class="oi oi-arrow-left text-info js-left"></span></span>
        <span>${getFormattedDate()}</span>
        <span class="js-right"><span class="oi oi-arrow-right text-info js-right"></span></span>
    </h3>
    <div class="card text-white bg-primary" style="width: 90%;">
        <div class="card-body time-container">
            <span>Sehri</span>
            <h4 class="card-title time-container__title">${fajr}</h4>
        </div>
    </div>
    <div class="card text-white bg-primary" style="width: 90%;">
        <div class="card-body time-container">
            <span>Sunrise</span>
            <h4 class="card-title time-container__title">${sunrise}</h4>
        </div>
    </div>
    <div class="card text-white bg-primary" style="width: 90%;">
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
</div>
        `);
    }
    
    const init = () => {
        getLocation()
            .then(loc => {
                if (!loc) {
                    return;
                }

                fillContainer(templates.QUERYING_API);
                return queryAPI(loc)
            })
            .then(data => renderData(data))
            .catch(e => {
                fillContainer(templates.SOMETHING_WRONG);
            });
    }

    APP_EL.addEventListener('click', e => {
        console.log(e.target)
        if (e.target.matches('.js-left')) {
            now = new Date(now.getTime() - (1000*60*60*24));
            init();
        }
        else if (e.target.matches('.js-right')) {
            now = new Date(now.getTime() + (1000*60*60*24));
            init();
        }
        else if (e.target.matches('.js-nyc')) {
            e.preventDefault();
            localStorage.setItem('city-override', 'nyc/usa')
            init();
        }
    });

    init();
})();
