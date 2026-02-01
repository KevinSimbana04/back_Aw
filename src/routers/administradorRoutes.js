import { Router } from 'express'
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro, listarAdministradores, actualizarAdministrador, eliminarAdministrador, obtenerEstadisticas }
    from '../controllers/administradorController.js'
import { verificarTokenJWT } from '../middleware/JWT.js'

const router = Router()

router.post('/admin/registro', verificarTokenJWT, registro)
router.get('/admin/confirmar/:token', confirmarMail)

router.post('/admin/recuperarpassword', recuperarPassword)
router.get('/admin/recuperarpassword/:token', comprobarTokenPassword)
router.post('/admin/nuevopassword/:token', crearNuevoPassword)

router.post('/admin/login', login)

router.get('/admin/listar', verificarTokenJWT, listarAdministradores)
router.put('/admin/actualizar/:id', verificarTokenJWT, actualizarAdministrador)
router.delete('/admin/eliminar/:id', verificarTokenJWT, eliminarAdministrador)
router.get('/admin/estadisticas', verificarTokenJWT, obtenerEstadisticas)

export default router