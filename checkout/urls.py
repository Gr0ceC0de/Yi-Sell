from django.urls import path
from . import views

urlpatterns = [
    path('pagar', views.checkout_simples, name='pagar'),
    path('processar', views.processar_pagamento, name='processar'),
]