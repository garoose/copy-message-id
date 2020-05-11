FILES=manifest.json background.js options/* icons/* LICENSE

XPI_NAME=copy-message-id@j.kahn.xpi

.PHONY: clean

all: $(XPI_NAME)

$(XPI_NAME): $(FILES)
	zip -r $@ $^

clean:
	rm *.xpi
