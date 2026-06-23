from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'confirmPassword') # name vem do AbstractUser como first_name

    def validate(self, attrs):
        if attrs['password']!= attrs['confirmPassword']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        user = User.objects.create_user(
            username=validated_data['email'], # Django exige username
            email=validated_data['email'],
            first_name=validated_data['name'],
            password=validated_data['password']
        )
        return user
