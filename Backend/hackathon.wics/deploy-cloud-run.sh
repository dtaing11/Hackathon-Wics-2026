#!/usr/bin/env bash

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-possible-byte-437704-m6}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-hackathon-wics}"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

DB_INSTANCE_CONNECTION_NAME="${DB_INSTANCE_CONNECTION_NAME:-possible-byte-437704-m6:us-central1:hackathon}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
GCS_BUCKET_NAME="${GCS_BUCKET_NAME:-hackathon-wics_hudson}"
GCS_SUBDIRECTORY="${GCS_SUBDIRECTORY:-bird}"

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "DB_PASSWORD must be set before deploying."
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

gcloud builds submit --tag "${IMAGE}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --add-cloudsql-instances "${DB_INSTANCE_CONNECTION_NAME}" \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},DB_INSTANCE_CONNECTION_NAME=${DB_INSTANCE_CONNECTION_NAME},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD},GCS_BUCKET_NAME=${GCS_BUCKET_NAME},GCS_SUBDIRECTORY=${GCS_SUBDIRECTORY}"
