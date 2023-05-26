from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages

# Create your views here.

def home(request):
    return render(request, "home.html")

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        if (User.objects.filter(username=username)).exists():
            messages.info(request, "Username already exist")
            return redirect('register')
        else:
            user = User.objects.create_user(username=username, password=password, email=email)
            user.set_password(password)
            user.save()
            return redirect('login')
    else:
        return render(request, "register.html")

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('None')
        else:
            messages.info(request, 'Invalid User / Password')
            return redirect('login')
    return render(request, "login.html")