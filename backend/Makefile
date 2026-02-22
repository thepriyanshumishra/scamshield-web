# ScamShield Backend — Makefile
# Beginner-friendly commands. Run from the backend/ folder.

.PHONY: setup run install

## Create virtualenv and install all dependencies
setup:
	python3 -m venv venv
	venv/bin/pip install --upgrade pip
	venv/bin/pip install 'uvicorn[standard]'
	venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "✅ Setup complete! Now run: make run"

## Start the FastAPI server with live reload
run:
	venv/bin/uvicorn main:app --reload --port 8000

## Install / update dependencies only (venv must already exist)
install:
	venv/bin/pip install -r requirements.txt
