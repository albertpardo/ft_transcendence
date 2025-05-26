
all:
	@echo > /dev/null
	docker compose -f docker-compose.yml up --build
	
	@echo "\n▉▉▉▉▉▉▉▉▉▉ WELCOME TO TRASCENDENCE PROJECT! ▉▉▉▉▉▉▉▉▉▉\n"
	@echo "To check the system status run: make status\n"
	@echo "Access to user API(back) at: https://127.0.0.1:8443/api"
	@echo "Access to profile view(front) at: http://127.0.0.1:3000"

down:
	docker compose -f docker-compose.yml down

status:
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ CONTAINERS STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker ps -a
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ SYSTEM STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker system df
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ VOLUME STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker volume ls
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ NETWORK STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker network ls

clean:
	@if [ -n "$$(docker ps -qa)" ]; then docker stop $$(docker ps -qa); fi
	@if [ -n "$$(docker ps -qa)" ]; then docker rm $$(docker ps -qa); fi
	@if [ -n "$$(docker images -qa)" ]; then docker rmi -f $$(docker images -qa); fi
	docker system prune -a --volumes -f || true;
	@echo "\n Docker images already cleaning up...\n"

fclean: clean
	@echo "\n Cleaning up persistent data...\n"
	@if [ -n "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); fi
#	@if networks=$$(docker network ls -q | grep -v 'bridge\|host\|none'); [ -n "$$networks" ]; then docker network rm $$networks || true; fi
	@echo "\n Persistent data successfully cleaning up...\n"

re: down all

fresh:
	@echo "\n Cleaning up existing docker resources! \n"
	$(MAKE) fclean
	$(MAKE) all
	@echo "\n All dockers successfully starting up! \n"

.PHONY: all down clean fclean status re fresh
