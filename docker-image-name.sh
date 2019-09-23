#!/usr/bin/env bash
set -ueo pipefail

TAG=${TAG:-$(git log -1 --format='%H')}

GCP_PROJECT_ID=deversify-infra-test

echo "gcr.io/${GCP_PROJECT_ID}/efx-trustless-data:${TAG}"
