ENV_EXIST := false

# Load vars from .env
ifneq ("$(wildcard .env)","")
    ENV_EXIST := true
    ELK_FOLDER := $(shell grep '^ELK_FOLDER=' .env | cut -d '=' -f 2)
    LOGS_ELASTIC_FOLDER := $(shell grep '^LOGS_ELASTIC_FOLDER=' .env | cut -d '=' -f 2)
    BACKUP_ELASTIC_LOGS := $(shell grep '^BACKUP_ELASTIC_LOGS=' .env | cut -d '=' -f 2)
	# Check loaded vars from .env
    ifeq ($(LOGS_ELASTIC_FOLDER),)
		$(error "LOGS_ELASTIC_FOLDER no defined. Check LOGS_ELASTIC_FOLDER  in .env .")
    endif
    ifeq ($(BACKUP_ELASTIC_LOGS),)
    	$(error "BACKUP_ELASTIC_LOGS no defined. Check BACKUP_ELASTIC_LOGS in .env.")
    endif
endif


all: 
	@echo > /dev/null
#	docker compose -f docker-compose.yml up --build
	@docker compose -f docker-compose.yml up -d --build
	
	@echo "\n▉▉▉▉▉▉▉▉▉▉ WELCOME TO TRASCENDENCE PROJECT! ▉▉▉▉▉▉▉▉▉▉\n"
	@echo "To check the system status run: make status\n"
	@echo "Access to user API(back) at: https://localhost:8443"
	@echo "Access to profile view(front) at: https://localhost:3000"

elk: create_folders
	@echo > /dev/null
	@docker compose -f docker-compose_log_elk.yml up --build
#	@docker compose -f docker-compose_log_elk.yml up -d --build
	
	@echo "\n▉▉▉▉▉▉▉▉▉▉ WELCOME TO TRASCENDENCE PROJECT! ▉▉▉▉▉▉▉▉▉▉\n"
	@echo "To check the system status run: make status\n"
	@echo "Access to user API(back) at: https://localhost:8443"
	@echo "Access to profile view(front) at: https://localhost:3000"

create_folders:
	@if [ $(ENV_EXIST) = "false" ]; then \
		echo ".env doesn't exist. Check for .env."; \
		exit 1; \
	fi
	@for dir in $(LOGS_ELASTIC_FOLDER) $(BACKUP_ELASTIC_LOGS); do \
		if [ ! -d "$$dir" ]; then \
			mkdir -p "$$dir"; \
			chmod 777 "$$dir"; \
			echo "'$$dir' folder has been created."; \
		else \
			echo "'$$dir' folder exists."; \
		fi \
	done

down:
	@docker compose -f docker-compose.yml down

# Docker down deleting docker volumes

downapp:
	@docker compose -f docker-compose.yml down -v

downelk:
	@docker compose -f docker-compose_log_elk.yml down -v

# Delete ELK folder (and subfolders) used for snapshots and backups
cleanfolders:
	@if [ $(ENV_EXIST) = "true" ]; then \
		rm -rf $(ELK_FOLDER); \
	fi
	@rm -rf ./backend/microservices/game_service/dist/
	@rm -rf ./backend/api-gateway/dist/
	@rm -f ./backend/api-gateway/tsconfig.pino_utils.tsbuildinfo
	@docker volume prune

# For easy clean by apardo-m
cleanapp: downapp cleanfolders

cleanelk: downelk cleanfolders

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

.PHONY: all down clean fclean status re fresh create_folders downapp downelk cleanfolders cleanapp cleanelk 
