run:
	make generate-ssl-cert
	@echo "Running the application..."
	docker-compose up

generate-ssl-cert:
	if [ ! -f ./localhost.key ] || [ ! -f ./localhost.crt ]; then \
  		echo "Generating SSL certificates..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./localhost.key -out ./localhost.crt; \
	fi

