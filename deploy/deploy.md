1. https://console.cloud.google.com/kubernetes/list?project=vobi-216108
2. Deploy : gcloud container clusters get-credentials workep-kubernetes --zone us-central1-c --project vobi-216108
3. kubectl apply -f deployment-dev.yaml
4. kubectl expose deployment workepbt --type=NodePort --name=workepbt
5. ingress.yaml depoy :  kubectl apply -f Ingress.yaml

build trigger:
1. https://console.cloud.google.com/cloud-build/triggers?authuser=1&project=vobi-216108

