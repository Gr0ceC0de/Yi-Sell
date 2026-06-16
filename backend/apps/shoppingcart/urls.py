from django.urls import path
from . import views

app_name = 'shoppingcart'

urlpatterns = [
    path('', views.index, name='index'),
]
from django.urls import path
from django.http import HttpResponse

def index(request):
    return HttpResponse("Yi$el Shopping Cart OK!")

urlpatterns = [
    path('', index, name='index'),
]
