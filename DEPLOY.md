# 🚀 Guía de Deploy - Copilot Salud Andalucía

## Despliegue en Vercel (Recomendado)

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Push del código a GitHub**
   ```bash
   git add .
   git commit -m "chore: Preparar aplicación para deploy en Vercel"
   git push origin main
   ```

2. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con tu cuenta de GitHub

3. **Importar proyecto**
   - Click en "Add New Project"
   - Selecciona el repositorio `copilot-salud-react`
   - Vercel detectará automáticamente que es un proyecto Vite

4. **Configurar variables de entorno**
   En la sección "Environment Variables" agrega:
   ```
   VITE_APP_NAME = Copilot Salud Andalucía
   VITE_GROQ_API_KEY = tu_api_key_de_groq_aqui
   ```

5. **Deploy**
   - Click en "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu aplicación estará en: `https://tu-proyecto.vercel.app`

### Opción 2: Deploy desde CLI

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Responde las preguntas (acepta defaults)
   - Configura las variables de entorno cuando te lo pida

4. **Deploy a producción**
   ```bash
   vercel --prod
   ```

---

## 📋 Checklist Post-Deploy

- [ ] Verificar que el login funciona
- [ ] Probar navegación entre páginas
- [ ] Verificar que los KPIs cargan correctamente
- [ ] Probar el mapa interactivo
- [ ] Verificar que el chat AI funciona (requiere GROQ API key configurada)
- [ ] Probar en diferentes dispositivos:
  - [ ] Desktop (Chrome, Firefox, Safari)
  - [ ] Tablet (iPad, Android)
  - [ ] Móvil (iPhone, Android)

---

## 🔧 Configuración de Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Environment Variables"
3. Agrega las siguientes variables:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `VITE_APP_NAME` | Copilot Salud Andalucía | Production, Preview, Development |
| `VITE_GROQ_API_KEY` | `gsk_...` | Production, Preview, Development |

4. Después de agregar variables, haz un nuevo deploy:
   - Ve a "Deployments"
   - Click en los 3 puntos del último deploy
   - Selecciona "Redeploy"

---

## 🌐 Dominio Personalizado (Opcional)

1. En Vercel, ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones
4. Espera propagación (5-30 minutos)

---

## 📊 Monitoreo

Vercel proporciona automáticamente:
- ✅ Analytics de tráfico
- ✅ Logs de requests
- ✅ Métricas de performance (Web Vitals)

Accede desde tu dashboard de Vercel.

---

## 🔄 CI/CD Automático

Una vez configurado, cada push a `main` desplegará automáticamente:
- Push a `main` → Deploy a producción
- Pull Request → Deploy preview automático

---

## 🐛 Troubleshooting

### El chat AI no funciona
- Verifica que `VITE_GROQ_API_KEY` esté configurada en Vercel
- Checa los logs en Vercel Dashboard

### Páginas muestran 404
- Verifica que `vercel.json` tenga las rewrites configuradas
- Asegúrate de que React Router esté en modo `BrowserRouter`

### Build falla
- Revisa los logs del build en Vercel
- Verifica que `npm run build` funcione localmente
- Asegúrate de que no haya errores de TypeScript

### Performance lenta
- Implementa lazy loading (Subsistema 15)
- Optimiza imágenes
- Revisa el bundle size

---

## 📝 Notas

- **Build time**: ~30-40 segundos
- **Deploy time**: ~1-2 minutos total
- **SSL**: Automático (HTTPS)
- **CDN**: Global edge network
- **Costo**: Gratis para proyectos personales

---

**Última actualización**: 07/01/2026
**Documentación oficial**: https://vercel.com/docs
