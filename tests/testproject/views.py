from django.shortcuts import render


def index(request):
    return render(request, "testproject/index.html", {"email": "person@example.com"})
