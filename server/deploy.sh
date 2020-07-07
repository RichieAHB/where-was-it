set -ex

REV_TAG=$(git log -1 --pretty=format:%h)
BUILD_ID="where-was-it-backend:$REV_TAG"
REGISTRY_LOCATION=gcr.io/rbeddington-where-was-it
IMAGE_NAME="$REGISTRY_LOCATION/$BUILD_ID"

docker build -t "$BUILD_ID" .
docker tag "$BUILD_ID" "$IMAGE_NAME"
docker push "$IMAGE_NAME"
template=$(< "k8s/deployment.yaml" sed "s~{{IMAGE_NAME}}~$IMAGE_NAME~g")
echo "$template" | kubectl apply -f -
kubectl apply -f k8s/certificate.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
