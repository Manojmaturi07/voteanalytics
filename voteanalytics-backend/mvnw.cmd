@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

SET ERROR_CODE=0

IF "%OS%"=="Windows_NT" @SETLOCAL

SET "BASE_DIR=%~dp0"
IF "%BASE_DIR:~-1%"=="\" SET "BASE_DIR=%BASE_DIR:~0,-1%"

IF NOT "%JAVA_HOME%" == "" (
  SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
) ELSE (
  IF EXIST "C:\Program Files\Java\jdk-21\bin\java.exe" (
    SET "JAVACMD=C:\Program Files\Java\jdk-21\bin\java.exe"
  ) ELSE (
    SET "JAVACMD=java.exe"
  )
)

SET "WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

"%JAVACMD%" "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" -classpath "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@EXIT /B %ERROR_CODE%
