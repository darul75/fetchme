http://kangax.github.io/jstests/toDataUrl_mime_type_test/
http://www.alsacreations.com/article/lire/1439-data-uri-schema.html
https://uploadcare.com/cookbook/advanced/
http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent

npm install -g browserify
npm install -g watchify

https://facebook.github.io/react/docs/getting-started.html

> watchify --debug -t [ babelify --presets [ react ] ] src\popup.js -o dist/bundle.js

Error: Parsing file C:\JUL\DEV\github\fetchme\src\app.js: 'import' and 'export'
may appear only with 'sourceType: module' (3:0)

well... ok forgot 

> watchify --debug -t [ babelify --presets [ es2015 react ] ] src\popup.js -o dist/bundle.js