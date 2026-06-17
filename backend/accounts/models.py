from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Campos extras pro YI-SELL
    trading_enabled = models.BooleanField(default=False)
    kyc_status = models.CharField(max_length=20, default='pending') # pending, approved, rejected

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Django ainda pede username

    def __str__(self):
        return self.email
