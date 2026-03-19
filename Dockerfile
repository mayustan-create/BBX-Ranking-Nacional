FROM python:3.11-slim

WORKDIR /app

# Copiar arquivos necessários
COPY server.py .
COPY data_loader.py .
COPY requirements-minimal.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements-minimal.txt

# Expor porta
EXPOSE 8080

# Comando para rodar
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
