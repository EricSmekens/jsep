all: _build

_build:
	mkdir -p build
	./Makefile.dryice.js build

dist: _build
	mkdir -p dist
	./Makefile.dryice.js dist

clean:
	rm -f build/*.js
	@@echo ""
	@@echo ""
	@@echo "Clean!"
	@@echo ""
