#!/bin/bash

# watchify --debug -t [ babelify --presets [ es2015 react ] ] src/app/app.js -o dist/bundle.js > cmd.log 2>&1

watchify --debug -t [ babelify --presets [ es2015 react ] --plugins [transform-object-rest-spread] ] src/app/app.js -o dist/bundle.js & watchify --debug -t [ babelify --presets [ es2015 react ] --plugins [transform-object-rest-spread] ] src/contentscripts/inspector.js -o dist/inspector.js & C:\JUL\DEV\github\fetchme>watchify --debug -t [ babelify --presets [ es2015 react ] ] src/app/utils/worker.js -o dist/bundle-worker.js
