from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-yi-sell-dev-key-trocar-em-prod-2026'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.shoppingcart',
    'apps.TradingTools',
    'apps.classifieds',
    'apps.headlines',
    'apps.market_over_view',
    'apps.PropertiesCaracas',
    'apps.analytics',
    # 'rest_framework',  # ERRO: DUPLICADO - comentado
    # 'corsheaders',     # ERRO: DUPLICADO - comentado
    'accounts',
    'checkout', # ADICIONADO: nosso app de pagamento
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # tem que ser o primeiro
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'corsheaders.middleware.CorsMiddleware', # ERRO: DUPLICADO - comentado
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ERRO: DATABASES TAVA COM ESTRUTURA ERRADA
# Você colocou 'default' dentro de 'default'. Corrigido:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
    # Quando for usar Postgres, descomenta isso e comenta o sqlite3 acima:
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql',
    #     'NAME': 'yisell_db',
    #     'USER': 'yisell_user',
    #     'PASSWORD': 'senha_forte',
    #     'HOST': 'localhost',
    #     'PORT': '5432',
    # }
}

AUTH_USER_MODEL = 'accounts.User'

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'seu@email.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'senha_app')

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "https://yi-sell.com",
    "http://localhost:3000",
    "https://gr0cec0de.github.io", # ADICIONADO: seu GitHub Pages
]
CORS_ALLOW_ALL_ORIGINS = True # True só pra dev. Em prod deixa False

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ]
}

# ADICIONADO: Config Efí Bank Pix
GN_CLIENT_ID = os.getenv('GN_CLIENT_ID')
GN_CLIENT_SECRET = os.getenv('GN_CLIENT_SECRET')
GN_PIX_KEY = os.getenv('GN_PIX_KEY')
GN_SANDBOX = os.getenv('GN_SANDBOX', 'True') == 'True'
GN_PIX_CERT = BASE_DIR / 'certs/certificado.pem'

# ADICIONADO: Config MQL5
MQL5_SECRET = os.getenv('MQL5_SECRET')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')