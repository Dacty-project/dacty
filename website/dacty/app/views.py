from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages

# Create your views here.

def home(request):
    if request.user.is_authenticated:
        return render(request, "home.html")
    else:
        return redirect('login')

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        if (len(username) < 5 or len(password) < 5):
            messages.info(request, "User / Password length must be > 5")
            return redirect('register')
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

        if (len(username) == 0 or len(password) == 0):
            messages.info(request, 'Invalid User / Password')
            return redirect('login')

        try:
            user = auth.authenticate(username=username, password=password)

            if user is not None:
                auth.login(request, user)
                return redirect('home')
            else:
                messages.info(request, 'Invalid User / Password')
                return redirect('login')
        except:
            messages.info(request, 'Invalid User / Password')
            return redirect('login')
    return render(request, "login.html")

def logout(request):
    auth.logout(request)
    return redirect('/')

def training(request):
    if request.method == 'POST':
        pass
    if request.user.is_authenticated:
        return render(request, "training.html")
    else:
        return redirect('login')