# DS DeFi Core - Makefile
# Common operations for development and deployment

.PHONY: help install dev build test lint clean docker-up docker-down db-migrate db-seed db-reset

# Default target
help:
	@echo "╔═══════════════════════════════════════════════════════════════╗"
	@echo "║              DS DeFi Core - Development Commands              ║"
	@echo "╠═══════════════════════════════════════════════════════════════╣"
	@echo "║  install      Install dependencies                            ║"
	@echo "║  dev          Start development server                        ║"
	@echo "║  build        Build for production                            ║"
	@echo "║  test         Run test suite                                  ║"
	@echo "║  lint         Run linter                                      ║"
	@echo "║  clean        Remove build artifacts                          ║"
	@echo "╠═══════════════════════════════════════════════════════════════╣"
	@echo "║  docker-up    Start all services via Docker                   ║"
	@echo "║  docker-down  Stop all Docker services                        ║"
	@echo "║  docker-logs  View Docker logs                                ║"
	@echo "║  docker-build Rebuild Docker images                           ║"
	@echo "╠═══════════════════════════════════════════════════════════════╣"
	@echo "║  db-migrate   Run database migrations                         ║"
	@echo "║  db-seed      Seed database with initial data                 ║"
	@echo "║  db-reset     Reset database (drop + migrate + seed)          ║"
	@echo "║  db-studio    Open Drizzle Studio (DB viewer)                 ║"
	@echo "╠═══════════════════════════════════════════════════════════════╣"
	@echo "║  deploy       Deploy to production                            ║"
	@echo "║  release      Create a new release                            ║"
	@echo "╚═══════════════════════════════════════════════════════════════╝"

# =============================================================================
# Development
# =============================================================================

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

clean:
	rm -rf dist node_modules coverage .nyc_output

# =============================================================================
# Docker
# =============================================================================

docker-up:
	docker-compose up -d
	@echo ""
	@echo "Services started:"
	@echo "  API:      http://localhost:4000/graphql"
	@echo "  Adminer:  http://localhost:8080"
	@echo ""

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-build:
	docker-compose build --no-cache

docker-clean:
	docker-compose down -v --rmi local

# =============================================================================
# Database
# =============================================================================

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-reset:
	@echo "Resetting database..."
	docker-compose exec postgres psql -U dsdefi -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	npm run db:migrate
	npm run db:seed
	@echo "Database reset complete."

db-studio:
	npx drizzle-kit studio

db-generate:
	npx drizzle-kit generate:pg

# =============================================================================
# Production
# =============================================================================

deploy:
	@echo "Deploying to production..."
	@echo "TODO: Implement deployment pipeline"

release:
	@echo "Creating release..."
	npm version patch
	git push --tags

# =============================================================================
# Utility
# =============================================================================

check-env:
	@test -f .env || (echo "Error: .env file not found. Copy .env.example to .env" && exit 1)

status:
	@echo "=== Git Status ==="
	@git status --short
	@echo ""
	@echo "=== Docker Status ==="
	@docker-compose ps
	@echo ""
	@echo "=== Node Version ==="
	@node --version
