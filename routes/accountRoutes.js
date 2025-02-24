import express from 'express'
import { activateAccount, createAccount, deactivateAccount, ediAccount, getAccounts, viewAccount } from '../controller/accountController.js'

const router = express.Router()

router.get('/', getAccounts)
router.post('/', createAccount)
router.get('/:id', viewAccount)
router.put('/:id', ediAccount)
router.put('/activate/:id', activateAccount)
router.put('/deactivate/:id', deactivateAccount)

export default router