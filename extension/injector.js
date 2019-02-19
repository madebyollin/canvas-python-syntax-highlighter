function injectStyle(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var link = document.createElement('link');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', file_path);
    node.appendChild(link);
}
function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}
injectScript(chrome.extension.getURL('highlight.js'), 'body');
injectScript(chrome.extension.getURL('fixer.js'), 'body');
injectStyle(chrome.extension.getURL('syntax.css'), 'body');
