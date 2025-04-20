import express from 'express'
import { activate, activateAccount, checkEmailIfExist, checkIfUnameExist, createAccount, deactivateAccount, deleteInvite, editAccount, getAccounts, invite, newLink, recoverAccount, resetPassword, verifyResetToken, verifyToken, viewAccount } from '../controller/accountController.js'

const router = express.Router()

router.get('/', getAccounts)
router.get('/verify-token', verifyToken)
router.get('/verify-reset-token', verifyResetToken)
router.get('/check-email',checkEmailIfExist)
router.get('/check-uname',checkIfUnameExist)
router.post('/', createAccount)
router.post('/invite', invite)
router.post('/reset-password', resetPassword)
router.post('/activate',activate)
router.post('/recover',recoverAccount)
router.post('/request-new-link', newLink)
router.delete('/delete-invite', deleteInvite)
router.get('/:id', viewAccount)
router.put('/:id', editAccount)
router.put('/activate/:id', activateAccount)
router.put('/deactivate/:id', deactivateAccount)

export default router