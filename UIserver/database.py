from UIserver import db
from datetime import datetime

class UploadedFiles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(80), unique=False, nullable=False)
    up_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) # to update: datetime.datetime.utcnow()
    edit_date = db.Column(db.DateTime, default=datetime.utcnow)
    #last_drawn_date = db.Column(db.DateTime)

    def __repr__(self):
        return '<User %r>' % self.filename

# this method should be used only during the installation or the update of the server and only by the setup.py script
def DBUpdate():
    print("Dropping database")
    db.drop_all()       # in a future version, instead of deleting the tables everytime it will update the structure of the tables with new columns or what it is necessary
    print("Creating database")
    db.create_all()

# The tables are created from a Model
# If this file is run as the main file it will create the necessary tables
# For development purposes, when significant changes are done to the db structure it is possible to drop all the tables and create them again like this:
# enter the python command line
#  > from UIserver import db
#  > db.drop_all()  -> will delete all the tables with their content
#  > db.create_all()  -> recreate all the tables with all the modifications

# this script should be run during the installation to create the database (just the first time)
if __name__ == "__main__":
    db.create_all()