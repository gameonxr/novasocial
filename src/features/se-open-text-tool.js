// Story editor text-tool opener.
function seOpenTextTool(){
  document.getElementById('se-text-panel').style.display = 'block';
  document.getElementById('se-text-input').focus();
  seEditingTextId = null;
}
