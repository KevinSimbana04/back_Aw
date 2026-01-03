import {Router} from 'express'
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword,login, recuperarPassword, registro } 
from '../controllers/administradorController.js'

const router = Router()

router.post('/admin/registro',registro)
router.get('/admin/confirmar/:token',confirmarMail)

router.post('/admin/recuperarpassword',recuperarPassword)
router.get('/admin/recuperarpassword/:token',comprobarTokenPassword)
router.post('/admin/nuevopassword/:token',crearNuevoPassword)

router.post('/admin/login',login)

export default router