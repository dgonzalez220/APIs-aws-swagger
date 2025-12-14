#!/bin/bash
# Script para actualizar IP automáticamente en Swagger

echo "🔄 Actualizando IP en configuración Swagger..."

# Obtener IP pública actual
IP_ACTUAL=$(curl -s http://checkip.amazonaws.com)
echo "🌐 IP Detectada: $IP_ACTUAL"

# Archivos a actualizar
ARCHIVOS=(
  "index_usuarios.js"
  "index_productos.js" 
  "index_detalleBoleta.js"
  "index_categorias.js"
  "index_boletas.js"
)

# Actualizar CADA archivo
for archivo in "${ARCHIVOS[@]}"; do
  if [ -f "$archivo" ]; then
    echo "📝 Procesando: $archivo"
    
    # Reemplazar cualquier IP antigua (patrón: http://IP:puerto)
    sed -i "s|http://[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+:[0-9]\+|http://$IP_ACTUAL:\$PORT|g" "$archivo"
    
    # También reemplazar TU_IP_AWS si existe
    sed -i "s/TU_IP_AWS/$IP_ACTUAL/g" "$archivo"
    
    echo "  ✅ $archivo actualizado"
  else
    echo "  ⚠️ $archivo no encontrado"
  fi
done

echo ""
echo "🎯 Configuración actualizada:"
echo "   Local: http://localhost:4002/api-docs"
echo "   Internet: http://$IP_ACTUAL:4002/api-docs"
echo ""
echo "🔄 Reiniciando APIs..."
pm2 restart all

echo ""
echo "✅ ¡Listo! Accede a Swagger desde:"
echo "   http://$IP_ACTUAL:4002/api-docs"
echo "   http://$IP_ACTUAL:4003/api-docs"
echo "   http://$IP_ACTUAL:4004/api-docs"
echo "   http://$IP_ACTUAL:4005/api-docs"
echo "   http://$IP_ACTUAL:4006/api-docs"
