@echo off
echo 正在启动 Elasticsearch...
start "" "D:\ATools\elasticsearch-7.17.22-windows-x86_64\elasticsearch-7.17.22\bin\elasticsearch.bat"
timeout /t 10 /nobreak >nul

echo 正在启动 Kibana...
start "" "D:\ATools\elasticsearch-7.17.22-windows-x86_64\kibana-7.17.22-windows-x86_64\bin\kibana.bat"

echo Elasticsearch 和 Kibana 已启动！