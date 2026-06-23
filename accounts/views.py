from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from.serializers import RegisterSerializer
from.models import User
import secrets
from django.core.mail import send_mail

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # 1. Gerar token de verificação
        token = secrets.token_urlsafe(32)
        user.verification_token = token
        user.save()

        # 2. Enviar email - configure EMAIL_BACKEND no settings.py
        verify_url = f"https://yi-sell.com/verify?token={token}"
        send_mail(
            'Verify YI-SELL Account',
            f'Click to verify: {verify_url}',
            'noreply@yi-sell.com',
            [user.email],
            fail_silently=False,
        )

        # 3. Chamar Java service pra criar carteira/conta de trading
        # Exemplo: requests.post('http://java-service:8080/api/wallet/create', json={'user_id': str(user.id)})

        return Response(
            {"message": "Account created! Check your email to verify."},
            status=status.HTTP_201_CREATED
        )

    # Retorna primeiro erro pro frontend
    error_msg = next(iter(serializer.errors.values()))[0]
    if 'email' in serializer.errors and 'unique' in str(serializer.errors['email']):
        return Response({"message": "This email is already registered"}, status=409)

    return Response({"message": error_msg}, status=400)
