

# alembic function used to check if a table must be or not added to the migration.
# in this case is removing all the tables that are starting with "_" because are tables that are created at runtime and their number varies between different installations
# if the structure of one of those tables is modified must use a custom migration script to update previous tables
def include_object(object, name, type_, reflected, compare_to):
    # ignore all the tables starting with "_" (like playlist elements tables)
    if type_ == "table" and name.startswith("_"):
        return False
    else:
        return True