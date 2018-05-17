# Ramadan 2018
🎉🎈🎂🍾🎊🍻💃

*Simple Sehri/Iftar timetable consuming a prayer times API*

**[Access App Here](https://mottaquikarim.github.io/Ramadan2018/)**

![screenshot](https://github.com/mottaquikarim/Ramadan2018/blob/master/app_screenshot.png?raw=true)

## Motivation

Oftentimes, sehri/iftar times are only available as images uploaded by local masjids. This can be frustrating to find, look up, etc.

This app connects to an API built on top of a patched version of **[this project](http://praytimes.org/manual)** (I found a bug with scope in the python implementation, my patch has not yet been submitted upstream because I did not see any way to achieve this on the code manual).

The API, also developed by me, is currently deployed to AWS Lambda (it is not yet open source, but I hope to open source it soon). It is available for consumption **[here](https://ksw1yk85j7.execute-api.us-east-1.amazonaws.com/prod/location/40.7128/-74.0059?date=1525343638)**. (Docs coming soon, once the API itself is open sourced).

**NOTE**: By default times are calculated with the **[ISNA](http://praytimes.org/wiki/Prayer_Times_Calculation)** method.

## App

This app uses the Geolocation API to attempt to calculate lat/lon coordinates of user. It will commit this value to localStorage for subsequent use. Given the lat/long, it connects to the API mentioned above and displays `fajr`, `sunrise` and `sunset` times. Additionally, there is support for looking forward and looking back in time.

## To dos and future features

* If lat/lon fails, display input for user to pass in city/country
* Support ICS files / google events
* Add test coverage
