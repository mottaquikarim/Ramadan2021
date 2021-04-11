<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/icon-precomposed.png?raw=true" width="128px">

# Ramadan 2021
🎉🎈🎂🍾🎊🍻💃

*Simple Sehri/Iftar timetable consuming a prayer times API*

**[Access App Here](https://ramadan.link)**

<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/app_screenshot.png?raw=true" width="400px">

## Table of Contents
* **[Motivation](#motivation)**
* **[App](#app)**
* **[To dos and future features](#to-dos-and-future-features)**
* **[Serverless](#serverless)**
* **[Screenshots](#screenshots)**
* **[Attribution](#attribution)**

## Motivation

Sehri/iftaar times (when to start and stop fasting) during the month of Ramadan is usually distributed as tables like [here](https://www.islamicfinder.org/ramadan-calendar/) and [here](https://www.google.com/search?q=ramadan+times+2018&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiI_ffwlJLbAhXSuFkKHW-qBEYQ_AUICygC&biw=1440&bih=761).

While exhaustive, it can be annoying to track down the proper timee, esp if one is stuck in the subway without internet (for instance).

This app connects to an API built on top of a patched version of **[this project](http://praytimes.org/manual)** (I found a bug with scope in the python implementation, my patch has not yet been submitted upstream because I did not see any way to achieve this on the code manual. If anyone knows of a way to achieve this please make an issue!).

The API, also developed by me, is currently deployed to AWS Lambda (and open sourced! Check it out **[here](https://github.com/mottaquikarim/PrayerApp)**!). It is available for consumption **[here](https://8ldbpgh8mh.execute-api.us-east-1.amazonaws.com/prod/location/40.7128/-74.0059?date=1525343638)**. (**NOTE**: this app still runs on older version of this API, will switch over once the open sourced version reaches feature parity).

This app is an offline-accessible, persistent client for the API mentioned above. It can be added to the homescreen for easy access and also supports ICS downloading functionality.

## App

**NOTE**: By default times are calculated with the **[ISNA](http://praytimes.org/wiki/Prayer_Times_Calculation)** method.

This app uses the Geolocation API to attempt to calculate lat/lon coordinates of user. It will commit this value to localStorage for subsequent use. Given the lat/long, it connects to the API mentioned above and displays `fajr`, `sunrise` and `sunset` times + prayer times for the day. Additionally, there is support for looking forward and looking back in time.

Using service workers, there is robust support for offline access and viewing. On initial load, the app pulls in content for the next N days, where `N = [last day of Ramadan - today]`. This data is committed to cache and used by the ICS generator to build events to save into iCal.

To enable offline features, it is required that the app is loaded **once** over an internet connection. It does take some time to pull in the remaining days of Ramadan calculation but once that is complete it should be fully and equally functional offline and online 👍

## To dos and future features

* If lat/lon fails, display input for user to pass in city/country **(currently only defaults to NYC)**
* Support ICS files **(DONE)** / google events
* Add test coverage
* favicon (someone plz halp?)
* better / more granular ICS support
* build tooling (**desperately** needed)
* maybe convert into React...?

# Serverless

The implementation of the feedback submission feature requires the use of **[Webtask](https://webtask.io)** and IFTTT. In particular, the **[Maker Webhooks](https://ifttt.com/maker_webhooks)** feature of IFTTT is invoked when user submits feedback. This is hooked into IFTTT to create a new issue on Github as feedback is submitted. In order to satisfy CORS requirements and also protect Maker Webhook API Key, a webtask function is used as proxy - it simply sets the correct CORS headers and also hides the API Key in the *Secrets* management tool. The function that is currently deployed to webtask lives in the `serverless` folder and the key is called `iftttKey`.

## Screenshots

<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/homescreen-icon.jpg?raw=true" width="250px"><img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/app_screenshot.png?raw=true" width="250px">
<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/add-to-calendar.jpg?raw=true" width="250px">
<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/calendar-options.jpg?raw=true" width="250px">
<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/download-ics.jpg?raw=true" width="250px">
<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/ics-view.jpg?raw=true" width="250px">
<img src="https://github.com/mottaquikarim/Ramadan2018/blob/master/screenshots/calendar-view.jpg?raw=true" width="250px">


## Attribution

**[Icon](http://www.myiconfinder.com/icon/mosque-arab-arabia-islam-masjid-quran-muslim/18958#.512)** for homescreen.
