
all:
	docker compose -f docker-compose.yml up -d --build
	
	@echo "\n▉▉▉▉▉▉▉▉▉▉ WELCOME TO TRASCENDENCE PROJECT! ▉▉▉▉▉▉▉▉▉▉\n"
	@echo "To check the system status run: make status\n"
	@echo "Access your backend at: http://127.0.0.1:4000"
#	@echo "Access your application at: http://127.0.0.1:3000"

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
	@if [ -n "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); fi
	docker system prune -a --volumes -f || true;

fclean: clean
	@echo "\n Cleaning up persistent data...\n"
# sudo rm -rf /home/${USER}/data/mariadb || true;
# @echo "\n Full cleanup completed.\n"

re: down all

.PHONY: all down clean fclean status re

