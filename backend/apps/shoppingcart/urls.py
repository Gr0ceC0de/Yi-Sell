from django.urls import path
from . import views

app_name = 'shoppingcart'

urlpatterns = [
    path('', views.index, name='index'),
]
