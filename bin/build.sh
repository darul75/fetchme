#!/bin/bash

watchify --debug -t [ babelify --presets [ es2015 react ] ] src/app/app.js -o dist/bundle.js;
watchify --debug -t [ babelify --presets [ es2015 react ] ] src/contentscripts/inspector.js -o dist/inspector.js
