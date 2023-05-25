from django.shortcuts import render
from django.contrib.auth.models import User, auth

# Create your views here.

def home(request):
    return render(request, "home.html")

def register(request):
    return render(request, "register.html")
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
    else:
        return render(request, "register.html")
