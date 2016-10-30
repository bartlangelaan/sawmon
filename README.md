# SAWMON 

[![Code Climate](https://codeclimate.com/github/bartlangelaan/sawmon/badges/gpa.svg)](https://codeclimate.com/github/bartlangelaan/sawmon)
[![GitHub issues](https://img.shields.io/github/issues/bartlangelaan/sawmon.svg)](https://waffle.io/bartlangelaan/sawmon)
[![dependencies Status](https://david-dm.org/bartlangelaan/sawmon/status.svg)](https://david-dm.org/bartlangelaan/sawmon)
[![devDependencies Status](https://david-dm.org/bartlangelaan/sawmon/dev-status.svg)](https://david-dm.org/bartlangelaan/sawmon?type=dev)

Servers and websites monitoring, pluggable.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/bartlangelaan/sawmon/tree/heroku)

## What is this?
This is a work-in-progress tool that can monitor servers and websites. It's very pluggable, fast and useful.

## How does it work?
You can add servers and websites, and they both have a `refresh` and a `ping` function. With plugins, you can add functionality to both functions, like checking the response code or check for updates trough SSH. All the results are presented in a sortable table, so you can create and customize your own statusboard.

## When is it done?

Never. But this is on the roadmap: https://waffle.io/bartlangelaan/sawmon
