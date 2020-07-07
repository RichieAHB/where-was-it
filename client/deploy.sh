set -ex

REGISTRY_LOCATION=gcr.io/rbeddington-where-was-it

docker build -t where-was-it-client .
docker tag where-was-it-client $REGISTRY_LOCATION/where-was-it-client
docker push $REGISTRY_LOCATION/where-was-it-client
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/certificate.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
