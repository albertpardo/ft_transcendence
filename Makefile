# Load vars from .env
ifneq ("$(wildcard .env)","")
    ELK_FOLDER := $(shell grep '^ELK_FOLDER=' .env | cut -d '=' -f 2)
    LOGS_ELASTIC_FOLDER := $(shell grep '^LOGS_ELASTIC_FOLDER=' .env | cut -d '=' -f 2)
    BACKUP_ELASTIC_LOGS := $(shell grep '^BACKUP_ELASTIC_LOGS=' .env | cut -d '=' -f 2)
endif

# Check loaded vars from .env
ifeq ($(LOGS_ELASTIC_FOLDER),)
    $(error "LOGS_ELASTIC_FOLDER no defined. Check LOGS_ELASTIC_FOLDER  in .env .")
endif
ifeq ($(BACKUP_ELASTIC_LOGS),)
    $(error "BACKUP_ELASTIC_LOGS no defined. Check BACKUP_ELASTIC_LOGS in .env.")
endif
ifeq ($(BACKUP_ELASTIC_LOGS),)
    $(error "BACKUP_ELASTIC_LOGS no defined. Check BACKUP_ELASTIC_LOGS  in .env .")
endif

all: create_folders
	@echo > /dev/null
#	docker compose -f docker-compose.yml up --build
#	@docker compose -f docker-compose.yml up -d --build
	@docker compose -f docker-compose_pino.yml up -d --build
	
	@echo "\n▉▉▉▉▉▉▉▉▉▉ WELCOME TO TRASCENDENCE PROJECT! ▉▉▉▉▉▉▉▉▉▉\n"
	@echo "To check the system status run: make status\n"
	@echo "Access to user API(back) at: https://localhost:8443"
	@echo "Access to profile view(front) at: https://localhost:3000"

create_folders:
	@for dir in $(LOGS_ELASTIC_FOLDER) $(BACKUP_ELASTIC_LOGS); do \
		if [ ! -d "$$dir" ]; then \
			mkdir -p "$$dir"; \
			chmod 777 "$$dir"; \
			echo "La carpeta '$$dir' ha sido creada."; \
		else \
			echo "La carpeta '$$dir' ya existe."; \
		fi \
	done

down:
	@docker compose -f docker-compose.yml down

# Docker down deleting docker volumes
downvol:
	@docker compose -f docker-compose_pino.yml down -v

# Delete ELK folder (and subfolders) used for logs and backups
cleanfolders:
	@rm -rf $(ELK_FOLDER)
	@rm -rf ./backend/microservices/game_service/dist/
#	@rm -rf ./backend/api-gateway/dist/


# For easy clean by apardo-m
cleanapardo: downvol cleanfolders

status:
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ CONTAINERS STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker ps -a
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ SYSTEM STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker system df
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ VOLUME STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker volume ls
	@echo "\n▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ NETWORK STATUS ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉\n"
	@docker network ls

clean: cleanfolders
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

.PHONY: all create_folders down downvol clean cleanapardo fclean status re fresh
