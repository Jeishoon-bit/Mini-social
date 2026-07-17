# Contribuir a Mini Social

¡Gracias por tu interés en contribuir! Este documento tiene las pautas básicas para colaborar.

## 📋 Requisitos

- Node.js >= 18
- npm, bun o yarn
- Cuenta en GitHub

## 🍴 Flujo de trabajo

### 1. Fork y clonar

```bash
git clone https://github.com/tu-usuario/mini-social.git
cd mini-social
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

### 2. Crear una rama

Usa prefijos para los nombres de rama:

| Prefijo | Uso |
|---------|-----|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `docs/` | Cambios en documentación |
| `style/` | Cambios de formato/estilo |
| `refactor/` | Refactorización de código |
| `test/` | Tests nuevos o corregidos |

```bash
git checkout -b feat/nombre-descriptivo
```

### 3. Desarrollar

- Sigue el estilo de código existente (TypeScript, Tailwind CSS).
- Los componentes van en `src/components/`.
- Las rutas API van en `src/app/api/`.
- Usa componentes de `shadcn/ui` siempre que sea posible.
- Escribe commits descriptivos.

### 4. Probar antes de enviar

```bash
npm run lint        # Verificar que no haya errores
npm run build      # Verificar que compile correctamente
npm run dev        # Probar la app en el navegador
```

### 5. Push y Pull Request

```bash
git push origin feat/nombre-descriptivo
```

Luego abre un Pull Request desde GitHub con una descripción clara de los cambios.

## 📐 Convenciones

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar dark mode
fix: corregir toggle de follow
docs: actualizar README con instrucciones de instalación
```

### Código

- **TypeScript** estricto en todos los archivos.
- **Tailwind CSS** para estilos (no CSS puro).
- **Componentes shadcn/ui** sobre componentes custom.
- Nombres de componentes en PascalCase.
- Nombres de archivos de rutas API en `route.ts`.

### Errores en la API

Todas las rutas API deben manejar:

| Código | Caso |
|--------|------|
| `200` | Éxito |
| `201` | Recurso creado |
| `400` | Datos inválidos |
| `401` | No autenticado |
| `403` | Sin permisos |
| `404` | No encontrado |
| `500` | Error interno |

## 🐛 Reportar bugs

Abre un [Issue](../../issues) con:

1. **Descripción** del problema.
2. **Pasos para reproducirlo**.
3. **Comportamiento esperado** vs **comportamiento actual**.
4. **Capturas de pantalla** si es posible.
5. **Entorno** (OS, Node.js version, navegador).

## 💡 Sugerencias

Abre un [Issue](../../issues) con la etiqueta `enhancement` describiendo:

1. La funcionalidad sugerida.
2. Por qué sería útil.
3. Una propuesta de implementación (opcional).

## 📜 Licencia

Al contribuir, aceptas que tu código se distribuirá bajo la licencia **MIT** del proyecto.
