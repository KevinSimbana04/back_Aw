import {Router} from 'express'
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword,login, recuperarPassword, registro } 
from '../controllers/estudianteController.js'

const router = Router()


router.post('/registro',registro)
router.get('/confirmar/:token',confirmarMail)

router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)

router.post('/estudiante/login',login)

export default router