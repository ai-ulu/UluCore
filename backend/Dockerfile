# Python imajını temel al
FROM python:3.12-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Poetry'yi yükle
RUN pip install poetry

# Bağımlılık dosyalarını kopyala
COPY pyproject.toml /app/

# Poetry'nin sanal ortam oluşturmasını engelle ve bağımlılıkları yükle
RUN poetry config virtualenvs.create false && poetry lock && poetry install --no-root --no-interaction --no-ansi

# Uygulama kodunu kopyala
COPY . /app

# Uygulamayı çalıştır
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
