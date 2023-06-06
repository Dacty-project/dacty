from django.contrib import admin
from django.urls import path, include
from .views import home, register, login, logout, training

urlpatterns = [
    path('', home, name="home"),
    path('register', register, name="register"),
    path('login', login, name="login"),
    path('logout', logout, name="logout"),
    path('training', training, name="training")
]
