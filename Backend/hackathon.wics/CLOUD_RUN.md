# Cloud Run deployment

This service is set up to deploy to Google Cloud Run with:


## One-time setup

Make sure these APIs are enabled:

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API
- Cloud SQL Admin API

Grant the Cloud Run runtime service account access to:

- Cloud SQL Client
- Storage Object Admin on the bucket
- Service Account Token Creator if signed URL generation needs IAM blob signing

## Deploy

Set the database password in your shell and run the script:

```bash
chmod +x deploy-cloud-run.sh
export DB_PASSWORD='your-postgres-password'
./deploy-cloud-run.sh
```

You can override defaults if needed:

```bash
PROJECT_ID=possible-byte-437704-m6 \
REGION=us-central1 \
SERVICE_NAME=hackathon-wics \
DB_INSTANCE_CONNECTION_NAME=possible-byte-437704-m6:us-central1:hackathon \
DB_NAME=postgres \
DB_USER=postgres \
DB_PASSWORD='your-postgres-password' \
GCS_BUCKET_NAME=hackathon-wics_hudson \
GCS_SUBDIRECTORY=bird \
./deploy-cloud-run.sh
```
