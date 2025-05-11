import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    print(f"Running on port {port} with debug={debug}")
    app.config['protocol'] = "http://"
    app.config['ip'] = "127.0.0.1"
    app.config['port'] = port
    app.config['root'] = f"http://{app.config['ip']}:{port}"
    app.run(host="0.0.0.0", port=port, debug=debug)