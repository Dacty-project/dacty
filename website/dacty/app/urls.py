from django.contrib import admin
from django.urls import path, include
from .views import home, register

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name="home"),
    path('register', register, name="register")
]
