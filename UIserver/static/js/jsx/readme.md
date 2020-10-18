# JSX files

This project uses JSX files.
JSX must be built into js files to be usable from a browser: this is done through the module "babel".

Do not change the js file output. Instead, change the jsx file output and compile it with the module.
To run the module on windows it is possible to use "start_jsx_babel.bat" available in the dev_tools folder. (`(env)$> cd dev_tool & start_jsx_babel.bat`)
The module will automatically detect any change to a jsx file and will compile it to the js counterpart automatically.

### File header
The module is set to add a common header to every file. The header can be changed in the UIserver/static/js/.babelrc file