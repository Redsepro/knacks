; AutoIt script to generate knacks-index.json
; - Use knacks-list.html (option.value / option text)
; - Reads each file in knacks\ and extracts the text (without HTML tags)
; - Builds knacks-index.json in project root
; - Creates a backup of knacks-index.json if it exists
; Use: Run this script on a local machine with AutoIt3 installed.

#include <Array.au3>

Global Const $QUOTES = '"' & "'"
Global Const $APP_PATH = @ScriptDir & '\'
Global Const $APP_NAME = _removeExt(@ScriptName)
Global Const $MAX_CHARS = _loadINI('General', 'MAX_CHARS', -1) ; Max characters for text in JSON

main()

Func main()
  Local $aKnacks
  Local $aContent
  Local $hFile
  Local $sBackup
  Local $sContent
  Local $sJson
  Local $sJsonFile
  Local $sKnackFile
  Local $sKnacksDir
  Local $sKnacksLines
  Local $sListFile
  Local $sObj
  Local $sPattern
  Local $sRoot
  Local $sText

  ; Create paths
  $sRoot = (StringRight($APP_PATH, 7) = '\tools\' ? StringTrimRight($APP_PATH, 6) : $APP_PATH)
  $sKnacksDir = $sRoot & 'knacks\'
  $sJsonFile = $sRoot & 'knacks-index.json'
  $sListFile = $sRoot & 'knacks-list.html'

  ; Check if knacks list exists
  If Not FileExists($sListFile) Then
    MsgBox(16, $APP_NAME, 'No existe lista de Knacks: ' & $sListFile)
    Exit
  EndIf

  ; Read knacks list file
  $sKnacksLines = FileRead($sListFile)
  If @error Then
    MsgBox(16, $APP_NAME, 'No se pudo leer la lista de Knacks: ' & $sListFile)
    Exit
  EndIf

  ; Extract option values and titles from knacks list
  Local $sPattern = 'value\s*=\s*[' & $QUOTES & ']([^' & $QUOTES & ']+)[' & $QUOTES & '][^>]*>(.*?)<\/option>'
  $aContent = StringRegExp($sKnacksLines, $sPattern, 3)
  If Not IsArray($aContent) Then
    MsgBox(16, $APP_NAME, 'No se encontró información de archivos HTML en la lista: ' & $sListFile)
    Exit
  EndIf

  ; Convert flat array to 2D array
  $aKnacks = _to2DArray($aContent)
  
  ; Add simplify html content to array
  For $i = 1 To $aKnacks[0][0]
    $sKnackFile = $sKnacksDir & $aKnacks[$i][0]
    $sContent = ''
    $sText = ''
    If FileExists($sKnackFile) Then
      $sContent = FileRead($sKnackFile)
      If Not @error Then $sText = _simplifyHtml($sContent)
      $aKnacks[$i][2] = $sText
    Else
      ConsoleWrite('Knack no existe: ' & $sKnackFile & @CRLF)
    EndIf
  Next

  ; Build JSON string
  $sJson = '[' & @CRLF
  Local $iLen
  For $i = 1 To $aKnacks[0][0]
    ; Limit text length according to MAX_CHARS
    Switch $MAX_CHARS
      Case -1
        $sText = $aKnacks[$i][2] ; No limit on text length
      Case 0
        $sText = StringLeft($aKnacks[$i][2], StringLen($aKnacks[$i][2]) / 2) ; Use half the length
      Case Else
        $sText = StringLeft($aKnacks[$i][2], $MAX_CHARS) ; Use Specific text length
    EndSwitch
    $sObj =  '  {' & @CRLF
    $sObj &= '    "file": "' & _escapeJSON($aKnacks[$i][0]) & '",' & @CRLF
    $sObj &= '    "title": "' & _escapeJSON($aKnacks[$i][1]) & '",' & @CRLF
    ;~ $sObj &= '    "text": "' & $sText & '"' & @CRLF
    $sObj &= '    "text": "' & _escapeJSON($sText) & '"' & @CRLF
    $sObj &= '  },' & @CRLF
    $sJson &= $sObj
  Next
  $sJson = StringTrimRight($sJson, 3) & @CRLF & ']' ;& @CRLF

  ; Backup existing index file
  If FileExists($sJsonFile) Then
    $sBackup = $sRoot & 'knacks-index-' & @YEAR & @MON & @MDAY & '-' & @HOUR & @MIN & @SEC & '.bak'
    If FileExists($sBackup) Then FileMove($sBackup, _removeExt($sBackup) & '-1.bak', 1)
    FileMove($sJsonFile, $sBackup)
  EndIf

  ; Create or overwrite JSON
  $hFile = FileOpen($sJsonFile, 2)
  If $hFile = -1 Then
    MsgBox(16, $APP_NAME, 'No se pudo crear índice: ' & $sJson)
    Exit
  EndIf
  FileWrite($hFile, $sJson)
  FileClose($hFile)

  MsgBox(64, $APP_NAME, 'Índice creado')
EndFunc

; <== _escapeJSON =================================================================================
; _escapeJSON(String)
; ; Escapes special characters in a JSON string.
; ;
; ; @param  String          JSON string to escape.
; ; @return String          Escaped JSON string.
; ; @note   Handles control characters, quotes, and backslashes.
Func _escapeJSON($pJSON)
  Local $iASCII
  Local $sCHR
  Local $sText = ''

  ; Check arguments
  If Not IsString($pJSON) Then Return ''

  For $i = 1 To StringLen($pJSON)
    $sCHR = StringMid($pJSON, $i, 1)
    $iASCII = AscW($sCHR)
    Select
      Case $iASCII = 9
        $sText &= '\t'
      Case $iASCII = 10
        $sText &= '\n'
      Case $iASCII = 13
        $sText &= '\r'
      Case $sCHR = '"'
        $sText &= '\"'
      Case $sCHR = '\'
        $sText &= '\\'
        $sText &= $sCHR
      Case $iASCII > 255
        $sText &= '\u' & Hex($iASCII, 4)
      Case Else
        $sText &= $sCHR
    EndSelect
  Next
  Return StringReplace($sText, '\\\', '\\', 0, 2)
EndFunc ; ========================================================================  _escapeJSON ==>
; <== _loadFile ===================================================================================
; _loadFile(String, [Boolean])
; ; Return text file content.
; ;
; ; @param  String          Path to the file.
; ; @param  [Boolean]       True to return content as a line array. Default: False.
; ; @return Str|Str[]       File content as a string or a line array.
Func _loadFile($pFile, $pAsArray = False)
  Local $hFile
  Local $sContent
  Local $iError

  ; Check arguments
  $pFile = StringStripWS(StringReplace($pFile, '/', '\'), 3)
  If Not IsString($pFile) Or StringLen($pFile) = 0 Then Return SetError(1, 1, '')
  If Not FileExists($pFile) Then return SetError(1, 2, '')
  If $pAsArray == Default Or Not IsBool($pAsArray) Then $pAsArray = False

  ; Open file for reading
  $hFile = FileOpen($pFile, 0)
  If $hFile == -1 Then Return SetError(2, @error, '')

  ; Check if file is empty
  If FileGetSize($pFile) = 0 Then
    FileClose($hFile)
    Return SetError(3, 0, '')
  EndIf

  ; Read file content, close file, check for errors and return content
  $sContent = FileRead($hFile)
  $iError = @error
  FileClose($hFile)
  If $iError Then Return SetError(4, $iError, '')
  Return ($pAsArray ? StringSplit(StringRegExpReplace($sContent, '((?<!\x0d)\x0a|\x0d(?!\x0a))', @LF), @LF) : $sContent)
EndFunc ; =========================================================================== _loadFile ==>
; <== _loadINI ====================================================================================
; _loadINI(String, String, [String])
; ; Loads a value from INI file.
; ;
; ; @param  String          Section name in INI file.
; ; @param  String          Key name in section.
; ; @param  [String]        Default value to return if section or key is not found.
; ; @return String          Value found or default value.
Func _loadINI($pSection, $pKey, $pDefault = '') 
  Local $aLines
  Local $iPos
  Local $sIniFile
  Local $sKey
  
  ; Check arguments
  If Not IsString($pSection) Or StringLen($pSection) == 0 Then Return SetError(1, 1, $pDefault)
  If Not IsString($pKey) Or StringLen($pKey) == 0 Then Return SetError(1, 2, $pDefault)

  ; Load configuration from ini file
  $sIniFile = $APP_PATH & $APP_NAME & '.ini'
  $aLines = _loadFile($sIniFile, True)
  If @error Or Not IsArray($aLines) Then Return SetError(2, @error, $pDefault)

  ; Search for key in ini file
  For $i = 1 To $aLines[0]
    If _invalidLine($aLines[$i]) Then ContinueLoop ; Skip empty lines & comments
    If StringCompare('[' & $pSection & ']', $aLines[$i], 2) = 0 Then
      ; Section found, search for key
      For $i = $i + 1 To $aLines[0]
        If StringLeft($aLines[$i], 1) == '[' Then Return SetError(3, 1, $pDefault) ; New section header
        If _invalidLine($aLines[$i]) Then ContinueLoop ; Skip empty lines & comments
              
        $iPos = StringInStr($aLines[$i], '=', 2)
        If $iPos == 0 Then ContinueLoop
        $sKey = StringStripWS(StringLeft($aLines[$i], $iPos - 1), 3)
        If StringCompare($sKey, $pKey, 2) <> 0 Then ContinueLoop ; Key does not match
        Return StringMid($aLines[$i], $iPos + 1) ; Return value after '='
      Next
      Return SetError(3, 2, $pDefault) ; Key not found in section
    EndIf
  Next
  Return SetError(4, 0, $pDefault) ; Section and key not found
EndFunc ; ============================================================================== _loadINI ==>
;; <== _invalidLine =================================================================================
; _invalidLine(ByRef String)
; ; Checks if a line is invalid (empty or comment).
; ;
; ; @param  String          Line to check.
; ; @return Boolean         True if line is invalid, False otherwise.
; ; @note   Strips whitespace on passed argument.
Func _invalidLine(ByRef $pLine)
  $pLine = StringStripWS($pLine, 3)
  Return (StringLen($pLine) == 0 Or StringLeft($pLine, 1) = ';') ; Skip empty lines & comments
EndFunc ; ======================================================================== _invalidLine ==>
; <== _removeExt ==================================================================================
; _removeExt(String)
; ; Removes file extension from path.
; ;
; ; @param  String          Path to process.
; ; @return String          Path without file extension.
Func _removeExt($pPath)
  If Not IsString($pPath) Then Return ''
  Return StringRegExpReplace($pPath, '\.[^.\\/]+$', '')
EndFunc ; ========================================================================== _removeExt ==>
; <== _simplifyHtml ===============================================================================
; _simplifyHtml(String)
; ; Simplifies HTML content by removing scripts, styles, and tags.
; ;
; ; @param  String          HTML content to simplify.
; ; @param  String          Optional line break replacement. Default: '\\n'.
; ; @return String          Simplified text content.
; ; @note   Removes script and style tags, replaces <br> and </p> with line breaks, removes all
; ;         remaining tags, replaces common HTML entities and strips and collapses spaces.
Func _simplifyHtml($pHtml, $pBreak = ' ')
  ; Check arguments
  If Not IsString($pHtml) Then Return ''
  If $pBreak = Default Or StringLen($pBreak) = 0 Then $pBreak = ' '

  ; Remove scripts and styles
  $pHtml = StringRegExpReplace($pHtml, '(?is)<script.*?>[\s\S]*?</script>', '')
  $pHtml = StringRegExpReplace($pHtml, '(?is)<style.*?>[\s\S]*?</style>', '')
  ; Replace <br>, </p> and @CRLF with breaks
  $pHtml = StringRegExpReplace($pHtml, '(?i)<br\s*/?>', $pBreak)
  $pHtml = StringRegExpReplace($pHtml, '(?i)</p>', $pBreak)
  $pHtml = StringRegExpReplace($pHtml, '[\n\r]+', $pBreak)
  ; Remove all remaining tags
  $pHtml = StringRegExpReplace($pHtml, '<[^>]+?>', ' ')
  ; Common entities
  $pHtml = StringReplace($pHtml, '&nbsp;', ' ')
  $pHtml = StringReplace($pHtml, '&amp;', '&')
  $pHtml = StringReplace($pHtml, '&lt;', '<')
  $pHtml = StringReplace($pHtml, '&gt;', '>')
  $pHtml = StringReplace($pHtml, '&quot;', '"')
  $pHtml = StringReplace($pHtml, '&apos;', "'")
  ; Remove words (including accetned letters and diacritics with less than 3 characters
  $pHtml = StringRegExpReplace($pHtml, '(?i)((?<=\s)[a-záéíóúñ]{1,2}\s)', ' ')

  ; Strip and colapse spaces
  $pHtml = StringStripWS($pHtml, 7)
  Return $pHtml
EndFunc ; ======================================================================  _simplifyHtml ==>
; <== _to2DArray[][] ==============================================================================
; _to2DArray(String)
; ; Converts a flat array into a 2D array.
; ;
; ; @param  String[]        Array to convert.
; ; @return String[][]      One-based 2D array.
Func _to2DArray($pArray)
	Local $aReturn = [[0, '', '']]
	Local $iCount
	Local $iIndex = 1

	If Not IsArray($pArray) Then Return SetError(1, 0, $aReturn)
	$iCount = UBound($pArray)

	Dim $aReturn[$iCount / 2 + 1][3]
	For $i = 0 To $iCount - 1
		If Mod($i, 2) Then
			$aReturn[$iIndex][1] = $pArray[$i]
			$iIndex += 1
		Else
			$aReturn[$iIndex][0] = StringStripWS($pArray[$i], 3)
		EndIf
	Next
	$aReturn[0][0] = $iIndex - 1
	Return $aReturn
EndFunc ; ====================================================================== _to2DArray[][] ==>
