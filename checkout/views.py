from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt


def checkout_simples(request):
    return render(request, 'form.html')


@csrf_exempt
def processar_pagamento(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        telefone = request.POST.get('telefone')

        print(f"PEDIDO: {nome} | {email} | {telefone}")

        return redirect('https://link.infinitepay.io/yakelin-yisel/VC1DLUMtSQ-liQolwtIXB-899,99')

    return redirect('/checkout/pagar')