1. https://console.cloud.google.com/kubernetes/list?project=vobi-216108
2. Deploy : gcloud container clusters get-credentials  vobi-dev-cluster --zone us-central1-a --project vobi-216108
3. kubectl apply -f deployment-dev.yaml
4. kubectl expose deployment mixtapeapi --type=NodePort --name=mixtapeapi
5. ingress.yaml depoy :  kubectl apply -f Ingress.yaml

build trigger:
1. https://console.cloud.google.com/cloud-build/triggers?authuser=1&project=vobi-216108

