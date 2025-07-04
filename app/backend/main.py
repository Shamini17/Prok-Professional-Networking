from dotenv import load_dotenv
from app import get_app

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    app = get_app()
    app.run(debug=True, host='0.0.0.0', port=5000) 