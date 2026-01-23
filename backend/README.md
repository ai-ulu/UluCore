# UluCore Backend

Bu klasör, UluCore projesinin backend servislerini içerir. Proje, Python tabanlıdır ve bağımlılık yönetimi için Poetry kullanmaktadır.

## Kurulum

Başlamadan önce sisteminizde Python 3.9+ ve Poetry'nin kurulu olduğundan emin olun.

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/agiulucom42-del/UluCore.git
    cd UluCore/backend
    ```

2.  **Bağımlılıkları Yükleyin:**
    Proje bağımlılıklarını yüklemek için `poetry` kullanın. Bu komut, `pyproject.toml` dosyasını okuyacak ve gerekli paketleri sanal bir ortama kuracaktır.
    ```bash
    poetry install
    ```

## Çalıştırma

Backend servisini (API) başlatmak için aşağıdaki komutu çalıştırın. Bu, Uvicorn ASGI sunucusunu kullanarak uygulamayı başlatacaktır.

```bash
poetry run uvicorn app.main:app --reload
```

Sunucu varsayılan olarak `http://127.0.0.1:8000` adresinde çalışmaya başlayacaktır. `--reload` bayrağı, kodda bir değişiklik yaptığınızda sunucunun otomatik olarak yeniden başlatılmasını sağlar, bu da geliştirme sürecini kolaylaştırır.

## Testler

Projenin testlerini çalıştırmak için aşağıdaki komutu kullanın:

```bash
poetry run pytest
```

Bu komut, `tests/` klasöründeki tüm testleri keşfedecek ve çalıştıracaktır.
