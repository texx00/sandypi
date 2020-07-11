Set objArgs = WScript.Arguments
For Each strArg in objArgs
    Set WshShell = CreateObject("WScript.Shell")
    cmds=WshShell.RUN(strArg, 0, False)
    Set WshShell = Nothing
Next