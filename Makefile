all: core

core:
	mkdir -p build
	./Makefile.dryice.js

clean:
	rm -f build/*.js
	@@echo ""
	@@echo ""
	@@echo "Clean!"
	@@echo ""
