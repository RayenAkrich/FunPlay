from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import MySQLdb.cursors
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Config MySQL
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'  
app.config['MYSQL_DB'] = 'funplay'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'message': 'Champs manquants'}), 400
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM users WHERE nickname=%s OR email=%s', (name, email))
    if cursor.fetchone():
        return jsonify({'message': 'Nom ou email déjà utilisé'}), 409
    hashed_pwd = generate_password_hash(password)
    cursor.execute('INSERT INTO users (nickname, email, pwd) VALUES (%s, %s, %s)', (name, email, hashed_pwd))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Inscription réussie !'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Champs manquants'}), 400
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, nickname, pwd FROM users WHERE email=%s', (email,))
    user = cursor.fetchone()
    if not user or not check_password_hash(user['pwd'], password):
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
    cursor.close()
    return jsonify({'message': f"Bienvenue {user['nickname']} !", 'user': {'id': user['id'], 'nickname': user['nickname']}}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    print('Exception:', e)
    return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
