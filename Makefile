SHELL := /bin/bash

nativescript:
	echo "NativeScript Release:"
	npx webpack --config=webpack/config.js
