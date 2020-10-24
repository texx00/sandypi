:: This file can be used to run babel to compile jsx files into js files
:: Open the command in a new terminal.
:: Close the terminal or use CTRL+C to stop the process
:: Check also server/static/js/jsx/readme.md


cd ../server/static/js/

npx babel --watch jsx --out-dir fromjsx
