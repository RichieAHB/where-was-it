set -ex

REV_TAG=$(git log -1 --pretty=format:%h)
IMAGE_NAME="where-was-it-backend"
REGISTRY_LOCATION=gcr.io/rbeddington-where-was-it
IMAGE_URI="$REGISTRY_LOCATION/$IMAGE_NAME:$REV_TAG"

docker build -t "$IMAGE_NAME" .
docker tag "$IMAGE_NAME" "$IMAGE_URI"
docker push "$IMAGE_URI"

pushd k8s
kustomize edit set image "gcr.io/PROJECT_ID/IMAGE:TAG=$IMAGE_URI"
kubectl apply -k ./
popd
