REGISTRY_LOCATION=gcr.io/rbeddington-where-was-it

docker build -t where-was-it-backend .
docker tag where-was-it-backend $REGISTRY_LOCATION/where-was-it-backend
docker push $REGISTRY_LOCATION/where-was-it-backend
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/certificate.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
