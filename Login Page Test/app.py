from flask import Flask, redirect, render_template, url_for
from flask_bcrypt import Bcrypt
from flask_login import (LoginManager, UserMixin, current_user, login_required,
                         login_user, logout_user)
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, SubmitField, ValidationError
from wtforms.validators import EqualTo, InputRequired, Length
app = Flask(__name__)


#============= USER AUTHENTICATION =============#

db = SQLAlchemy()
bcrypt = Bcrypt(app)
# configure the SQLite database, relative to the INSTANCE FOLDER!!!
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'mysecretkey'
db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = 'login' # type: ignore
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


"""Represents a user in the application.

This class inherits from SQLAlchemy's `db.Model` and Flask-Login's `UserMixin`.
It defines a database table `users` with columns `id`, `username`, and `password`.

Attributes:
    id (int): A unique identifier for the user. This is a primary key in the database.
    username (str): The user's unique username. This is a required field and cannot be
        null or empty. The maximum length of the username is 20 characters.
    password (str): The user's password. This is a required field and cannot be null or
        empty. The password is stored in the database as a hash with a length of 60
        characters.

"""


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)


"""Defines a Flask form for user registration.

This form contains fields for username, password, and confirmation of password.
Each field is validated using various validators from the WTForms library.
If all fields are valid, the user can submit the form to sign up.

Attributes:
    username (StringField): A field for the user's desired username. It is required
        and must be between 4 and 20 characters long.
    password (PasswordField): A field for the user's desired password. It is required
        and must be between 8 and 20 characters long.
    confirm_password (PasswordField): A field for confirming the user's password.
        It is required and must match the value of the password field.
    submit (SubmitField): A button to submit the form and sign up.

"""


class RegisterForm(FlaskForm):
    username = StringField('username', validators=[
                           InputRequired(), Length(min=4, max=20)])
    password = PasswordField('password', validators=[
                             InputRequired(), Length(min=8, max=20)])
    confirm_password = PasswordField('confirm_password', validators=[
                                     InputRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')


class LoginForm(FlaskForm):
    username = StringField('username', validators=[
                           InputRequired(), Length(min=4, max=20)])
    password = PasswordField('password', validators=[
                             InputRequired(), Length(min=8, max=20)])
    submit = SubmitField('Log In')


def validate_username(self, username):
    user_object = User.query.filter_by(username=username.data).first()
    if user_object:
        raise ValidationError(
            'Username already exists. Please choose a different one.')


with app.app_context():
    db.create_all()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        # checks if the user actually exists
        user_object = User.query.filter_by(username=form.username.data).first()
        # take the user-supplied password, hash it, and compare it to the hashed password in the database
        if user_object:
            # if the user exists and the password is right, then we want to log them in
            if bcrypt.check_password_hash(user_object.password, form.password.data):
                login_user(user_object)
                return redirect(url_for('dashboard'))
    # if the user doesn't exist or password is wrong, reload the page
    return render_template('login.html', form=form)


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/dashboard', methods=['GET', 'POST'])
@login_required
def dashboard():
    return render_template('dashboard.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    # validate_on_submit() checks if it is a POST request and if it is valid
    if form.validate_on_submit():
        # hash the password
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        # create a new user model object
        new_user = User(username=form.username.data, password=hashed_password)
        # add the new user to the database
        db.session.add(new_user)
        # commit the changes
        db.session.commit()
        return redirect(url_for('login'))
    # if the form is not valid, render the register template
    return render_template('register.html', form=form)


if __name__ == '__main__':
    app.run(debug=True)
