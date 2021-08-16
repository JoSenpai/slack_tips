# Build docker image to container registry
gcloud builds submit --tag gcr.io/personal-316806/slack_app_dev_best_practices

# Deploy cloud run
gcloud run deploy slack-app-dev-best-practices --image gcr.io/personal-316806/slack_app_dev_best_practices --set-env-vars PROJECT_ID=personal-316806
