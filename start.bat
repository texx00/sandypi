SETCONSOLE /hide   :: Comment this line to make the console visible sat startup
G:
cd G:\Luca\Progetti\zensmooth\code\pi
call .\env\Scripts\activate.bat
SET FLASK_APP=UIserver
SET FLASK_ENV=development
echo Server starting
flask run --host=0.0.0.0
