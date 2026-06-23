from django.urls import path
from.views import register_user

urlpatterns = [
    path('auth/register/', register_user, name='register'),
]
