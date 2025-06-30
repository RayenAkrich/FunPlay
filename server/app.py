from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import MySQLdb.cursors
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

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
    user_id = cursor.lastrowid
    cursor.close()
    return jsonify({
        'message': 'Inscription réussie !',
        'user': {
            'id': user_id,
            'nickname': name,
            'loginStreak': 1,
            'is_guest': False
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Champs manquants'}), 400
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, nickname, pwd, loginStreak, last_login, is_guest FROM users WHERE email=%s', (email,))
    user = cursor.fetchone()
    if not user or not check_password_hash(user['pwd'], password):
        cursor.close()
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
    # Login streak logic (only for registered users)
    loginStreak = user['loginStreak'] or 0
    last_login = user['last_login']
    today = datetime.now().date()
    show_streak = False
    if not user['is_guest']:
        if last_login:
            last_login_date = last_login.date() if isinstance(last_login, datetime) else datetime.strptime(str(last_login), '%Y-%m-%d %H:%M:%S').date()
            if last_login_date == today - timedelta(days=1):
                loginStreak += 1
                show_streak = True
            elif last_login_date != today:
                loginStreak = 1
                show_streak = True
            # else: already logged in today, don't increment
        else:
            loginStreak = 1
            show_streak = True
        # Update loginStreak and last_login
        cursor.execute('UPDATE users SET loginStreak=%s, last_login=NOW() WHERE id=%s', (loginStreak, user['id']))
        mysql.connection.commit()
    cursor.close()
    msg = None
    if show_streak:
        msg = f"Bienvenue {user['nickname']} ! Série de connexions {loginStreak} jours, continuez comme ça !"
    return jsonify({'message': msg or f"Bienvenue {user['nickname']} !", 'user': {'id': user['id'], 'nickname': user['nickname'], 'loginStreak': loginStreak, 'is_guest': bool(user['is_guest']), 'message': msg}}), 200

@app.route('/api/guest', methods=['POST'])
def guest_login():
    cursor = mysql.connection.cursor()
    # Find the next available GuestNUMBER
    i = 1
    while True:
        guest_nick = f"Guest{i}"
        cursor.execute('SELECT id FROM users WHERE nickname=%s', (guest_nick,))
        if not cursor.fetchone():
            break
        i += 1
    cursor.execute('INSERT INTO users (nickname, email, pwd, is_guest) VALUES (%s, %s, %s, %s)', (guest_nick, f"{guest_nick.lower()}@guest.funplay", '', 1))
    mysql.connection.commit()
    user_id = cursor.lastrowid
    cursor.close()
    return jsonify({'message': f"Bienvenue {guest_nick} (invité) !", 'user': {'id': user_id, 'nickname': guest_nick, 'is_guest': True}}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    print('Exception:', e)
    return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
